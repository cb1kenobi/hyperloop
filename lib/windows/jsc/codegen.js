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
		var customClass = gen.customclasses[cn],
			result = typegenerator.generateCustomClass(state, cn, customClass);
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.h'), result.header);
		config.headers.push(cn + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, cn + '.cpp'), result.implementation);
		config.implementations.push(cn + '.cpp');
		code.push(util.renderTemplate('templates/custom_class_register.ejs', {
			cn: cn,
			mangledName: cn,
			fn: 'MakeObjectFor' + cn + 'ConstructorCallback'
		}, __dirname));
		
		updateIncludes();
	});
		
	function processClass(cn, type) {
		if (generated[cn] !== undefined || cn.toLowerCase() === 'object') {
			return generated[cn] || false;
		}

		var result;
		!type && (type = typegenerator.resolveType(state, cn));
		if (!type) {
			return generated[cn] = false;
		}
		if (generated[type.mangledName] !== undefined) {
			return generated[type.mangledName];
		}

		if (type.is_enum) {
			result = typegenerator.generateEnum(state, cn);
			code.push(util.renderTemplate('templates/class_register.ejs', {
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
				cn: cn,
				mangledName: type.mangledName,
				fn: 'JSObjectRef ' + type.mangledName + 'ObjectRef = MakeObjectFor' + type.mangledName + 'Constructor'
			}, __dirname));
		}

		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.h'), result.header);
		config.headers.push(type.mangledName + '.h');
		util.writeIfDifferent(path.join(gen.gen_dir, type.mangledName + '.cpp'), result.implementation);
		config.implementations.push(type.mangledName + '.cpp');

		var inc = type.className.split('.').slice(0, -1).join('::');
		includes.indexOf(inc) === -1 && includes.push(inc);

		generated[type.mangledName] = true;
		updateIncludes();
		return true;
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
					if (processClass(imp)) {
						return imp.split('.').slice(0, -1).join('::');
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