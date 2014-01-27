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
			fxCompile: [],
			compiler: gen.compiler
		},
		generated = {},
		includes = [],
		code = [],
		body = [],
		bodyHeader = [];

	state.generics = gen.generics;

	gen.casts && Object.keys(gen.casts).forEach(function(cn) {
		var result = typegenerator.generateCast(state, cn, gen.casts[cn]);
		code.push(result.code);
		body.push(result.body);

		updateIncludes();
	});

	gen.customclasses && Object.keys(gen.customclasses).forEach(function(cn) {
		var type = gen.customclasses[cn];
		var result = typegenerator.generateCustomClass(state, cn, type);
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.h'), result.header);
		config.headers.push('Generated/' + cn + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.cpp'), result.implementation);
		config.implementations.push('Generated/' + cn + '.cpp');
		code.push(util.renderTemplate('templates/custom_class_register.ejs', {
			object: type,
			cn: cn,
			mangledName: cn,
			fn: 'MakeObjectFor' + cn + 'ConstructorCallback'
		}, __dirname));
	});

	// Don't cascade customClass includes until AFTER we've processed all custom classes.
	// This is necessary because one of the custom classes could be a handler.
	updateIncludes();

	function processClass(cn, type) {
		if (generated[cn] !== undefined || cn.toLowerCase() === 'object') {
			return generated[cn] || false;
		}
		var result;
		if (type) {
			type.is_object && (type = typegenerator.resolveObject(state, type));
		}
		else {
			type = typegenerator.resolveType(state, cn);
		}
		if (!type) {
			return generated[cn] = false;
		}
		if (generated[type.mangledName] !== undefined) {
			return generated[type.mangledName];
		}
		

		if (type.is_enum) {
			result = typegenerator.generateEnum(state, cn);
			code.push(util.renderTemplate('templates/class_register.ejs', {
				object: type,
				cn: cn,
				mangledName: type.mangledName,
				fn: 'JSObjectRef ' + type.mangledName + 'ObjectRef = MakeObjectFor' + type.mangledName
			}, __dirname));
		}
		else if (type.is_struct) {
			result = {
				implementation: typegenerator.generateStruct(state, cn),
				header: typegenerator.generateStructHeader(state, cn)
			};
			code.push(util.renderTemplate('templates/class_register.ejs', {
				object: type,
				cn: cn,
				mangledName: type.mangledName,
				fn: 'JSObjectRef ' + type.mangledName + 'ObjectRef = MakeObjectFor' + type.mangledName + 'Constructor'
			}, __dirname));
		}
		else {
			result = {
				implementation: typegenerator.generateInterface(state, cn, type),
				header: typegenerator.generateInterfaceHeader(state, cn, type)
			};
			code.push(util.renderTemplate('templates/class_register.ejs', {
				object: type,
				cn: cn,
				mangledName: type.mangledName,
				fn: 'JSObjectRef ' + type.mangledName + 'ObjectRef = MakeObjectFor' + type.mangledName + 'Constructor'
			}, __dirname));
		}

		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.h'), result.header);
		config.headers.push('Generated/' + type.mangledName + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.cpp'), result.implementation);
		config.implementations.push('Generated/' + type.mangledName + '.cpp');

		var inc = type.className.split(' ').pop().split('.').slice(0, -1).join('::');
		includes.indexOf(inc) === -1 && includes.push(inc);

		generated[type.mangledName] = true;
		updateIncludes();
		return true;
	}

	gen.generics && Object.keys(gen.generics).forEach(function(cn) {
		processClass(cn, gen.generics[cn].object);
	});

	gen.classes && Object.keys(gen.classes).forEach(function(cn, index, array) {
		processClass(cn, gen.classes[cn].is_imported_class && gen.classes[cn]);
	});

	gen.symbols && Object.keys(gen.symbols).forEach(function(cn) {
		var result = typegenerator.generateSymbol(state, cn, gen.symbols[cn]);
		config.headers.push('Generated/' + cn + '.h');
		config.implementations.push('Generated/' + cn + '.cpp');
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.h'), result.header);
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.cpp'), result.implementation);
		code.push(result.register);
	});

	function updateIncludes() {
		for (var key in state.includes) {
			if (state.includes.hasOwnProperty(key)) {
				state.includes[key] && (includes = _.union(includes, state.includes[key].map(function(imp) {
					if (processClass(imp)) {
						return imp.split(' ').pop().split('.').slice(0, -1).join('::');
					}
					else {
						return false;
					}
				}).filter(truthy)));
			}
		}
		includes = _.uniq(includes);
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

function truthy(a) {
	return !!a;
}