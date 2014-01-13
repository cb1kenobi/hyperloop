/**
 * JavaScriptCore C API generation
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	wrench = require('wrench'),
	_ = require('underscore'),
	log = require('../../log'),
	util = require('../../util'),
	typegenerator = require('./typegenerator');

exports.generateCode = generateCode;

function generateCode(gen, metadata, callback) {
	var state = typegenerator.createState(metadata, '1.0.0', null),
		config = {
			headers: [],
			implementations: [],
			App: gen.App || false
		},
		generated = {},
		referenced = {},
		includes = [],
		code = [],
		body = [],
		bodyHeader = [];

	gen.casts && Object.keys(gen.casts).forEach(function(cn) {
		var result = typegenerator.generateCast(state, cn, gen.casts[cn]);
		code.push(result.code);
		body.push(result.body);

		updateIncludes();
		cascadeReferences();
	});
	
	gen.customclasses && Object.keys(gen.customclasses).forEach(function(cn) {
		var customClass = gen.customclasses[cn],
			result = typegenerator.generateCustomClass(state, cn, customClass);
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.h'), result.header);
		config.headers.push(cn + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.cpp'), result.implementation);
		config.implementations.push(cn + '.cpp');
		code.push(util.renderTemplate('templates/custom_class_register.ejs', {
			cn: cn,
			fn: 'MakeObjectFor' + cn + 'ConstructorCallback'
		}, __dirname));
		
		updateIncludes();
		cascadeReferences();
	});
		
	function processClass(cn, type) {
		if (generated[cn] || cn.toLowerCase() === 'object') {
			return;
		}

		var result;
		generated[cn] = true;

		!type && (type = typegenerator.resolveType(state, cn));
		if (!type) {
			return;
		}

		if (type.is_enum) {
			result = typegenerator.generateEnum(state, cn);
			code.push(util.renderTemplate('templates/class_register.ejs', {
				cn: cn,
				fn: 'JSObjectRef ' + cn + 'ObjectRef = MakeObjectFor' + cn
			}, __dirname));
		}
		else if (type.is_struct) {
			result = {
				implementation: typegenerator.generateStruct(state, cn),
				header: typegenerator.generateStructHeader(state, cn)
			};
			code.push(util.renderTemplate('templates/class_register.ejs', {
				cn: cn,
				fn: 'JSObjectRef ' + cn + 'ObjectRef = MakeObjectFor' + cn + 'Constructor'
			}, __dirname));
		}
		else {
			result = {
				implementation: typegenerator.generateInterface(state, cn, type),
				header: typegenerator.generateInterfaceHeader(state, cn, type)
			};
			code.push(util.renderTemplate('templates/class_register.ejs', {
				cn: cn,
				fn: 'JSObjectRef ' + cn + 'ObjectRef = MakeObjectFor' + cn + 'Constructor'
			}, __dirname));
		}

		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.h'), result.header);
		config.headers.push(type.mangledName + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.cpp'), result.implementation);
		config.implementations.push(type.mangledName + '.cpp');
		
		var inc = type.className.split('.').slice(0, -1).join('::');
		includes.indexOf(inc) === -1 && includes.push(inc);

		updateIncludes();
		cascadeReferences();
	}

	gen.generics && Object.keys(gen.generics).forEach(function(cn) {
		processClass(cn, gen.generics[cn].object);
	});

	gen.classes && Object.keys(gen.classes).forEach(function(cn, index, array) {
		processClass(cn);
	});

	function updateIncludes() {
		for (var key in state.includes) {
			if (state.includes.hasOwnProperty(key)) {
				state.includes[key] && (includes = _.union(includes, state.includes[key].map(function(imp) {
					referenced[imp] = true;
					return imp.split('.').slice(0, -1).join('::');
				})));
			}
		}
		includes = _.uniq(includes);
	}
	function cascadeReferences() {
		// Cascade in to the referenced classes, too.
		for (var reference in referenced) {
			if (referenced.hasOwnProperty(reference)) {
				var reducedType = reference.match(/[^<]+\.([^.]+)/);
				processClass(reducedType ? reducedType[1] : reference);
			}
		}
	}

	var templateArgs = {
			gen: gen,
			_includes: includes,
			files: config,
			code: code.join('\n'),
			bodyHeader: bodyHeader.join('\n'),
			body: body.join('\n'),
			indentify: typegenerator.indentify,
			memory: gen.memory || {}
		},
		header = util.renderTemplate('templates/template_header.ejs', templateArgs, __dirname),
		source = util.renderTemplate('templates/template.ejs', templateArgs, __dirname);
	
	return callback(null, header, source, config);
}