/**
 * hyperloop compiler
 */

var Uglify = require('uglify-js'),
	crypto = require('crypto'),
	_ = require('underscore');

const RESERVED_SYMBOLS = /^hyperloop_(compiler|class|import|memory)$/;


/**
 * turn an AST node array into a JS array
 */
function makeArrayFromArg(arg, node) {
	var array = [];
	if (arg.elements && arg.elements.length) {
		arg.elements.forEach(function(a){
			if (a.value) {
				array.push(a.value);
			}
			else if (a.name) {
				var value = (node && node.scope || node.expression && node.expression.scope) ? (node.scope ? (node.scope) : (node.expression.scope)).find_variable(a.name) : null;
				array.push(value || a.name);
			}
		});
	}
	return array;
}

/**
 * turn an AST node value into a JS value
 */
function toValue(value, node) {
	if (!value) return null;

	if (value.elements) {
		value = makeArrayFromArg(value,node);
	}
	else if (value.properties) {
		value = makeDictionaryFromArg(value,node);
	}
	else if (value.value) {
		value = value.value;
	}
	else if (value.name) {
		// this is a dynamic value look it up
		var v = value.scope.find_variable(value.name);
		if (!v) {
			// variable was not found
			throw new Error("Couldn't find variable named: "+value.name+" at "+value.start.file+" on "+value.start.line+":"+value.start.col);
		}
		value = toValue(v.init,node);
	}
	else if (value.left && value.right && value.operator) {
		// this is an expression
		value = evalExpression(node,value);
	}
	return value;
}

/**
 * attempt to static evaluate an AST expression into a JS string
 */
function evalExpression(node, arg) {
	var scope = {},
		expr = [],
		vars = node.expression.scope ? node.expression.scope.variables._values : node.expression.expression.scope.variables._values,
		fn;
	//expand our scope into function args that we can invoke to resolve the value
	for (var k in vars) {
		var v = vars[k].init.value;
		scope[k.substring(1)] = v;
		expr.push(v);
	}
	try {
		fn = "(function("+Object.keys(scope).join(",")+"){ return " + arg.left.print_to_string() + arg.operator + arg.right.print_to_string() + "; })";
		var expression = eval(fn);
		return expression.apply(scope,expr);
	}
	catch(E){
		var r = /(\w) is not defined/,
			m = r.exec(E.message);
		if (m) {
			throw new Error("can't seem to determine value of '"+m[1]+"' during import at "+node.start.file+' on line '+node.start.line);
		}
		throw E;
	}
}

/**
 * turn a AST node dictionary into a JS dictionary
 */
function makeDictionaryFromArg(arg, node) {
	var obj = {};
	arg.properties.forEach(function(p){
		obj[p.key] = toValue(p.value,node);
	});
	return obj;
}

function nodeIsArray(node) {
	return node.elements && typeof(node.elements)==='object';
}

function nodeIsObjectLiteral(node) {
	return node.properties && typeof(node.properties)==='object';
}

