/**
 * hyperloop compiler
 */
var fs = require('fs'),
	path = require('path'),
	Uglify = require('uglify-js'),
	_ = require('underscore'),
	U = require('./utils');

function compile (source, filename, sourcefile, build_opts) {
	// parse the HJS file
	var ast = Uglify.parse(source,{
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
	var transfomer = new Uglify.TreeTransformer(null, function(node, descend){

		// found a hyperloop node
		if (node instanceof Uglify.AST_Hyperloop) {

			// validate the given hyperloop AST node
			var cni = cnis[node.hyperloop];
			if (!cni) {
				throw new Error('Invalid CNI instruction "' + node.hyperloop +
					'" (' + node.start.file + ':' + node.start.line + ':' + node.start.col + ')');
			}

			// process current node and return transformed node
			return cni(node, sourcefile, build_opts);
		}

		if (node instanceof Uglify.AST_New) {

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
			if (node.expression && node.expression.name && !node.expression.scope.find_variable(node.expression.name)) {
				var args = [];
				node.args.forEach(function(arg){
					args.push(arg.print_to_string());
				});
				var newSymbol = sourcefile.processFunction(node,node.expression.name,args);
				return new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
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
