/**
 * Windows backend generator
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	semver = require('semver'),
	wrench = require('wrench'),
	_ = require('underscore'),
	log = require('../../log'),
	util = require('../../util'),
	primitiveTypeRegex = /^(u)?\s*(string|short|float|double|long|bool|int|char|unichar|_Bool)(32|64)?/i,
	voidpointerRegex = /^(const)?\s*void\s?\*?/,
	subarrayRegex = /u?\s*(\w+)\s*\[(\d+)?\]/,
	INDENT = '    ';

exports.createState = createState;
exports.resolveType = resolveType;
exports.indentify = indentify;
exports.generateCast = generateCast;
exports.generateGeneric = generateGeneric;
exports.generateStruct = generateStruct;
exports.generateStructHeader = generateStructHeader;
exports.generateInterface = generateInterface;
exports.generateInterfaceHeader = generateInterfaceHeader;
exports.generateEnum = generateEnum;
exports.generateCustomClass = generateCustomClass;
exports.mangleTypeName = mangleTypeName;
exports.convertToJSValueRef = convertToJSValueRef;
exports.convertToSimpleType = convertToSimpleType;


/**
 * translate from one type to another
 */
const TRANSLATED_TYPES = {
};

/**
 * these classes are not available
 */
const BLACKLIST_CLASSES = [
];


/**
 * turn a string of content into a string with each line with an indent
 */
function indentify(string, indent) {
	indent = typeof(indent) === 'undefined' ? INDENT : indent;
	var c = 0;
	return string.split(/\n/).map(function(s) { return ((c++ > 0) ? indent : '') + s }).join('\n');
}

/**
 * taken a type (such as const char * or UIView *) return a stripped down type removing all the
 * extra fluff like const and signed attributes that are modifiers to the type object.
 */
function convertToSimpleType(type) {
	var t = type.replace('unsigned ', '')
		.replace('signed ', '')
		.replace('struct ', '')
		.replace('union ', '')
		.replace('enum ', '')
		.replace(/__unsafe_unretained/g, '')
		.replace(/__strong/g, '')
		.replace('volatile', '')
		.replace(' *const', '')
		.replace('const ', '')
		.replace(/\*/g, '')
		.trim();
	if (t in TRANSLATED_TYPES) {
		return TRANSLATED_TYPES[t];
	}
	return t;
}

/**
 * create a mangled symbol name from a fully qualified type (such as const char *)
 */