function compile (source, filename, sourcefile) {
	// preprocess source. in the future we'll want to break this out
	// into a real pre-processor class that we can extend for additional
	// functionality like @ifdef, etc.
	['import','compiler','class','memory'].forEach(function(sym){
		var re = new RegExp('@'+sym,'g');
		source = source.replace(re,'hyperloop_'+sym);
	});

	var ast = Uglify.parse(source,{
		filename:filename
	});
	ast.figure_out_scope();

	var transfomer = new Uglify.TreeTransformer(null, function(node,descend){
		// console.log(node.TYPE, '=>', node.print_to_string());
		if (node instanceof Uglify.AST_SimpleStatement) {
			// check to see if we're attempting to evaluate one of our reserved symbols
			if (node.body && node.body.expression && RESERVED_SYMBOLS.test(node.body.expression.name) && node.body.args && node.body.args.length) {
				var arg = node.body.args[0];
				switch(node.body.expression.name) {
					case 'hyperloop_compiler': {
						var obj = makeDictionaryFromArg(arg,node.body);
						sourcefile.processCompiler(node,obj);
						return new Uglify.AST_EmptyStatement();
					}
					case 'hyperloop_import': {
						sourcefile.processImport(node,toValue(arg,node));
						return new Uglify.AST_EmptyStatement();
					}
				}
			}
		}
		else if (node instanceof Uglify.AST_Var) {
			for (var i=0;i<node.definitions.length;i++) {
				var def = node.definitions[i],
					name = def.name.name,
					value = def.value;
				if(value && value.expression && value.expression.name==='hyperloop_memory') {
					// ignore
					continue;
				}
			}
			return node;
		}
		else if (node instanceof Uglify.AST_New) {
			// check to see if we're attempting to instantiate one of our classes
			if (node.expression && node.expression.name && !node.expression.scope.find_variable(node.expression.name)) {

				// create an array of the loaded symbol names
				var syms = _.map(sourcefile.symbols, function(sym) {
					switch(sym.type) {
						case 'class':
							return sym.className;
						case 'symbol':
						default:
							return sym.value;
					}
				});

				// If this is a native symbol, process the instance creation
				if (_.contains(syms, node.expression.name)) {
					var newSymbol = sourcefile.processNewClass(node,node.expression.name);
					var args = [];
					node.args.forEach(function(arg){
						args.push(arg.print_to_string());
					});
					return new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
				}
			}
		}
		else if (node instanceof Uglify.AST_Call) {
			// check to see if we're attempting to call one of our static functions
			if (node.expression && node.expression.name && (!(RESERVED_SYMBOLS.test(node.expression.name))) && !node.expression.scope.find_variable(node.expression.name)) {
				var args = [];
				node.args.forEach(function(arg){
					args.push(arg.print_to_string());
				});
				var newSymbol = sourcefile.processFunction(node,node.expression.name,args);
				return new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
			}
			else if (node.expression && node.expression.name=='hyperloop_memory') {
				var size = '';
				if (node.args && node.args.length) {
					size = parseInt(node.args[0].print_to_string());
				}
				sourcefile.requiresMemory();
				return new Uglify.AST_SymbolConst({name: 'new JSBuffer('+size+')'});
			}
			else if (node.expression && node.expression.name=='hyperloop_class') {
				var className = node.args[0].value,
					extendsName = node.args[1].name,
					interfaces = node.args[2].elements.map(function(v){return v.value||v.name}),
					methods = [],
					paramBody = [];

				node.args[3].elements.forEach(function(el){
					var method = {};
					el.properties.forEach(function(e){
						switch(e.key) {
							case 'name': {
								method[e.key] = toValue(e.value,el);
								break;
							}
							case 'returnType': {
								method.returnType = toValue(e.value,el);
								break;
							}
							case 'arguments': {
								method.arguments = [];
								e.value.elements.forEach(function(element){
									var arg = {};
									element.properties.forEach(function(p){
										arg[p.key] = toValue(p.value,p);
									});
									method.arguments.push(arg);
								});
								break;
							}
							case 'action': {
								var body = e.value.print_to_string();								method.action_name = e.value.name && e.value.name.name || method.name;
								// make the name unique hashed on the body contents in case we
								// have multiple method names as the same (such as objective-c)
								method.action_name += '_'+crypto.createHash('md5').update(body).digest('hex').substring(0,4);
								paramBody.push(method.action_name+':'+body);
								break;
							}
							default: {
								//TODO: raise exception
							}
						}
					});
					methods.push(method);
				});
				sourcefile.processCustomClass(node,className,extendsName,interfaces,methods,'Make$'+className);
				return new Uglify.AST_SymbolConst({name: 'Make$'+className+'({'+paramBody.join(',')+'})'});
			}
			else if (node.args && node.expression && node.expression.expression && node.expression.start.type==='name') {
				if (node.expression.expression.thedef && node.expression.expression.thedef.init && node.expression.expression.thedef.init.start.value==='hyperloop_memory') {
					// ignore
				}
				else {
					var property = node.expression.start.value,
						type = node.expression.start.type,
						method = node.expression.property,
						args = [];
					node.args.forEach(function(arg){
						args.push(arg.print_to_string());
					});
					// process it but don't change it
					sourcefile.processMethod(node,property,method,args);
				}
			}
		}
	});

	return ast.transform(transfomer);
}

function compress (ast, build_opts, filename) {
	var compressor = Uglify.Compressor({
			global_defs: build_opts,
			warnings: false,
			unused: false,
			dead_code: true,
			join_vars: true,
			properties: true,
			drop_debugger: !!build_opts.ENV_PROD
		}),
		source_map = Uglify.SourceMap({
			file: filename
		}),
		stream = Uglify.OutputStream({
			source_map: source_map,
			beautify: !!build_opts.ENV_PROD || build_opts.DEBUG
		});
	ast.figure_out_scope();
	ast = ast.transform(compressor);
	ast.print(stream);
	return stream.toString();
}

exports.compile = compile;
exports.compress = compress;
