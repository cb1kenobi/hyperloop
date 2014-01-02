/**
 * hyperloop compiler
 */
var fs = require('fs'),
	path = require('path'),
	Uglify = require('uglify-js'),
	log = require('../log'),
	_ = require('underscore'),
	U = require('./utils');

function compile (source, filename, jsfilename, sourcefile, build_opts) {
	// parse the HJS file
	var ast = Uglify.parse(source, {
		filename: filename
	});
	ast.figure_out_scope();

	// load the valid CNI instructions
	// TODO: account for platform-specific CNI instructions
	var cnis = {};
	fs.readdirSync(path.join(__dirname, 'cnis')).forEach(function(cni) {
		if (/\.js$/.test(cni)) {
			var key = cni.replace(/\.js/, '');
			cnis[key] = require('./cnis/' + key);
		}
	});

	// create the AST transformer
	var transformer = new Uglify.TreeTransformer(null, function(node, descend){
		
		// found a hyperloop node
		if (node instanceof Uglify.AST_Hyperloop) {

			// validate the given hyperloop AST node
			var cni = cnis[node.hyperloop];
			if (!cni) {
				throw new Error('Invalid CNI instruction "' + node.hyperloop +
					'" (' + node.start.file + ':' + node.start.line + ':' + node.start.col + ')');
			}

			// process current node and return transformed node
			return cni(node, sourcefile, build_opts, filename);
		}

		if (node instanceof Uglify.AST_New) {

			// check to see if we're attempting to instantiate one of our classes
			if (node.expression && node.expression.name && !node.expression.scope.find_variable(node.expression.name)) {
				// if this is a common class, we need to mark it
				if (sourcefile.isCommonClass(node.expression.name)) {
					return sourcefile.processCommonClass(node,node.expression.name);
				}
				// if this is a global class, just ignore it
				if (sourcefile.isGlobalClass(node.expression.name)) {
					return;
				}
				var args = [],
					found;
				node.args.forEach(function(arg){
					args.push(arg.print_to_string());
				});
				for (var c=0;c<sourcefile.symbols.length;c++) {
					var sym = sourcefile.symbols[c],
						value = sym.className || sym.value;
					found = value===node.expression.name;
					if (found) {
						break;
					}
				}
				var newSymbol = node.expression.name;
				if (!found) {
					sourcefile.processUnknown(node,'new',newSymbol,args);
				}
				else {
					newSymbol = sourcefile.processNewClass(node,newSymbol);
				}
				node = new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
				sourcefile.updateLastNode(node);
				return node;
			}
		}
		else if (node instanceof Uglify.AST_Call) {
			// check to see if we're attempting to call one of our static functions
			if (node.expression && node.expression.name && (node.expression.scope && !node.expression.scope.find_variable(node.expression.name))) {
				var args = [];
				node.args.forEach(function(arg){
					args.push(arg.print_to_string());
				});
				var newSymbol = sourcefile.processFunction(node,node.expression.name,args);
				node = new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
				sourcefile.updateLastNode(node);
				return node;
			}
			else if (node.args && node.expression && node.expression.expression && node.expression.start.type==='name') {
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
		else if (node instanceof Uglify.AST_SymbolRef && node.thedef && node.thedef.name.charAt(0)!=='@') {
			if (node.thedef.undeclared) {
				// see if we already have a symbol imported and if so, we've already resolved it
				for (var c=0;c<sourcefile.symbols.length;c++) {
					var sym = sourcefile.symbols[c],
						value = sym.className || sym.value;
					if (value === node.thedef.name) {
						return;
					}
				}
				if (build_opts && node.thedef.name in build_opts) {
					// if a defined global passed in build_opts, just ignore it, it's valid
					return;
				}
				sourcefile.processUnknown(node,'symbol',node.thedef.name);
			}
		}
		else if (node instanceof Uglify.AST_UnaryPrefix && node.operator === 'typeof') {
			// we have to check for typeof(UNDEFINED_SYMBOL) and if we find a typeof operator against
			// an unknown symbol, remove the unknown symbol
			for (var c=0;c<sourcefile.symbols.length;c++) {
				var sym = sourcefile.symbols[c];
				if (sym.name===node.expression.name) {
					sourcefile.symbols.splice(c,1);
					break;
				}
			}
		}
		else if (node instanceof Uglify.AST_Try) {
			var walker = new Uglify.TreeWalker(function(n){
				n.inside_try_catch = !!walker.find_parent(Uglify.AST_Try) && !!!walker.find_parent(Uglify.AST_Catch);
			});
			node.walk(walker);
			sourcefile.processTry(node);
		}
		else if (node instanceof Uglify.AST_Catch) {
			// we need to handle AST CATCH and insert our native processing
			// of the exception (if the backend has implemented the special
			// function and if this is a native exception - denoted by the presence
			// of the nativeStack property)
			var catchVarname = node.argname.name,
				body = 'typeof(HL$ProcessEx)==="function" && '+catchVarname+'.nativeStack && ('+catchVarname+'=HL$ProcessEx('+catchVarname+',"'+jsfilename+'","'+build_opts.CLASSPREFIX+'"))',
				stmt = new Uglify.AST_SimpleStatement({
					body: new Uglify.AST_SymbolConst({name: body})
				});
			node.body.unshift(stmt);
			sourcefile.processCatch(node);
		}
	});

	var result = ast.transform(transformer);
	sourcefile.processTransformCompleted();
	return result;
}

function compress (ast, build_opts, filename, target) {
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
			file: target
		}),
		stream = Uglify.OutputStream({
			source_map: source_map,
			beautify: !!build_opts.ENV_PROD || build_opts.DEBUG
		});

	ast.figure_out_scope();
	ast = ast.transform(compressor);
	ast.print(stream);

	var retObj = {
		code: stream.toString(),
		map: source_map.toString()
	};

	printTraceInfo(filename, target, retObj);

	return retObj;
}

/**
 * Function used to debug compiler output
 */
function printTraceInfo(filename, target, retObj) {
	log.trace('SOURCE: ' + filename);
	log.trace('TARGET: ' + target);
	log.trace('CODE:\n' + retObj.code);
	log.trace('MAP:\n' + retObj.map);
	log.trace('');
}

exports.compile = compile;
exports.compress = compress;