function mangleTypeName(type) {
	return type.split('.').pop()
		.replace('[]', 'Array')
		.replace(/[`\(\)\[\]\s,<>\.]/g, '_')
		.replace(/\^/g, 'B')
		.replace(/\*/g, 'P');
}

/**
 * return true if symbol is referenced
 */
function isSymbolReferenced(state, classname, name, type) {
	// TODO: Actually detect if it is referenced or not.
	return true;

	var simpleName = convertToSimpleType(classname),
		referenced = state.referenceTable && state.referenceTable[simpleName],
		types = referenced && referenced[type],
		found = types && types.indexOf(name) !== -1;

	// if found or if we're compiling in all symbols (denoted by missing referenceTable)
	return (found || state.referenceTable === undefined);
}

/**
 * create a state object that we can use during compilation and that can be passed along to functions
 */
function createState(metadata, version, referenceTable) {
	return {
		metadata: metadata,
		version: version,
		handlerBindings: {},
		dependencies: [],
		externs: {},
		imports: {},
		typedefs: {},
		includes: {},
		referenceTable: referenceTable,
		customclasses: {},
		addImports: true
	};
}

/**
 * check if version is supported
 */
function satisfies(check, version) {
	if (!check || check === '0') {
		return false;
	}
	check = makeVersion(check);
	version = makeVersion(version);
	return semver.gte(version, check);
}

/**
 * iOS versions can be in the form X.X but semver requires X.X.X
 */
function makeVersion(version) {
	if (!version) {
		throw new Error('version is null');
	}
	if (version.split('.').length === 2) {
		version += '.0';
	}
	return version;
}

/**
 * return true if this metadata type is available on this platform, version
 */
function available(obj, version) {
	if (!obj) {
		throw new Error('object cannot be null');
	}
	var availability = obj.availability;
	if (availability && (availability.message === 'Unavailable' || availability.platform !== 'windows')) {
		return false;
	}
	if (obj.unavailable) {
		return false;
	}
	if (availability && satisfies(availability.deprecated, version)) {
		return false;
	}
	return true;
}

/**
 * return true if a method prototype is found
 */
function hasMethodPrototype(metadata, entry, name) {
	var e = entry;
	while (entry) {
		if (entry.methods && name in (entry.methods || {})) {
			return true;
		}
		entry = metadata.classes[entry.superClass];
	}
	return false;
}

function resolveObject(state, result) {

	var name = result.name,
		simpleType = result.simpleType,
		imports = state.imports[result.type],
		includes = state.includes[result.type];

	result.object.superClass && (result.superClass = resolveType(state, result.object.superClass));
	result.object.protocols && (result.protocols = []) && result.object.protocols.forEach(function(k) { result.protocols.push(resolveType(state, k)); });
	result.methods = {};
	result.instance_readwrite_properties = {};
	result.instance_readonly_properties = {};
	result.class_readwrite_properties = {};
	result.class_readonly_properties = {};
	result.readwrite_properties = {};
	result.readonly_properties = {};
	result.instance_methods = {};
	result.class_methods = {};

	result.object.methods && Object.keys(result.object.methods).forEach(function(ii) {
		var method = result.object.methods[ii];
		if (method.constructor.name === Array.prototype.constructor.name) {
			method = method[0];
		}
		var name = method.name && method.name.replace('.', '_');

		if (name === '_ctor') {
			// Skip constructors.
			return;
		}
		if (!isSymbolReferenced(state, simpleType, name, 'methods')) {
			return;
		}
		var copymethods = [],
			skip = false;

		var availability = method.availability || { platform: 'windows' };
		if (availability.message === 'Unavailable' || availability.platform !== 'windows') {
			// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is unavailable',availability);
			return;
		}
		if (method.unavailable) {
			// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is',method.unavailable);
			return;
		}
		if (satisfies(availability.deprecated, state.version)) {
			// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is',availability);
			return;
		}
		if (method.attributes && method.attributes.indexOf('public') === -1) {
			return;
		}
		var m = _.clone(method);

		m.returnType = resolveType(state, method.returnType);
		if (method.returnType) {
			method.returnType = method.returnType.split(' ').pop();
			m.returnType = resolveType(state, method.returnType);
		}
		var args = [];
		if (method.args && method.args.length) {
			method.args.forEach(function(a) {
				var rt = resolveType(state, a.type);
				if (!rt) {
					// blacklisted, skip the entire method
					skip = true;
					return;
				}
				if (a.type.indexOf('.') === -1) {
					rt = resolveType(state, a.type);
				}
				if (a.type.indexOf('<') >= 0) {
					// TODO: Handle generics.
					log.trace('Skipping method ' + name + ' because it has a generic arg "' + a.type + '"!');
					skip = true;
					return;
				}
				if (a.inout === 'out') {
					// TODO: Handle out params.
					log.trace('Skipping method ' + name + ' because of param direction "' + a.inout + '"!');
					skip = true;
					return;
				}
				var rtc = _.clone(rt);
				rtc.argument = a;
				args.push(rtc);
			});
		}
		if (!skip) {
			m.args = args;
			if (method.attributes && method.attributes.indexOf('instance') >= 0 || method.instance) {
				if (name in (result.instance_methods || {})) {
					result.instance_methods[name].push(m);
				}
				else {
					result.instance_methods[name] = [m];
				}
			}
			else {
				if (name in (result.class_methods || {})) {
					result.class_methods[name].push(m);
				}
				else {
					result.class_methods[name] = [m];
				}
			}
			copymethods.push(m);
			// sometimes, methods are added from a category and they are from a different
			// framework than our interface, so we need to add to our imports
			method.framework && imports.push(method.framework);
			method.import && includes.push(method.import);
		}
		if (!skip && copymethods.length) {
			result.methods[name] = copymethods;
		}
	});
	
	result.object.fields && Object.keys(result.object.fields).forEach(function(name) {
		var field = result.object.fields[name],
			p;
		if (field.type && field.type.indexOf('.') === -1) {
			p = resolveType(state, field.type);
		}
		else {
			p = resolveType(state, field.type.split('.').pop())
		}	
	});

	result.properties = {};
	result.object.properties && Object.keys(result.object.properties).forEach(function(name) {
		var property = result.object.properties[name],
			readonly = !property.setter,
			availability = property.availability || { platform: 'windows' };

		if (availability.message === 'Unavailable' || availability.platform !== 'windows') {
			return;
		}
		if (property.unavailable) {
			return;
		}
		if (satisfies(availability.deprecated, state.version)) {
			return;
		}
		if (!isSymbolReferenced(state, simpleType, name, 'properties')) {
			return;
		}
		var isPublicGetter = result.object.methods.filter(function(method) {
			return method.name === 'get_' + name && method.attributes && method.attributes.indexOf('public') >= 0;
		}).length > 0;
		if (!isPublicGetter) {
			return;
		}
		var p;
		if (property.returnType && property.returnType.indexOf('.') === -1) {
			p = resolveType(state, property.returnType);
		}
		else {
			p = resolveType(state, property.getter.classname.split(' ')[0].split('.').pop())
		}
		if (!p) {
			return;
		}

		var scope = property.getter && property.getter.type || 'instance',
			writability = readonly ? 'readonly' : 'readwrite';
		switch (scope) {
			case 'instance':
			case 'object':
				scope = 'instance';
				break;
			case 'class':
			case 'valuetype':
			case 'float64': // TODO: This might be a metabase parsing issue.
				scope = 'class';
				break;
			default:
				console.log(property.getter);
				throw 'unhandled scope type: ' + scope;
		}

		result[scope + '_' + writability + '_properties'][name] = p;
		result[writability + '_properties'][name] = p;
		result.properties[name] = p;
	});

	// copy all static Class methods into the class_methods hash
	var sc = result.object.superClass && resolveType(state, result.object.superClass);
	while (sc) {
		sc.methods && Object.keys(sc.methods).forEach(function(name) {
			var methods = sc.methods[name],
				method = methods && methods.length && methods[0];
			if (!method.instance && method) {
				result.class_methods[name] = methods;
				method.framework && imports.push(method.framework);
				method.import && includes.push(method.import);
			}
		});
		sc = sc.superClass;
	}

	// sort imports, includes
	state.imports[result.type] = _.uniq(imports);
	state.includes[result.type] = _.uniq(includes);

	// sort extensions
	var ec = result.extendsClass || result.extends;
	while (ec) {
		var extendsClass = resolveType(state, ec);
		if (extendsClass) {
			[
				'methods', 'instance_readwrite_properties', 'instance_readonly_properties',
				'class_readwrite_properties', 'class_readonly_properties', 'readwrite_properties',
				'readonly_properties', 'instance_methods', 'class_methods', 'properties'
			].forEach(function(key) {
				_.defaults(result[key], extendsClass[key]);
			});
		}
		ec = extendsClass && (extendsClass.extendsClass || extendsClass.extends);
	}

	return result;
}

/**
 * this method will attempt to resolve all graph dependencies for a given symbol.  for example, if the type is a class, it will
 * examine all methods and properties to resolve any dependencies found in method signatures, return types, etc.  the dependencies
 * argument should be a object literal that will be populated with any dependencies required in the graph.  the key is the
 * full type and the value is the result of this function which is a meta object that has enough information to generate code
 * for this type.
 */
function resolveType(state, type) {
	if (!type) {
		return null;
	}
	var originalType = type.trim().split(' ').pop();
	type = originalType.split('.').pop().replace(/[&^]/g, '');
	// if we've already mapped it, just return it
	if (type in (state.dependencies || {})) {
		return state.dependencies[type];
	}
	// turn the type into something that we can lookup -- for example, strip all the extra typing information that isn't important to convert this type object into a type we can deal with
	var simpleType = convertToSimpleType(type),
		metadata = state.metadata,
		matchingClassNames = Object.keys(metadata.classes).filter(function(className) {
			return className.match('\\.' + type + '$') || className === type;
		});
	if (matchingClassNames.length > 1) {
		matchingClassNames = [ originalType ];
	}
	var matchingClassName = matchingClassNames && matchingClassNames.length && matchingClassNames[0],
		classObject = matchingClassName && metadata.classes[matchingClassName],
		protoObject = !classObject && metadata.protocols && metadata.protocols[simpleType],
		typedObject = !protoObject && metadata.types[type] || metadata.types[simpleType],
		typedObject = typedObject && metadata.classes[typedObject],
		symbolObject = !typedObject && metadata.symbols && metadata.symbols[simpleType],
		typeObject = classObject || protoObject || typedObject || symbolObject,
		is_function_pointer = type.indexOf('(*)') > 0,
		is_block = !is_function_pointer && type.indexOf('(^)') > 0,
		is_pointer = !is_function_pointer && !is_block && type.indexOf('*') > 0,
		is_void = !is_function_pointer && !is_block && voidpointerRegex.test(type),
		is_void_pointer = is_void && is_pointer,
		is_pointer_to_pointer = is_pointer && (type.indexOf('**') > 0 || type.indexOf('*const *') > 0),
		is_primitive = !is_function_pointer && !is_block && primitiveTypeRegex.test(simpleType),
		is_object = !!(classObject || protoObject),
		is_interface = !!classObject,
		is_function = symbolObject && symbolObject.metatype === 'function',
		is_array = is_primitive && subarrayRegex.test(type),
		is_const = type.indexOf('const ') !== -1,
		is_char_array = is_array && /char/.test(simpleType),
		is_union = type.indexOf('union ') >= 0,
		is_struct = !!(typedObject && typedObject.fields && Object.keys(typedObject.fields).length),
		is_enum = typedObject && typedObject.extends && typedObject.extends.indexOf('System.Enum') >= 0,
		is_delegate = typedObject && typedObject.extends && typedObject.extends.indexOf('Delegate') >= 0,
		is_custom_class = false,
		name = (typedObject && typedObject.alias) || type,
		mangled = mangleTypeName(name),
		realtype = type;

	// check to see if it's blacklisted
	if (BLACKLIST_CLASSES.indexOf(simpleType) !== -1) {
		return null;
	}
	if (is_object && type in (state.dependencies || {})) {
		return state.dependencies[type];
	}
	// we shouldn't get here but sometimes we can if we have an issue or a bad type that clang is not reporting correctly
	if (!is_void && !is_function_pointer && !typeObject && !is_primitive && !is_block && !is_void_pointer) {
		if (type in (state.customclasses || {})) {
			is_custom_class = true;
			is_object = true;
			is_interface = true;
			name = type;
			typeObject = classObject = state.customclasses[type];
		}
		else if (type === 'object') {
			return {
				metatype: 'interface',
				realtype: 'object',
				type: name,
				name: name,
				simpleType: simpleType,
				extendsClass: false,
				object: {},
				is_interface: true,
				is_object: true,
				instanceName: name.replace('const ', '').trim(),
				fullInstanceName: '',
				mangledName: mangled   //mangle the name so we can build a consistent and safe function name from it
			};
		} else {
			//log.error("Couldn't seem to determine the type for '"+type+"'");
			return null;
		}
	}
	// if we have an alias and this is a pointer type, we need to make sure the alias is a pointer too
	if (typedObject && typedObject.alias) {
		if (type != typedObject.type) {
			name = typedObject.alias + (is_pointer_to_pointer ? ' **' : is_pointer ? ' *' : '');
			mangled = mangleTypeName(name);
		}
		if (typedObject.type === 'void' && !is_pointer) {
			is_void_pointer = is_void = true;
			name += ' *';
			mangled = mangleTypeName(name);
		}
	}

	// treat unions like structures
	if (is_union || typedObject && typedObject.type && typedObject.type.indexOf('union ') >= 0) {
		is_struct = true;
		if (typedObject.type === 'union') {
			name = type = 'union ' + typedObject.name;
		}
	}

	// trim off any const
	name = name.replace(' *const', ' *').trim();
	name = name.replace(' *', '').trim();

	if (!is_primitive && typeObject && typeObject.metatype === 'typedef' && primitiveTypeRegex.test(typeObject.type)) {
		is_primitive = true;
		is_struct = false;
	}
	var imports = [],
		includes = [],
		externs = [],
	// this meta object will give us enough information about the typing to be able to generate code
		result = {
			metatype: is_function ? 'function' : is_enum ? 'enum' : is_struct ? 'struct' : is_primitive ? 'primitive' : classObject ? 'interface' : protoObject ? 'protocol' : typedObject ? 'typedef' : symbolObject ? 'symbol' : is_function_pointer ? 'function_pointer' : is_block ? 'block' : 'other',
			realtype: realtype,
			type: name,
			name: name,
			simpleType: simpleType,
			extendsClass: classObject && classObject['extends'],
			is_void: is_void,
			className: matchingClassName,
			object: typeObject,
			is_delegate: is_delegate,
			is_enum: is_enum,
			is_function: is_function,
			is_function_pointer: is_function_pointer,
			is_block: is_block,
			is_interface: is_interface,
			is_pointer: is_pointer,
			is_void_pointer: is_void_pointer,
			is_pointer_to_pointer: is_pointer_to_pointer,
			is_primitive: is_primitive,
			is_object: is_object,
			is_array: is_array,
			is_const: is_const,
			is_char_array: is_char_array,
			is_struct: is_struct,
			is_custom_class: is_custom_class,
			instanceName: name.replace('const ', '').trim(),
			fullInstanceName: matchingClassName && matchingClassName.replace(/\./g, '::'),
			mangledName: mangled   //mangle the name so we can build a consistent and safe function name from it
		};

	// check to see if we have an alias and if so, resolve to it
	if (typedObject && typedObject.alias && simpleType != typedObject.alias) {
		return resolveType(state, typedObject.alias);
	}
	// turn a NSString ** to NSString *
	if (is_pointer_to_pointer && is_object) {
		result.name = result.type = type.replace('**', '*');
		result.mangledName = mangleTypeName(result.type);
	}
	if (is_object && !is_pointer_to_pointer) {
		// if an protocol or class, insert with just plain Class name
		state.dependencies[simpleType] = result;
	}
	// if we're an interface or protocol, just use the simpleType as the key
	if (!(type in (state.dependencies || {}))) {
		state.dependencies[type] = result;
	}

	if (is_array) {
		var m = subarrayRegex.exec(type),
			length = parseInt(m[3]) || 0;
		result.simpleType = simpleType = ((m[1] || '') + ' ' + m[2]).trim();
		result.type = type = result.name = simpleType + ' ^';
		result.is_pointer = true;
		result.length = length;
		// force a dependency analysis
		resolveType(state, type);
	}
	else if (is_interface) {

		result.mangledName = mangleTypeName(simpleType);
		if (!is_pointer && result.name.indexOf('*') === -1) {
			// create a valid object pointer
			result.type = result.name;
		}

		if (is_struct) {
			if (!is_const) {
				resolveType(state, 'const ' + type);
			}
			if (typeObject.fields) {
				// resolve all field types
				Object.keys(typeObject.fields).forEach(function(name) {
					var field = typeObject.fields[name];
					var p = resolveType(state, field.type.split(' ').pop());
					p && p.className && p.className.indexOf('.') > 0 && includes.push(p.className);
				});
			}
		}
	}
	else if (protoObject) {
		//result.instanceName = 'Object<'+type+'> *';
		result.name = 'Object<' + type + '> *';
		result.type = result.name;
		result.baseObject = resolveType(state, 'Object');
		result.protocolNames = [type];
	}
	else if (is_block) {
		var i = type.indexOf('(^)'),
			rt = type.substring(0, i),
			args = type.substring(i + 4, type.length - 1).split(',').map(function(n) { return n.trim() });
		result.blockArgs = [];
		result.frameworks = [];
		result.blockReturnType = resolveType(state, rt);
		args.forEach(function(n) {
			if (n === '...') {
				result.is_vararg = true;
				result.blockArgs.push({metatype: 'sentinel'});
				return;
			}
			var a = resolveType(state, n);
			result.blockArgs.push(a);
			a.object && a.object.framework && result.frameworks.push(a.object.framework);
		});
		var blockargs = result.blockArgs.map(function(a) {return a.type}),
			blocktypedef = 'Block_' + result.mangledName,
			typedef = 'typedef ' + result.blockReturnType.type + ' (^' + blocktypedef + ')(' + args.join(',') + ')' + ';';
		// remap to the typedef
		result.type = result.simpleType = simpleType = blocktypedef;
		result.externTypedef = [typedef];
		result.blockReturnType.object && result.blockReturnType.object.framework && result.frameworks.push(result.blockReturnType.object.framework);
		state.dependencies[simpleType] = result;
	}
	else if (is_function_pointer) {
		var i = type.indexOf('(*)'),
			rt = type.substring(0, i),
			args = type.substring(i + 4, type.length - 1).split(',').map(function(n) { return n.trim() });

		result.functionPointerArgs = [];
		result.functionPointerReturnType = resolveType(state, rt);

		args.forEach(function(n) {
			if (n === '...') {
				result.is_vararg = true;
				return;
			}
			var a = resolveType(state, n);
			result.functionPointerArgs.push(a);
		});

		var fpargs = result.functionPointerArgs.map(function(a) {return a.type}),
			fptypedef = 'Function_' + result.mangledName,
			typedef = 'typedef ' + result.functionPointerReturnType.type + ' (*' + fptypedef + ')(' + fpargs.join(',') + (result.is_vararg ? ',...' : '') + ');';
		// remap to the typedef
		result.type = result.simpleType = simpleType = fptypedef;
		result.externTypedef = [typedef];
		state.dependencies[simpleType] = result;
	}
	else if (is_function) {
		resolveType(state, result.object.returnType);
		result.object.arguments.forEach(function(arg) {
			resolveType(state, arg.type);
		});
	}

	// add the framework for this object
	result.object && result.object.framework && imports.push(result.object.framework);
	result.object && result.object.import && includes.push(result.object.import);

	// add our state context information
	state.imports[result.type] = imports;
	state.includes[result.type] = includes;
	state.externs[result.type] = externs;
	state.typedefs[result.type] = [];


	// if this is an object (meaning we found a type object from the metadata) we are going to attempt to resolve any methods, properties if found
	if (result.is_object) {
		resolveObject(state, result);
	}

	return result;
}


/**
 * make a assignment to a variable for an argument
 */
function makeVarAssignmentFromJSValueRef(state, typeobj, arg, name, argname, cleanup) {
	if (!arg) {
		throw new Error('arg is null');
	}

	var type = arg.type,
		code = [],
		varname = name,
		varassign = arg.type,
		function_pointer_context,
		includes = state.includes[typeobj.name],
		argobj = resolveType(state, varassign) || arg,
		fnname = 'HyperloopJSValueRefTo' + (argobj.mangledName || argobj.typeObject && argobj.typeObject.mangledName);

	varassign = argobj.type.replace('const ', '').trim();
	if (argobj.className && includes.indexOf(argobj.className) === -1) {
		includes.push(argobj.className);
	}

	if (arg.is_pointer_to_pointer) {
		varname = '&' + name + '$';

		// export our symbol
		var ex = 'Hyperloop' + arg.mangledName + 'ToJSValueRef';
		if (arg.is_primitive && arg.is_pointer) {
			state.externs[typeobj.type].push('extern JSValueRef ' + ex + '(JSContextRef,' + varassign + ',size_t);');
			var t = 'auto',
				rt = resolveType(state, t),
				rtff = 'HyperloopJSValueRefTo' + rt.mangledName;
			code.push(arg.simpleType + '* ' + name + '$ = ' + rtff + '(ctx,' + argname + ',exception,NULL);');
		}
		else {
			code.push('auto ' + name + '$ = NULL;');
			state.externs[typeobj.type].push('extern JSValueRef ' + ex + '(JSContextRef,' + varassign + ');');
			cleanup.push('if (' + name + '$)');
			cleanup.push('{');
			cleanup.push('\tJSValueRef ' + name + ' = ' + ex + '(ctx, ' + name + '$);');
			cleanup.push('\tJSObjectRef ' + name + '$o = JSValueToObject(ctx,' + argname + ',0);');
			cleanup.push('\tSetJSBufferValue(ctx,' + name + '$o,' + name + ');');
			cleanup.push('}');
		}

	}
	else {
		var freevar = 'NULL',
			assign = '',
			dofree = false;
		if (arg.is_struct && !arg.is_enum) {
			freevar = name + '$free';
			assign = '&';
			code.push('bool ' + freevar + ' = false;');
			dofree = true;
			// structs must have pointer return type
			varassign += ' *';
			// but we must dereference it to set them
			varname = '*' + varname;
		}
		if (arg.is_block) {
			code.push('auto ' + name + ' = ' + fnname + '(ctx,object,' + argname + ',exception,' + assign + freevar + ');');
			// export this symbol
			state.externs[typeobj.type].push('extern ' + varassign + ' ' + fnname + '(JSContextRef,JSObjectRef,JSValueRef,JSValueRef*,bool*);');
		}
		else if (arg.is_function_pointer) {
			// need to attempt to pass last argument as context
			code.push('void *replaceContext = NULL;');
			function_pointer_context = 'replaceContext';
			code.push(varassign + ' ' + name + ' = ' + fnname + '(ctx,object,arguments[argumentCount-1],' + argname + ',exception,' + assign + freevar + ',&replaceContext);');
			// export this symbol
			state.externs[typeobj.type].push('extern ' + varassign + ' ' + fnname + '(JSContextRef,JSObjectRef,JSValueRef,JSValueRef,JSValueRef*,bool*,void**);');
		}
		else if (type === 'Object^') {
			code.push('auto ' + name + ' = HyperloopJSValueRefToObject(ctx,' + argname + ');');
		}
		else {
			code.push('auto ' + name + ' = ' + fnname + '(ctx,' + argname + ',exception,' + assign + freevar + ');');
			// export this symbol
			state.externs[typeobj.type].push('extern ' + varassign + ' ' + fnname + '(JSContextRef,JSValueRef,JSValueRef*,bool*);');
		}
		if (dofree) {
			cleanup.push('if (' + freevar + ')');
			cleanup.push('{');
			cleanup.push('\tfree(' + name + ');');
			cleanup.push('}');
		}

		// export this symbol
		arg.externTypedef && (state.typedefs[typeobj.type] = state.typedefs[typeobj.type].concat(arg.externTypedef));
	}

	// add framework, includes
	argobj && argobj.object && argobj.object.framework && state.imports[typeobj.type].push(argobj.object.framework);
	argobj && argobj.object && argobj.object.import && state.includes[typeobj.type].push(argobj.object.import);

	return {
		code: code.join('\n'),
		varname: varname,
		is_array: arg.is_array,
		length: arg.length,
		function_pointer_context: function_pointer_context
	};
}

/**
 * code to turn value into a JSValueRef
 */
function convertToJSValueRef(state, typeobj, mangledName, arg, resultName) {
	var code,
		fnname = 'Hyperloop' + mangledName.replace(/[&*^]/g, '') + 'ToJSValueRef';

	if (arg.is_primitive && !arg.is_pointer_to_pointer) {
		code = 'JSValueRef ' + resultName + ' = ' + fnname + '(ctx, ' + resultName + '$);';
	}
	else {
		var address_of = '',
			cast = '',
			type = arg.type;

		if (arg.is_struct && !arg.is_enum) {
			address_of = '&';
			cast = '(' + arg.type + ' *)';
			type = arg.type + ' *';
		}
		if (type === 'void') {
			type += ' *';
		}
		code = 'JSValueRef ' + resultName + ' = ' + fnname + '(ctx, ' + cast + address_of + resultName + '$);';
	}

	return code;
}

/**
 * make a get property body
 */
function makeGetProperty(state, typeobj, property, propertyName, resultName, instanceName) {
	var cleanup = [],
		code = [],
		propertyObject = property.object && property.object.properties && property.object.properties[propertyName],
		simpleType = typeobj.simpleType,
		varname = property.name,
		argname = resultName,
		mangledName = property.mangledName || mangleTypeName(property.type),
		isStatic = property.attributes && property.attributes.indexOf('static') >= 0 || false,
		operator = isStatic ? '::' : '->',
		expression = (isStatic ? simpleType : instanceName) + operator + propertyName,
		propobj = resolveType(state, property.type);

	code.push('auto ' + resultName + '$ = ' + expression + ';');

	// export this symbol
	property.externTypedef && (state.typedefs[typeobj.type] = state.typedefs[typeobj.type].concat(property.externTypedef));
	if (propertyObject && propertyObject.type === 'object') {
		code.push('JSValueRef ' + resultName + ' = HyperloopObjectToJSValueRef(ctx, ' + resultName + '$);');
	}
	else if (propertyObject && (propertyObject.type.indexOf('float') >= 0 || propertyObject.type.indexOf('int') >= 0)) {
		code.push('JSValueRef ' + resultName + ' = Hyperloop' + propertyObject.type + 'ToJSValueRef(ctx, ' + resultName + '$);');
	}
	else {
		code.push(convertToJSValueRef(state, typeobj, mangledName, propobj, resultName));
	}

	code.push('return ' + resultName + ';');

	return code.join('\n');
}

/**
 * make a set property body
 */
function makeSetProperty(state, typeobj, property, propertyName, instanceName, argumentsName, argumentsLengthName) {

	var arg,
		varassign,
		operator = '->',
		cleanup = [],
		code = [];

	if (typeobj.metatype === 'struct') {
		arg = resolveType(state, property.type);
		varassign = makeVarAssignmentFromJSValueRef(state, typeobj, arg, propertyName + '$' + 0, 'value', cleanup);
	}
	else {
		var setter = 'set' + propertyName.charAt(0).toUpperCase() + propertyName.substring(1),
			method = typeobj.methods && typeobj.methods[setter] && typeobj.methods[setter][0];
		arg = method && method.args[0];

		operator = '->';

		if (arg) {
			varassign = makeVarAssignmentFromJSValueRef(state, typeobj, arg, arg.argument.name + '$' + 0, 'value', cleanup);
		}
		else {
			var propArg = resolveType(state, property.type);
			varassign = makeVarAssignmentFromJSValueRef(state, typeobj, propArg, propertyName + '$' + 0, 'value', cleanup);
		}
	}


	code.push(varassign.code);
	if (varassign.is_array) {
		for (var c = 0; c < varassign.length; c++) {
			code.push(instanceName + operator + propertyName + '[' + c + '] = ' + varassign.varname + '[' + c + '];');
		}
	}
	else {
		code.push(instanceName + operator + propertyName + ' = ' + varassign.varname + ';');
	}

	cleanup.length && (code = code.concat(cleanup));

	return code.join('\n');
}

function makeAnyArg(name, value, type) {
	var code = [];

	//TODO: convert object to JSON

	code.push(type + ' ' + name + ' = @"<null>";');
	code.push('if (JSValueIsObject(ctx,' + value + '))');
	code.push('{');
	code.push('\tJSObjectRef objectRef = JSValueToObject(ctx, ' + value + ', 0);');
	code.push('\t\tif (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeID))');
	code.push('\t\t{');
	code.push('\t\t\t' + name + ' = (' + type + ')HyperloopGetPrivateObjectAsID(objectRef);');
	code.push('\t\t}');
	code.push('\t\telse if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeClass))');
	code.push('\t\t{');
	code.push('\t\t\t' + name + ' = (' + type + ')HyperloopGetPrivateObjectAsClass(objectRef);');
	code.push('\t\t}');
	code.push('\t\telse if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeJSBuffer))');
	code.push('\t\t{');
	code.push('\t\t\tJSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(objectRef);');
	code.push('\t\t\t' + name + ' = [NSString stringWithUTF8String:(const char*)buffer->buffer];');
	code.push('\t\t}');
	code.push('\t\telse');
	code.push('\t\t{');
	code.push('\t\t\JSStringRef jsonValue = JSValueCreateJSONString(ctx,' + value + ',0,0);');
	code.push('\t\t\t' + name + ' = (' + type + ')HyperloopToNSStringFromString(ctx,jsonValue);');
	code.push('\t\t}');
	code.push('}');
	code.push('else if (JSValueIsBoolean(ctx,' + value + '))');
	code.push('{');
	code.push('\t' + name + ' = [NSNumber numberWithBool:(bool)JSValueToBoolean(ctx,' + value + ')];');
	code.push('}');
	code.push('else if (JSValueIsNumber(ctx,' + value + '))');
	code.push('{');
	code.push('\tdouble d = JSValueToNumber(ctx,' + value + ',0);');
	code.push('\t' + name + ' = [NSNumber numberWithDouble:d];');
	code.push('}');
	code.push('else if (JSValueIsString(ctx,' + value + '))');
	code.push('{');
	code.push('\t' + name + ' = (' + type + ')HyperloopToNSString(ctx,' + value + ');');
	code.push('}');

	return code.join('\n');
}

/**
 * construct a method body
 */
function makeMethod(state, typeobj, methodName, resultName, instanceName, argumentsName, argumentsLengthName, returnFilterFunc) {
	var methods = typeof(methodName) === 'object' ? methodName : (typeobj.object.methods && typeobj.object.methods[methodName]) || (typeobj.methods && typeobj.methods[methodName]),
		includes = state.includes[typeobj.name],
		code = [],
		cases;

	// we expect an array below, make it an array if a single entry
	if (methods.constructor.name !== Array.prototype.constructor.name) {
		methods = [methods];
	}

	// if we pass an object in instead of a method name, we should get the name
	// from the method object since we need it below
	if (typeof(methodName) === 'object') {
		methodName = methods[0].name;
	}

	if (!methods) {
		// search for method on a subclass
		var sc = typeobj.superClass;
		while (sc) {
			if (methodName in (sc.methods || {})) {
				methods = sc.methods[methodName];
				break;
			}
			sc = sc.superClass;
		}
		// if still not found, bail... this shouldn't happen
		if (!methods) {
			log.fatal("Couldn't find method named: " + methodName + " in " + typeobj.mangledName);
		}
	}

	if (methods.length > 1) {
		var sentinelMethod;
		for (var c = 0; c < methods.length; c++) {
			if (methods[c].requiresSentinel) {
				sentinelMethod = methods[c];
				break;
			}
		}
		if (sentinelMethod) {
			log.debug('Dropping none sentinel method types for', typeobj.simpleType, sentinelMethod.name);
			methods = [sentinelMethod];
		}
		else {
			code.push('switch (' + argumentsLengthName + ')');
			code.push('{');
			cases = [];
		}
	}

	_.compact(methods).forEach(function(method) {

		var is_instance = method.instance,
			is_void = method.returnType ? method.returnType === 'void' || method.returnType.is_void : true,
			has_args = method.args.length > 0,
			sel = [], //method.selector.split(':'),
			argbody = [],
			cleanup = [],
			argvarnames = [],
			prefix_parenthesis = true,
			fnbody = '',
			returnbody,
			indent = methods.length > 1 ? INDENT + INDENT : '';

		//log.error(methodName,'=>',is_void);
		if (methods.length > 1) {
			if (cases.indexOf(method.args.length) !== -1) {
				// this is bad, this means we already have a case statement for this method. we have to drop it for now.
				log.debug('Dropping subsequent case with multiple method types for', typeobj.simpleType, method.name);
				return;
			}
			cases.push(method.args.length);
			code.push(INDENT + 'case ' + method.args.length + ':');
			code.push(INDENT + '{');
		}

		var target = '';
		if (typeobj.simpleType === 'Window') {
			target = typeobj.simpleType + '::Current';
		}
		else {
			target = '((' + (typeobj.fullInstanceName || typeobj.simpleType) + '^)HyperloopGetPrivateObjectAsID(object))';
		}

		if (is_instance) {
			fnbody = instanceName + '->' + method.name + '(';
		}
		else if (!method.instance && typeobj.metatype === 'protocol') {
			// get the class from the object and use that instead of the normal class name
			fnbody = instanceName + '::' + method.name + '(';
		}
		else if (method.name && method.name.indexOf('get_') === 0) {
			instanceName = typeobj.simpleType;
			fnbody = target + '->' + method.name.substr(4);
			prefix_parenthesis = false;
		}
		else if (method.name && method.name.indexOf('add_') === 0) {
			instanceName = typeobj.simpleType;
			fnbody = target + '->' + method.name.substr(4) + ' += ';
			prefix_parenthesis = false;
		}
		else {
			instanceName = typeobj.simpleType;
			var splitMethod = method.name.split('_');
			switch (splitMethod[0]) {
				case 'get':
					fnbody = target + '->' + splitMethod[1] + '; //(';
					break;
				case 'put':
					fnbody = target + '->' + splitMethod[1] + ' = (';
					break;
				case 'add':
					fnbody = target + '->' + splitMethod[1] + '+= (';
					break;
				case 'remove':
					fnbody = target + '->' + splitMethod[1] + ' -= (';
					break;
				default:
					fnbody = target + '->' + method.name + '(';
					break;
			}
		}

		if (has_args) {
			var function_pointer_context;

			for (var c = 0; c < method.args.length; c++) {
				var arg = method.args[c],
					varg = arg.argument || arg,
					va = makeVarAssignmentFromJSValueRef(state, typeobj, varg, varg.name + '$' + c, argumentsName + '[' + c + ']', cleanup);

				// If the varg type is an array, but we're overriding IVector, wrap the array in an Array.
				if (varg.type.indexOf('[]') > 0 && method.overrides && method.overrides.type && method.overrides.type.indexOf('IVector') >= 0) {
					va.code += '\nauto ' + va.varname + '$JSObj = JSValueToObject(ctx, arguments[' + c + '], exception);';
					va.code += '\nauto ' + va.varname + '$Length = HyperloopGetLength(ctx, ' + va.varname + '$JSObj, exception);';
					va.code += '\nauto ' + va.varname + '$Ref = ref new Array<' + arg.simpleType.split(' ')[0] + '>(' + va.varname + ', ' + va.varname + '$Length);';
					va.varname += '$Ref';
				}
				argbody.push(va.code);
				if (c !== 0) {
					fnbody += ', ';
				}
				else {
					// check to see if we have a function pointer with a context 
					function_pointer_context = !!va.function_pointer_context;
				}
				if (varg && varg.inout === 'out' && varg.type.indexOf('valuetype ') < 0) {
					fnbody += '&' + va.varname;
				}
				else if (varg.inout === 'in' && !arg.is_enum && varg.type.indexOf('valuetype ') >= 0) {
					fnbody += '*' + va.varname;
				}
				else {
					fnbody += va.varname;
				}
				argvarnames.push(va.varname);
				if (va.function_pointer_context) {
					// we use this to determine if we need to override the function pointer context
					function_pointer_context = va.function_pointer_context;
				}
			}

			if (function_pointer_context) {
				// we need to overwrite the context incoming with our new context returned from
				// creating the function pointer
				argbody.push(argvarnames[argvarnames.length - 1] + ' = (void *)' + function_pointer_context + ';');
			}
		}

		fnbody = fnbody.trim()
			+ (prefix_parenthesis ? ')' : '')
			+ ';';

		if (!is_void && !method.requiresSentinel) {
			if (method.formatter) {
				fnbody = 'auto ' + resultName + '$ = (' + method.returnType.type + ') ' + resultName + '$$;';
			}
			else {
				if (method.returnType.type === 'id' && method.returnSubtype === 'instancetype') {
					fnbody = typeobj.simpleType + '* ' + resultName + '$ = ' + fnbody;
					returnbody = convertToJSValueRef(state, typeobj, typeobj.simpleType, resolveType(state, typeobj.simpleType), resultName);
				}
				else if (method.returnType.is_const) {
					fnbody = method.returnType.type + ' ' + resultName + '$ = (' + method.returnType.type + ') ' + fnbody;
				}
				else if (method.returnType.type) {
					fnbody = 'auto ' + resultName + '$ = ' + fnbody;
				}
				if (method.name === 'alloc') {
					// we need to handle special case
					returnbody = convertToJSValueRef(state, typeobj, typeobj.simpleType, resolveType(state, typeobj.simpleType), resultName);
				}
			}
			if (!returnbody) {
				// export this symbol
				method.returnType.externTypedef && (state.typedefs[typeobj.type] = state.typedefs[typeobj.type].concat(method.returnType.externTypedef));
				if (method.returnType !== 'void' && method.returnType.metatype !== 'primitive' && method.returnType.className) {
					includes.push(method.returnType.className);
				}
				returnbody = convertToJSValueRef(state, typeobj, method.returnType.mangledName, resolveType(state, method.returnType.type || method.returnType), resultName);
			}
		}
		else {
			if (method.formatter) {
				fnbody = '';
				!is_void && code.push('if (' + resultName + '$$){}');
			}
			returnbody = 'JSValueRef ' + resultName + ' = JSValueMakeUndefined(ctx);';
		}


		var originalResultName = resultName,
			originalInstanceName = resultName + '$';

		if (method.returnType && method.returnType.type === 'id' && method.name !== 'alloc') {
			returnbody = 'JSValueRef ' + resultName + '$c = [HyperloopConverters convertIDToJSValueRef:' + resultName + '$ withContext:(void*)ctx];\n' +
				// fall back to id conversion if we can't get a normal class conversion
				'if (' + resultName + '$c==NULL)\n' +
				'{\n' +
				'\t' + returnbody + '\n' +
				'\t' + resultName + '$c = ' + resultName + ';\n' +
				'}\n';
			resultName += '$c';
			originalResultName = resultName;
		}

		argbody.forEach(function(b) {
			code.push(indent + indentify(b, indent));
		});
		fnbody && code.push(indent + fnbody);
		code.push(indent + indentify(returnbody, indent));
		if (returnFilterFunc && typeof(returnFilterFunc) === 'function') {
			var rc = returnFilterFunc(originalResultName, originalInstanceName);
			rc && code.push(indent + rc);
		}
		cleanup.length && (code.push(indent + indentify(cleanup.join('\n'), indent)));
		code.push(indent + 'return ' + resultName + ';');

		if (methods.length > 1) {
			code.push(INDENT + '}');
		}
	});

	if (methods.length > 1) {
		code.push('}');
		code.push('');
		code.push('return JSValueMakeUndefined(ctx);');
	}

	return code.join('\n');
}

/**
 * return interface header contents
 */
function generateInterfaceHeader(state, name, obj) {
	!obj && (obj = resolveType(state, name));

	// de-dup them
	var externs = _.uniq(state.externs[obj.type] || []).sort(),
		imports = _.uniq(state.imports[obj.type] || []).sort(),
		includes = _.uniq(state.includes[obj.type] || []).sort(),
		typedefs = _.uniq(state.typedefs[obj.type] || []).sort();

	name = obj.mangledName;

	return util.renderTemplate('templates/class_header.ejs', {
		name: name,
		entry: obj.object || {},
		state: state,
		object: obj,
		instanceName: obj.instanceName,
		fullInstanceName: obj.fullInstanceName,
		externs: externs,
		imports: imports,
		_includes: includes,
		_usings: convertToUsings(includes, obj.className),
		typedefs: typedefs,
		extra_includes: (obj.object && obj.object.extra_includes) || []
	}, __dirname);
}

/**
 * return interface contents
 */
function generateInterface(state, name, obj) {
	!obj && (obj = resolveType(state, name));
	var includes = _.uniq(state.includes[obj.type] || []).sort(),
		imports = _.uniq(state.imports[obj.type] || []).sort(),
		constructors = obj.object.methods && (obj.object.methods.filter(function(method) {
			return method.name === '.ctor' && (method.attributes.indexOf('public') >= 0 || state.handlerBindings[name] || obj.is_generic);
		})),
		noConstructor = !constructors || constructors.length === 0;

	name = obj.mangledName;

	return util.renderTemplate('templates/class.ejs', {
		constructors: constructors,
		no_constructor: noConstructor,
		entry: obj.object || { name: name },
		state: state,
		metadata: state.metadata,
		object: obj,
		instanceName: obj.instanceName,
		fullInstanceName: obj.fullInstanceName || obj.className.replace(/\./g, '::'),
		name: name,
		varname: convertToVarName(name),
		instance_readonly_properties: obj.instance_readonly_properties || {},
		instance_readwrite_properties: obj.instance_readwrite_properties || {},
		class_readonly_properties: obj.class_readonly_properties || {},
		class_readwrite_properties: obj.class_readwrite_properties || {},
		readonly_properties: obj.readonly_properties || {},
		readwrite_properties: obj.readwrite_properties || {},
		instance_methods: obj.instance_methods || {},
		class_methods: obj.class_methods || {},
		hasMethodPrototype: hasMethodPrototype,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify,
		imports: imports,
		_includes: includes
	}, __dirname);

}

/**
 * return struct header contents
 */
function generateStructHeader(state, name) {

	var obj = resolveType(state, name),
		helper = resolveType(state, name + 'Helper'),
		instanceName = obj.type.replace('const ', ''), //FIXME
	// de-dup them
		externs = _.uniq(state.externs[obj.type] || []).sort(),
		imports = _.uniq(state.imports[obj.type] || []).sort(),
		includes = _.uniq(state.includes[obj.type] || []).sort(),
		typedefs = _.uniq(state.typedefs[obj.type] || []).sort();

	instanceName += ' *';
	if (obj.framework && imports.indexOf(obj.framework) === -1) {
		imports.push(obj.framework);
	}
	if (obj.import && includes.indexOf(obj.import) === -1) {
		includes.push(obj.import);
	}

	return util.renderTemplate('templates/struct_header.ejs', {
		state: state,
		entry: obj.object,
		object: obj,
		varname: convertToVarName(obj.type),
		imports: imports,
		_includes: includes,
		_usings: convertToUsings(includes, obj.className, helper && helper.className),
		externs: externs,
		typedefs: typedefs,
		instanceName: instanceName,
		name: obj.mangledName,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify
	}, __dirname);
}

function generateCast(state, name, symbol) {
	var obj = resolveType(state, symbol.argType),
		templateArgs = {
			state: state,
			entry: obj.object || {},
			functionName: symbol.functionName,
			object: obj,
			mangledName: obj.mangledName,
			name: name,
			varname: convertToVarName(obj.simpleType),
			simpleType: obj.simpleType,
			type: obj.type,
			indentify: indentify
		};

	return {
		code: util.renderTemplate('templates/cast_register.ejs', templateArgs, __dirname),
		body: util.renderTemplate('templates/cast.ejs', templateArgs, __dirname)
	};
}


function generateGeneric(state, name, symbol) {
	var templateArgs = {
		state: state,
		args: symbol.args,
		targetType: symbol.targetType,
		functionName: symbol.functionName,
		indentify: indentify
	};

	return {
		code: util.renderTemplate('templates/generic_register.ejs', templateArgs, __dirname),
		body: util.renderTemplate('templates/generic.ejs', templateArgs, __dirname)
	};
}

/**
 * return struct contents
 */
function generateStruct(state, name) {

	var obj = resolveType(state, name),
		helper = resolveType(state, name + 'Helper'),
		helperConstructorMethods = helper && helper.object.methods.filter(function(m) {
			var hasNonTrivialArgs = m.args.filter(function(arg) {
				return arg.type.indexOf('.') >= 0;
			}).length > 0;
			return m.args.length > 1 && m.name !== 'Equals' && !hasNonTrivialArgs;
		}),
		instanceName = obj.type.replace('const ', ''),  //FIXME
		assign = false;
	
	instanceName += ' *';

	var fieldMap = obj.object.fields,
		fieldArray = [];
	for (var key in fieldMap) {
		if (fieldMap.hasOwnProperty(key)) {
			fieldArray.push(fieldMap[key]);
		}
	}
	// TODO: How do we determine from the metabase that this struct has no setters?
	if (name === 'GridLength') {
		fieldArray.forEach(function(field) {
			field.readonly = true;
		});
	}
	obj.object.fields = fieldArray;

	// void * or typeless structs (whereby fields are hidden from header) must be assigned and not copied
	if (obj.object && !obj.object.fields || obj.is_void) {
		assign = true;
	}

	return util.renderTemplate('templates/struct.ejs', {
		state: state,
		entry: obj.object || {},
		object: obj,
		helper: helper,
		helperConstructorMethods: helperConstructorMethods,
		instanceName: instanceName,
		varname: convertToVarName(obj.simpleType),
		name: obj.mangledName,
		simpleType: obj.simpleType,
		type: obj.type,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify,
		assign: assign
	}, __dirname);
}

/**
 * return a suitable default value
 */
function defaultValue(obj) {
	if (obj.is_char_array) {
		return "NULL";
	}
	if (obj.simpleType == 'char') {
		return "'\\0'";
	}
	if (obj.is_primitive) {
		return "0";
	}
	return "NULL";
}

/**
 * generate enum code
 */
function generateEnum(state, cn) {
	var obj = resolveType(state, cn);
	if (obj.object.alias) {
		obj = resolveType(state, obj.object.alias);
		if (obj.object.alias) {
			obj = resolveType(state, obj.object.alias);
		}
	}

	var fieldMap = obj.object.fields,
		fieldArray = [];
	for (var key in fieldMap) {
		if (fieldMap.hasOwnProperty(key) && fieldMap[key].attributes && fieldMap[key].attributes.indexOf('private') === -1) {
			fieldArray.push(fieldMap[key]);
		}
	}
	obj.object.fields = fieldArray;

	var templateArgs = {
		state: state,
		object: obj,
		instanceName: obj.instanceName,
		_includes: [],
		_usings: convertToUsings([ obj.className ]),
		entry: obj.object || { },
		varname: convertToVarName(obj.simpleType),
		name: obj.mangledName,
		simpleType: obj.simpleType,
		type: obj.type,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify,
		assign: true
	};

	return {
		header: util.renderTemplate('templates/enum_header.ejs', templateArgs, __dirname),
		implementation: util.renderTemplate('templates/enum.ejs', templateArgs, __dirname)
	};
}

/**
 * return the method object for a given method name
 */
function findSuperClassMethod(state, name, typeobj) {
	var sc = typeobj.superClass;
	while (sc && sc !== '[mscorlib]System.Object') {
		var m = sc.methods && sc.methods[name];
		if (m) {
			return m[0];
		}
		sc = sc.superClass;
	}
	return null;
}

function generateCustomClass(state, name, classdef, srcdir, srcs, version) {
	var methods = [],
		imports = [],
		includes = [],
		instance_methods = {},
		copymethods = _.clone(classdef.methods),
		typeobj,
		extendsType = classdef.extendsName && resolveType(state, classdef.extendsName || 'Object');

	// convert our class definition methods into metabase style methods
	classdef.methods.forEach(function(method) {
		var returnType = resolveType(state, method.returnType || 'void'),
			args = [];
		if (method.arguments) {
			for (var c = 0; c < method.arguments.length; c++) {
				var arg = method.arguments[c],
					type = resolveType(state, arg.type);
				type && type.className && arg.type != 'object' && includes.push(type.className);
				arg.typeObject = type;
				args.push(arg);
			}
		}
		if (method.forHandler) {
			var into = state.handlerBindings[method.forHandler];
			if (!into) {
				into = state.handlerBindings[method.forHandler] = [];
			}
			into.push({ className: classdef.className, methodName: method.name });
		}

		instance_methods[method.name] = [
			{
				name: method.name,
				args: args,
				returnType: method.returnType,
				instance: true,
				methodtype: 'method'
			}
		];
	});
	classdef.methods = instance_methods;

	classdef.superClass = extendsType && extendsType.name;
	state.customclasses[name] = classdef;

	// now turn this custom class into a metatype
	typeobj = resolveType(state, name);

	classdef.interfaces && classdef.interfaces.forEach(function(i) {
		var t = resolveType(state, i);
		t.object.framework && imports.push(t.object.framework);
	});

	// build the code blocks for each method
	copymethods.forEach(function(method) {
		var returnType = resolveType(state, method.returnType || 'void'),
			selectorsig = returnType.type + ' ' + method.name + '(',
			selector = method.name,
			code = [],
			cleanup = [],
			argnames = [],
			init = '',
			override = findSuperClassMethod(state, method.name, typeobj),
			instancetype = override && override.returnSubtype === 'instancetype';

		if (method.arguments) {

			code.push('JSObjectRef params$ = JSObjectMake(ctx,0,0);');
			code.push('JSValueRef args$ref[1];');
			code.push('args$ref[0]=params$;');

			for (var c = 0; c < method.arguments.length; c++) {
				var arg = method.arguments[c],
					type = resolveType(state, arg.type) || { type: arg.type };
				if (c === 0) {
					selectorsig += arg.type + ' ' + (arg.property || arg.name) + '$';
					selector += '';
				}
				else {
					selectorsig += ', ' + arg.type + ' ' + arg.name + '$';
					selector += arg.name;
				}
				argnames.push(arg.name);
				var varassign = convertToJSValueRef(state, typeobj, type.mangledName || type.type, type, arg.name);
				code.push(varassign);
				if (type.is_object && !type.is_primitive && !type.is_void) {
					code.push('if (' + arg.name + '$ == nullptr)');
					code.push('{');
					code.push('\t' + arg.name + ' = JSValueMakeNull(ctx);');
					code.push('}');
				}
				code.push('JSStringRef name$' + arg.name + ' = JSStringCreateWithUTF8CString("' + (arg.property || arg.name) + '");');
				code.push('JSObjectSetProperty(ctx, params$, name$' + arg.name + ', ' + arg.name + ', kJSPropertyAttributeNone, 0);');
				code.push('JSStringRelease(name$' + arg.name + ');');
				if (override) {
					if (c === 0) {
						init += ':' + arg.name + '$';
					}
					else {
						init += arg.name + ':' + arg.name + '$';
					}
					if (c + 1 < method.arguments.length) {
						init += ' ';
					}
				}
			}
			if (override && selector !== override.selector) {
				override = null;
				init = null;
			}
		}
		else {
			code.push('JSValueRef args$ref=NULL;');
		}

		code.push('JSValueRef exception$ = NULL;');
		code.push('JSStringRef action$name$ = JSStringCreateWithUTF8CString("' + method.action_name + '");');
		code.push('JSValueRef fnv$ = JSObjectGetProperty(ctx,source,action$name$,&exception$);');
		code.push('JSObjectRef fn$ = JSValueToObject(ctx,fnv$,0);');
		code.push('JSStringRelease(action$name$);');
		cleanup.length && (code = code.concat(cleanup));

		if (!returnType.is_void) {
			code.push('JSValueRef result$$ = JSObjectCallAsFunction(ctx, fn$, thisObject, ' + method.arguments.length + ', args$ref, &exception$);');
			code.push('CHECK_EXCEPTION(ctx, exception$);');
			code.push('bool free$ = false;');
			if (instancetype) {
				code.push('self.selfObject = JSValueToObject(ctx,result$$,0); //no retain');
				name && state.externs[typeobj.type].push('extern ' + name + '^ HyperloopJSValueRefTo' + name + '(JSContextRef, JSValueRef, JSValueRef*, bool*);');
				code.push('self = HyperloopJSValueRefTo' + name + '(ctx,result$$,&exception$,&free$);');
				code.push('return self;');
			}
			else {
				code.push('return HyperloopJSValueRefTo' + returnType.mangledName + '(ctx,result$$,&exception$,&free$);');
			}
			// export this symbol
			returnType.externTypedef && (state.typedefs[typeobj.type] = state.typedefs[typeobj.type].concat(returnType.externTypedef));
			// export this symbol
			state.externs[typeobj.type].push('extern ' + returnType.type + ' HyperloopJSValueRefTo' + returnType.mangledName + '(JSContextRef, JSValueRef, JSValueRef*, bool*);');
		}
		else {
			code.push('JSObjectCallAsFunction(ctx,fn$,thisObject,1,args$ref,&exception$);');
			code.push('CHECK_EXCEPTION(ctx, exception$);');
		}

		// we throw away the code here, but this is necessary to resolve types for the JS generation methods
		makeMethod(state, typeobj, method.name, 'result', 'instance', 'arguments', 'argumentCount');
		
		if (override) {
			init += ']';
			instancetype && (init += ')');
		}

		code = code.join('\n');

		if (instancetype) {
			var initcode = [];
			initcode.push('if (!isInit)');
			initcode.push('{');
			initcode.push('\t' + init);
			initcode.push('\t{');
			initcode.push('\t\treturn self;');
			initcode.push('\t}');
			initcode.push('}');
			code = initcode.join('\n') + '\n' + code;
		}

		var m = {
			code: code + '\n' + cleanup.join('\n'),
			override: method.override,
			selector: selectorsig.trim() + ')',
			method: method
		};
		methods.push(m);
	});

	var class_methods = {};

	Object.keys(typeobj.class_methods).sort().forEach(function(m) {
		var classMethod = typeobj.class_methods[m];
		// Skip non-public methods.
		if (classMethod[0].attributes && classMethod[0].attributes.indexOf('public') === -1) {
			return;
		}

		class_methods[m] = makeMethod(state, typeobj, classMethod, 'result', 'instance', 'arguments', 'argumentCount', function(resultname, instancename) {
			if (typeobj.class_methods[m][0].returnSubtype === 'instancetype' || typeobj.class_methods[m][0].returnSubtype === 'id') {
				var code = [];
				code.push('if ([' + instancename + ' isKindOfClass:[' + typeobj.simpleType + ' class]])');
				code.push('{');
				code.push('\t[((' + typeobj.simpleType + ' *)' + instancename + ') _configure:private->callback context:private->context];');
				code.push('}');
				return code.join('\n');
			}
		});
	});

	imports = imports.concat(_.uniq(state.imports[typeobj.type]));

	var _includes = state.includes[typeobj.type] = _.uniq(_.union(state.includes[typeobj.type], includes)),
		externs = _.uniq(state.externs[typeobj.type]),
		typedefs = _.uniq(state.typedefs[typeobj.type]);

	// push the extern for our superClass which we will inject as super property of this
	externs.push('extern JSValueRef Hyperloop' + classdef.extendsName + 'ToJSValueRef(JSContextRef, ' + classdef.extendsName + '^);');

	var header = util.renderTemplate('templates/custom_class_header.ejs', {
			methods: methods,
			className: typeobj.object.className,
			class_methods: class_methods,
			instanceName: typeobj.instanceName,
			interfaces: classdef.interfaces,
			extendsName: classdef.extendsName,
			imports: imports,
			_includes: _includes,
			_usings: convertToUsings(_includes),
			externs: externs,
			typedefs: typedefs,
		indentify: indentify
		}, __dirname),
		implementation = util.renderTemplate('templates/custom_class.ejs', {
			methods: methods,
			className: typeobj.simpleType,
			name: typeobj.name,
			instanceName: typeobj.instanceName,
			interfaces: classdef.interfaces,
			extendsName: classdef.extendsName,
			imports: imports,
			_includes: _includes,
			class_methods: class_methods,
			instance_methods: instance_methods,
			externs: externs,
			typedefs: typedefs,
			indentify: indentify,
			makeMethod: makeMethod,
			state: state,
			object: typeobj,
			varname: 'instance'
		}, __dirname);

	return {
		header: header,
		implementation: implementation
	};
}

/**
 * Transforms the passed in includes in to an array of proper using namespaces. Accepts variadic args. 
 * @param includes The base includes.
 * @param {...Array} var_args Any additional namespaces to also add, such as the class's namespace itself.
 * @returns {*}
 */
function convertToUsings(includes, var_args) {
	var retVal = _.uniq(includes.map(function(imp) {
		return imp.split('.').slice(0, -1).join('::');
	}).filter(function(ns) {
		return !!ns;
	}));
	for (var i = 1, iL = arguments.length; i < iL; i++) {
		var optNS = arguments[i] && arguments[i].split('.').slice(0, -1).join('::');
		if (optNS && retVal.indexOf(optNS) === -1) {
			retVal.push(optNS);
		}
	}
	return retVal;
}

function convertToVarName(simpleName) {
	if (!simpleName) {
		return simpleName;
	}
	simpleName = simpleName.toLowerCase();
	switch (simpleName) {
		case 'typename':
		case 'inline':
			simpleName += '_';
			break;
	}
	return simpleName;
}