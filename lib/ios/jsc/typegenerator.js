/**
 * iOS backend generator
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	semver = require('semver'),
	wrench = require('wrench'),
	_ = require('underscore'),
	log = require('../../log'),
	buildlib = require('../buildlib'),
	objc = require('../objc'),
	interface_to_native_class_template = fs.readFileSync(path.join(__dirname,'templates','interface_to_native_class.ejs')).toString(),
	interface_to_native_class_header_template = fs.readFileSync(path.join(__dirname,'templates','interface_to_native_class_header.ejs')).toString(),
	custom_class_template = fs.readFileSync(path.join(__dirname,'templates','custom_class.ejs')).toString(),
	custom_class_header_template = fs.readFileSync(path.join(__dirname,'templates','custom_class_header.ejs')).toString(),
	class_template = fs.readFileSync(path.join(__dirname,'templates','implementation.ejs')).toString(),
	header_template = fs.readFileSync(path.join(__dirname,'templates','header.ejs')).toString(),
	struct_template = fs.readFileSync(path.join(__dirname,'templates','struct.ejs')).toString(),
	struct_header_template = fs.readFileSync(path.join(__dirname,'templates','struct_header.ejs')).toString(),
	typedef_template = fs.readFileSync(path.join(__dirname,'templates','typedef.ejs')).toString(),
	typedef_header_template = fs.readFileSync(path.join(__dirname,'templates','typedef_header.ejs')).toString(),
	type_to_native_template = fs.readFileSync(path.join(__dirname,'templates','type_to_native.ejs')).toString(),
	block_to_native_template = fs.readFileSync(path.join(__dirname,'templates','block_to_native.ejs')).toString(),
	function_to_native_template = fs.readFileSync(path.join(__dirname,'templates','function_to_native.ejs')).toString(),
	function_pointer_to_native_template = fs.readFileSync(path.join(__dirname,'templates','function_pointer_to_native.ejs')).toString(),
	enum_to_native_template = fs.readFileSync(path.join(__dirname,'templates','enum_to_native.ejs')).toString(),
	primitiveTypeRegex = /^(un)?(signed)?\s*(short|float|double|long|bool|int|char|unichar|_Bool)/i,
	voidpointerRegex = /^(const)?\s*void\s?\*?/,
	subarrayRegex = /(un?signed)?\s*(\w+)\s*\[(\d+)?\]/,
	signedRegex = /(un?signed )/,
	protocolRegex = /(\w+)<(.*)>/,
	INDENT = '    ';

exports.createState = createState;
exports.resolveType = resolveType;
exports.indentify = indentify;
exports.sortOutSystemFrameworks = sortOutSystemFrameworks;
exports.generateStruct = generateStruct;
exports.generateInterface = generateInterface;
exports.generateTypedef = generateTypedef;
exports.generatePrimitive = generatePrimitive;
exports.generateEnum = generateEnum;
exports.generateBlock = generateBlock;
exports.generateFunction = generateFunction;
exports.generateFunctionPointer = generateFunctionPointer;
exports.generateStructHeader = generateStructHeader;
exports.generateInterfaceHeader = generateInterfaceHeader;
exports.generateTypedefHeader = generateTypedefHeader;
exports.generateCustomClass = generateCustomClass;
exports.generateInterfaceConverters = generateInterfaceConverters;
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
	'Protocol',
	'NSSocketPort',	 // not available on iOS, although clang says it is
	'NSPortMessage'	 // not available on iOS, although clang says it is
];


/**
 * turn a string of content into a string with each line with an indent
 */
function indentify(string, indent) {
	indent = indent || INDENT;
	var c = 0;
	return string.split(/\n/).map(function(s){ return ((c++ > 0) ? indent : '') + s }).join('\n');
}

/**
 * taken a type (such as const char * or UIView *) return a stripped down type removing all the
 * extra fluff like const and signed attributes that are modifiers to the type object.
 */
function convertToSimpleType (type) {
	var t = type.replace('unsigned ','')
				.replace('signed ','')
				.replace('struct ','')
				.replace('union ','')
				.replace('enum ','')
				.replace(/__unsafe_unretained/g,'')
				.replace(/__strong/g,'')
				.replace('volatile','')
				.replace(' *const','')
				.replace('const ','')
				.replace(/\*/g,'')
				.trim();
	if (t in TRANSLATED_TYPES) {
		return TRANSLATED_TYPES[t];
	}
	return t;
}

/**
 * create a mangled symbol name from a fully qualified type (such as const char *)
 */
function mangleTypeName (type) {
	return type.replace(/[\(\)\[\]\s,<>\.]/g, '_').replace(/\^/g,'B').replace(/\*/g,'P');
}

/**
 * return true if symbol is referenced
 */
function isSymbolReferenced (state, classname, name, type) {
	var simpleName = convertToSimpleType(classname),
		referenced = state.referenceTable && state.referenceTable[simpleName],
		types = referenced && referenced[type];
		found = types && types.indexOf(name)!==-1;

	// if found or if we're compiling in all symbols (denoted by missing referenceTable)
	return (found || state.referenceTable===undefined);
}

/**
 * create a state object that we can use during compilation and that can be passed along to functions
 */
function createState (metadata, version, referenceTable) {
	return {
		metadata: metadata,
		version: version,
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
function satisfies (check, version) {
	if (!check || check==='0') return false;
	check = makeVersion(check);
	version = makeVersion(version);
	return semver.gte(version,check);
}

/**
 * iOS versions can be in the form X.X but semver requires X.X.X
 */
function makeVersion (version) {
	if (!version) throw new Error('version is null');
	if (version.split('.').length===2) {
		version+='.0';
	}
	return version;
}

/**
 * return true if this metadata type is available on this platform, version
 */
function available(obj, version) {
	if (!obj) throw new Error('object cannot be null');
	var availability = obj.availability;
	if (availability && (availability.message==='Unavailable' || availability.platform!=='ios')) {
		return false;
	}
	if (obj.unavailable) {
		return false;
	}
	if (availability && satisfies(availability.deprecated,version)) {
		return false;
	}
	return true;
}

/**
 * return true if a method prototype is found
 */
function hasMethodPrototype(metadata,entry,name) {
	var e = entry;
	while(entry) {
		if (entry.methods && name in entry.methods) {
			return true;
		}
		entry = metadata.classes[entry.superClass];
	}
	return false;
}

function resolveObject(state,result) {

	var name = result.name,
		simpleType = result.simpleType,
		imports = state.imports[result.type],
		includes = state.includes[result.type];

	result.object.superClass && (result.superClass = resolveType(state, result.object.superClass));
	result.object.protocols && (result.protocols = []) && result.object.protocols.forEach(function(k){ result.protocols.push(resolveType(state, k)); });
	result.methods = {};
	result.readwrite_properties = {},
	result.readonly_properties = {},
	result.instance_methods = {},
	result.class_methods = {};

	result.object.methods && Object.keys(result.object.methods).forEach(function(name) {
		if (!isSymbolReferenced(state, simpleType, name, 'methods')) {
			return;
		}
		var methods = result.object.methods[name],
			copymethods = [],
			skip = false;

		if (methods.constructor.name!=Array.prototype.constructor.name) {
			var array = [];
			array.push(methods);
			methods = array;
		}

		methods.forEach(function(method) {
			var availability = method.availability || {platform:'ios'};
		    if (availability.message==='Unavailable' || availability.platform!=='ios') {
		    	// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is unavailable',availability);
		        return;
		    }
		    if (method.unavailable) {
		    	// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is',method.unavailable);
		        return;
		    }
		    if (satisfies(availability.deprecated,state.version)) {
		    	// log.debug('['+(method.instance?'-':'+')+result.simpleType+' '+name+']','is',availability);
		        return;
		    }
			var m = _.clone(method);
			m.returnType = resolveType(state, method.returnType);
			if (method.returnType==='signed char' && method.returnSubtype==='BOOL') {
				m.returnType = resolveType(state, 'bool');
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
					if (a.type==='signed char' && a.subtype==='BOOL') {
						rt = resolveType(state, 'bool');
					}
					var rtc = _.clone(rt);
					rtc.argument = a;
					args.push(rtc);
				});
			}
			if (!skip) {
				m.args = args;
				if (m.instance) {
					result.instance_methods[name] = m;
				}
				else {
					result.class_methods[name] = m;
				}
				copymethods.push(m);
				// sometimes, methods are added from a category and they are from a different
				// framework than our interface, so we need to add to our imports
				method.framework && imports.push(method.framework);
				method.import && includes.push(method.import);
			}
		});
		if (!skip && copymethods.length) {
			result.methods[name] = copymethods;
		}
	});
	result.properties = {};
	result.object.properties && Object.keys(result.object.properties).forEach(function(name) {
		var property = result.object.properties[name],
            attributes = property.attributes,
        	readonly = attributes && attributes.indexOf('readonly')!=-1,
        	availability = property.availability || {platform:'ios'};
        if (availability.message==='Unavailable' || availability.platform!=='ios') {
            return;
        }
        if (property.unavailable) {
            return;
        }
        if (satisfies(availability.deprecated,state.version)) {
            return;
        }
	    if (!isSymbolReferenced(state, simpleType, name, 'properties')) {
	    	return;
	    }
        var p = resolveType(state, property.type);
		if (property.type==='signed char' && property.subtype==='BOOL') {
			p = resolveType(state, 'bool');
		}

		if (readonly) {
			result.readonly_properties[name] = p;
		}
		else {
			result.readwrite_properties[name] = p;
		}
		result.properties[name] = p;
	});

	// copy all static Class methods into the class_methods hash
	var sc = result.object.superClass && resolveType(state,result.object.superClass);
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

	return result;
}

/**
 * this method will attempt to resolve all graph dependencies for a given symbol.  for example, if the type is a class, it will
 * examine all methods and properties to resolve any dependencies found in method signatures, return types, etc.  the dependencies
 * argument should be a object literal that will be populated with any dependencies required in the graph.  the key is the
 * full type and the value is the result of this function which is a meta object that has enough information to generate code
 * for this type.
 */
function resolveType (state, type) {
	type = type.trim();
	// if we've already mapped it, just return it
	if (type in state.dependencies) {
		return state.dependencies[type];
	}
	// turn the type into something that we can lookup -- for example, strip all the extra typing information that isn't important to convert this type object into a type we can deal with
	var simpleType = convertToSimpleType(type),
		metadata = state.metadata,
		classObject = metadata.classes[simpleType],
		protoObject = !classObject && metadata.protocols[simpleType],
		typedObject = !protoObject && metadata.types[type] || metadata.types[simpleType],
		symbolObject = !typedObject && metadata.symbols[simpleType],
		typeObject = classObject || protoObject || typedObject || symbolObject,
		is_function_pointer = type.indexOf('(*)')>0,
		is_block = !is_function_pointer && type.indexOf('(^)')>0,
		is_pointer = !is_function_pointer && !is_block && type.indexOf('*')>0,
		is_void = !is_function_pointer && !is_block && voidpointerRegex.test(type),
		is_void_pointer = is_void && is_pointer,
		is_pointer_to_pointer = is_pointer && (type.indexOf('**')>0 || type.indexOf('*const *')>0),
		is_primitive = !is_function_pointer && !is_block && primitiveTypeRegex.test(simpleType),
		is_object = !!(classObject || protoObject),
		is_protocol = !is_function_pointer && !is_block && protocolRegex.test(type),
		is_interface = !!classObject,
		is_function = symbolObject && symbolObject.metatype==='function',
		is_array = is_primitive && subarrayRegex.test(type),
		is_const = type.indexOf('const ')!==-1,
		is_char_array = is_array && /char/.test(simpleType),
		is_union = type.indexOf('union ')>=0,
		is_struct = (typedObject && ((typedObject.type && typedObject.type.indexOf('struct ')!==-1) || (typedObject.subtype && typedObject.subtype.indexOf('struct ')!==-1))) || false,
		is_enum = (typedObject && typedObject.metatype=='enum' ||  typedObject && ((typedObject.type && typedObject.type.indexOf('enum ')!==-1) || (typedObject.subtype && typedObject.subtype.indexOf('enum ')!==-1))),
		is_custom_class = false,
		name = (typedObject && typedObject.alias) || type,
		mangled = mangleTypeName(name),
		realtype = type;

	// check to see if it's blacklisted
	if (BLACKLIST_CLASSES.indexOf(simpleType)!==-1) {
		return null;
	}
	if (is_object && type in state.dependencies) {
		return state.dependencies[type];
	}
	// we shouldn't get here but sometimes we can if we have an issue or a bad type that clang is not reporting correctly
	if (!is_void && !is_function_pointer && !typeObject && !is_primitive && !is_block && !is_protocol && !is_void_pointer) {
		if (type in state.customclasses) {
			is_custom_class = true;
			is_object = true;
			is_interface = true;
			name = type+' *';
			typeObject = classObject = state.customclasses[type];
		}
		else {
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
		if (typedObject.type==='void' && !is_pointer) {
			is_void_pointer = is_void = true;
			name += ' *';
			mangled = mangleTypeName(name);
		}
	}

	// treat unions like structures
	if (is_union || typedObject && typedObject.type && typedObject.type.indexOf('union ')>=0){
		is_struct = true;
		if (typedObject.type==='union') {
			name = type = 'union '+typedObject.name;
		}
	}

	// trim off any const
	name = name.replace(' *const',' *').trim();

	if (!is_primitive && typeObject && typeObject.metatype==='typedef' && primitiveTypeRegex.test(typeObject.type)) {
		is_primitive = true;
		is_struct = false;
	}
	// this meta object will give us enough information about the typing to be able to generate code
	var result = {
		metatype: is_function ? 'function' : is_enum ? 'enum' : is_struct ? 'struct' : is_primitive ? 'primitive' : classObject ? 'interface' : protoObject ? 'protocol' : typedObject ? 'typedef' : symbolObject ? 'symbol' : is_protocol ? 'protocol' : is_function_pointer ? 'function_pointer' : is_block ? 'block' : 'other',
		realtype: realtype,
		type: name,
		name: name,
		simpleType: simpleType,
		is_void: is_void,
		object: typeObject,
		is_function: is_function,
		is_function_pointer: is_function_pointer,
		is_block: is_block,
		is_pointer: is_pointer,
		is_void_pointer: is_void_pointer,
		is_pointer_to_pointer: is_pointer_to_pointer,
		is_primitive: is_primitive,
		is_protocol: is_protocol,
		is_object: is_object,
		is_array: is_array,
		is_const: is_const,
		is_char_array: is_char_array,
		is_struct: is_struct,
		is_custom_class: is_custom_class,
		instanceName: name.replace('const ','').trim(),
		mangledName: mangled   //mangle the name so we can build a consistent and safe function name from it
	};
	// check to see if we have an alias and if so, resolve to it
	if (typedObject && typedObject.alias && simpleType!=typedObject.alias) {
		return resolveType(state,typedObject.alias);
	}
	// turn a NSString ** to NSString *
	if (is_pointer_to_pointer && is_object) {
		result.name = result.type = type.replace('**','*');
		result.mangledName = mangleTypeName(result.type);
	}
	if (is_object && !is_pointer_to_pointer) {
		// if an protocol or class, insert with just plain Class name
		state.dependencies[simpleType] = result;
	}
	// if we're an interface or protocol, just use the simpleType as the key
	if (!(type in state.dependencies)) {
		state.dependencies[type] = result;
	}

	if (is_array) {
		var m = subarrayRegex.exec(type),
			length = parseInt(m[3])||0;
		result.simpleType = simpleType = ((m[1]||'') +' ' + m[2]).trim();
		result.type = type = result.name = simpleType+' *';
		result.is_pointer = true;
		result.length = length;
		// force a dependency analysis
		resolveType(state, type);
	}
	else if (is_protocol) {
		var m = protocolRegex.exec(type),
			cls = m[1],
			protonames = m[2].split(','),
			interf = metadata.classes[cls] || metadata.protocols[cls] || {'metatype':'id'},
			protocols = [];
		protonames.forEach(function(n) {
			var p = resolveType(state, n);
			protocols.push(p);
		});
		result.protocols = protocols;
		result.protocolNames = protonames;
		result.baseObject = resolveType(state, cls);

		// merge the base object also with the protocols
		var newobj = _.clone(result.baseObject);
		protocols.forEach(function(p) {
			newobj = _.defaults(newobj, p.object);
		});

		result.object = newobj;

		var saved_name = result.name;

		// turn id base object into NSObject pointer
		if (cls==='id') {
			result.name = 'NSObject<'+m[2]+'>';
		}
		else {
			result.name = type;
		}
		if (!is_pointer && result.name.indexOf('*')===-1 && cls!=='Class') {
		 	result.name+=' *';
		}
		else if (cls==='Class') {
			// if the base is Class *, we need to remove the *
			result.name = result.type = result.name.replace(' *','').trim();
		}
		result.instanceName = result.name;
		if (result.instanceName.indexOf(' *')===-1 && cls!=='Class') {
			result.instanceName +=' *';
		}
		result.name = saved_name;
		// force a dependency analysis
		resolveType(state, result.name);
		resolveType(state, result.instanceName);
	}
	else if (is_interface) {
		result.mangledName = mangleTypeName(simpleType);
		if (!is_pointer && result.name.indexOf('*')===-1) {
			// create a valid object pointer
			result.name+=' *';
			result.type=result.name;
		}
	}
	else if (protoObject) {
		//result.instanceName = 'NSObject<'+type+'> *';
		result.name = 'NSObject<'+type+'> *';
		result.type = result.name;
		result.baseObject = resolveType(state,'NSObject');
		result.protocolNames = [type];
	}
	else if (is_block) {
		var i = type.indexOf('(^)'),
			rt = type.substring(0,i),
			args = type.substring(i+4,type.length-1).split(',').map(function(n){ return n.trim() });
		result.blockArgs = [];
		result.frameworks = [];
		result.blockReturnType = resolveType(state, rt);
		args.forEach(function(n){
			if (n==='...') {
				result.is_vararg = true;
				result.blockArgs.push({metatype:'sentinel'});
				return;
			}
			var a = resolveType(state, n);
			result.blockArgs.push(a);
			a.object && a.object.framework && result.frameworks.push(a.object.framework);
		});
		var blockargs = result.blockArgs.map(function(a){return a.type}),
			blocktypedef = 'Block_'+result.mangledName,
			typedef = 'typedef '+result.blockReturnType.type+' (^'+blocktypedef+')('+args.join(',')+')' + ';';
		// remap to the typedef
		result.type = result.simpleType = simpleType = blocktypedef;
		result.externTypedef = typedef;
		result.blockReturnType.object && result.blockReturnType.object.framework && result.frameworks.push(result.blockReturnType.object.framework);
		state.dependencies[simpleType] = result;
	}
	else if (is_function_pointer) {
		var i = type.indexOf('(*)'),
			rt = type.substring(0,i),
			args = type.substring(i+4,type.length-1).split(',').map(function(n){ return n.trim() });

		result.functionPointerArgs = [];
		result.functionPointerReturnType = resolveType(state, rt);

		args.forEach(function(n){
			if (n==='...') {
				result.is_vararg = true;
				return;
			}
			var a = resolveType(state, n);
			result.functionPointerArgs.push(a);
		});

		var fpargs = result.functionPointerArgs.map(function(a){return a.type}),
			fptypedef = 'Function_'+result.mangledName,
			typedef = 'typedef '+result.functionPointerReturnType.type+' (*'+fptypedef+')('+fpargs.join(',')+(result.is_vararg?',...':'')+');';
		// remap to the typedef
		result.type = result.simpleType = simpleType = fptypedef;
		result.externTypedef = typedef;
		state.dependencies[simpleType] = result;
	}
	else if (is_function) {
		resolveType(state,result.object.returnType);
		result.object.arguments.forEach(function(arg){
			resolveType(state,arg.type);
		});
	}
	else if (is_struct)
	{
		if (!is_const) {
			resolveType(state,'const '+type);
		}
		if (typeObject.fields) {
			// resolve all field types
			typeObject.fields.forEach(function(field){
				resolveType(state,field.type);
			});
		}
	}

	var imports = [],
		includes = [];

	// add the framework for this object
	result.object && result.object.framework && imports.push(result.object.framework);
	result.object && result.object.import && includes.push(result.object.import);

	// add our state context information
	state.imports[result.type]=imports;
	state.includes[result.type]=includes;
	state.externs[result.type]=[];
	state.typedefs[result.type]=[];


	// if this is an object (meaning we found a type object from the metadata) we are going to attempt to resolve any methods, properties if found
	if (result.is_object) {
		resolveObject(state,result);
	}

	return result;
}


/**
 * make a assignment to a variable for an argument
 */
function makeVarAssignmentFromJSValueRef (state, typeobj, arg, name, argname, cleanup) {
	if (!arg) throw new Error('arg is null');

	var type = arg.type,
		code = [],
		varassign,
		varname = name,
		varassign = arg.type,
		argobj = resolveType(state,varassign) || arg,
		fnname = 'HyperloopJSValueRefTo'+argobj.mangledName;

	varassign = argobj.type.replace('const ','').trim();

	if (arg.is_pointer_to_pointer) {
		varname = '&'+name+'$';

		// export our symbol
		var ex = 'Hyperloop'+arg.mangledName+'ToJSValueRef';
		if (arg.is_primitive && arg.is_pointer) {
			state.externs[typeobj.type].push('extern JSValueRef '+ex+'(JSContextRef,'+varassign+',size_t);');
			var t = arg.simpleType+'*',
				rt = resolveType(state,t),
				rtff = 'HyperloopJSValueRefTo'+rt.mangledName;
			code.push(arg.simpleType+'* '+name+'$ = '+rtff+'(ctx,'+argname+',exception,NULL);');
		}
		else {
			code.push(varassign+' '+name+'$ = NULL;');
			state.externs[typeobj.type].push('extern JSValueRef '+ex+'(JSContextRef,'+varassign+');');
			cleanup.push('if ('+name+'$)');
			cleanup.push('{');
			cleanup.push('\tJSValueRef '+name+' = '+ex+'(ctx, '+name+'$);');
			cleanup.push('\tJSObjectRef '+name+'$o = JSValueToObject(ctx,'+argname+',0);');
			cleanup.push('\tSetJSBufferValue(ctx,'+name+'$o,'+name+');');
			cleanup.push('}');
		}

	}
	else {
		var freevar = 'NULL',
			assign = '',
			dofree = false;
		if (arg.is_pointer || arg.is_struct) {
			freevar = name+'$free';
			assign = '&';
			code.push('bool '+freevar+' = false;');
			dofree = true;
		}
		// log.error('is_struct=',arg.is_struct,'pointer=',arg.is_pointer,'varname=',varname,'varassign=',varassign);
		if (arg.is_struct && !arg.is_pointer) {
			// structs must have pointer return type
			varassign += ' *';
			// but we must dereference it to set them
			varname = '*' + varname;
		}
		code.push(varassign+' '+name+' = '+fnname+'(ctx,'+argname+',exception,'+assign+freevar+');');
		if (dofree) {
			cleanup.push('if ('+freevar+')');
			cleanup.push('{');
			cleanup.push('\tfree('+name+');');
			cleanup.push('}');
		}

		// export this symbol
		arg.externTypedef && state.typedefs[typeobj.type].push(arg.externTypedef);

		// export this symbol
		state.externs[typeobj.type].push('extern '+varassign+' '+fnname+'(JSContextRef,JSValueRef,JSValueRef*,bool*);');
	}

	// add framework, includes
	argobj && argobj.object && argobj.object.framework && state.imports[typeobj.type].push(argobj.object.framework);
	argobj && argobj.object && argobj.object.import && state.includes[typeobj.type].push(argobj.object.import);

	return {
		code: code.join('\n'),
		varname: varname,
		is_array: arg.is_array,
		length: arg.length
	};
}

/**
 * code to turn value into a JSValueRef
 */
function convertToJSValueRef(state, typeobj, mangledName, arg, resultName) {
	var extern,
		code,
		fnname = 'Hyperloop'+mangledName+'ToJSValueRef';

	if (arg.is_primitive && arg.is_pointer && !arg.is_pointer_to_pointer) {
		extern = 'extern JSValueRef '+fnname+'(JSContextRef,'+arg.type+',size_t);';
		var size = 'malloc_size('+resultName+'$)';
		if (arg.is_array) {
			size = arg.length ? arg.length : 'sizeof('+resultName+'$)';
		}
		code = 'JSValueRef '+resultName+' = '+fnname+'(ctx, '+resultName+'$, '+size+');';
	}
	else {
		// log.error(typeobj.type,'=>',resultName,'=>',typeobj.is_pointer,'=>',arg.metatype,'=>',arg.type);
		var address_of = '',
			cast = '',
			type = arg.type;

		if (arg.is_struct) {
			address_of = '&';
			cast = '('+arg.type+' *)';
			type = arg.type+' *';
		}
		extern = 'extern JSValueRef '+fnname+'(JSContextRef,'+type+');';
		code = 'JSValueRef '+resultName+' = '+fnname+'(ctx, '+cast+address_of+resultName+'$);';
	}

	state.externs[typeobj.type].push(extern);
	return code;
}

/**
 * make a get property body
 */
function makeGetProperty (state, typeobj, property, propertyName, resultName, instanceName) {

	var cleanup = [],
		code = [],
		varname = property.name,
		argname = resultName,
		mangledName = property.mangledName || mangleTypeName(property.type),
		operator = typeobj.metatype==='struct' ? '->' : '.',
		expression = instanceName + operator + propertyName,
		propobj = resolveType(state,property.type);

	code.push(propobj.type+' '+resultName+'$ = '+expression+';');

	if (propobj.type === 'id') {
		// attempt to dynamically convert from id to our type
		code.push('JSValueRef '+resultName+' = (JSValueRef)[HyperloopConverters convertIDToJSValueRef:'+resultName+'$ withContext:(void*)ctx];');
	}
	else {
		// export this symbol
		property.externTypedef && state.typedefs[typeobj.type].push(property.externTypedef);
		code.push(convertToJSValueRef(state, typeobj, mangledName, propobj, resultName));
	}

	code.push('return '+resultName+';');

	return code.join('\n');
}

/**
 * make a set property body
 */
function makeSetProperty (state, typeobj, property, propertyName, instanceName, argumentsName, argumentsLengthName) {

	var varassign,
		operator,
		cleanup = [],
		code = [];

	if (typeobj.metatype==='struct') {
		operator = '->';
		var arg = resolveType(state,property.type);
		varassign = makeVarAssignmentFromJSValueRef(state, typeobj, arg, propertyName+'$'+0, 'value', cleanup);
	}
	else {
		var setter = 'set' + propertyName.charAt(0).toUpperCase() + propertyName.substring(1),
			method = typeobj.methods && typeobj.methods[setter] && typeobj.methods[setter][0],
			arg = method && method.args[0];

		operator = '.';

		if (arg) {
			varassign = makeVarAssignmentFromJSValueRef(state, typeobj, arg, arg.argument.name+'$'+0, 'value', cleanup);
		}
		else {
			var proparg = resolveType(state,property.type);
			varassign = makeVarAssignmentFromJSValueRef(state, typeobj, proparg, propertyName+'$'+0, 'value', cleanup);
		}
	}

	code.push(varassign.code);
	if (varassign.is_array) {
		for (var c=0;c<varassign.length;c++) {
			code.push(instanceName+operator+propertyName+'['+c+'] = '+varassign.varname+'['+c+'];');
		}
	}
	else {
		code.push(instanceName+operator+propertyName+' = '+varassign.varname+';');
	}

	cleanup.length && (code = code.concat(cleanup));

	return code.join('\n');
}

function makeAnyArg (name,value,type) {
	var code = [];

	//TODO: convert object to JSON

	code.push(type+' '+name+' = @"<null>";');
    code.push('if (JSValueIsObject(ctx,'+value+'))');
    code.push('{');
	code.push('\tJSObjectRef objectRef = JSValueToObject(ctx, '+value+', 0);');
	code.push('\t\tif (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeID))');
    code.push('\t\t{');
    code.push('\t\t\t'+name+' = ('+type+')HyperloopGetPrivateObjectAsID(objectRef);');
    code.push('\t\t}');
	code.push('\t\telse if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeClass))');
	code.push('\t\t{');
	code.push('\t\t\t'+name+' = ('+type+')HyperloopGetPrivateObjectAsClass(objectRef);');
	code.push('\t\t}');
	code.push('\t\telse if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeJSBuffer))');
	code.push('\t\t{');
	code.push('\t\t\tJSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(objectRef);');
	code.push('\t\t\t'+name+' = [NSString stringWithUTF8String:(const char*)buffer->buffer];');
	code.push('\t\t}');
	code.push('\t\telse');
	code.push('\t\t{');
	code.push('\t\t\JSStringRef jsonValue = JSValueCreateJSONString(ctx,'+value+',0,0);');
	code.push('\t\t\t'+name+' = ('+type+')HyperloopToNSStringFromString(ctx,jsonValue);');
	code.push('\t\t}');
	code.push('}');
	code.push('else if (JSValueIsBoolean(ctx,'+value+'))');
	code.push('{');
	code.push('\t'+name+' = [NSNumber numberWithBool:(bool)JSValueToBoolean(ctx,'+value+')];');
	code.push('}');
	code.push('else if (JSValueIsNumber(ctx,'+value+'))');
	code.push('{');
	code.push('\tdouble d = JSValueToNumber(ctx,'+value+',0);');
	code.push('\t'+name+' = [NSNumber numberWithDouble:d];');
	code.push('}');
	code.push('else if (JSValueIsString(ctx,'+value+'))');
	code.push('{');
	code.push('\t'+name+' = ('+type+')HyperloopToNSString(ctx,'+value+');');
	code.push('}');

	return code.join('\n');
}

/**
 * construct a function body
 */
function makeFunction (state, typeobj, argumentsName, argumentsLengthName) {
	var code = [],
		cleanup = [],
		returnbody,
		argnames = [],
		fnbody = '',
		args = typeobj.object.arguments,
		returnType = resolveType(state, typeobj.object.returnType);

	//TODO: check visibility

	if (returnType.is_void) {
		returnbody = 'JSValueRef result = JSValueMakeUndefined(ctx);';
	}
	else {
		returnType.externTypedef && state.typedefs[typeobj.type].push(returnType.externTypedef);
		returnbody = convertToJSValueRef(state, typeobj, returnType.mangledName, returnType, 'result');
	}

	if (typeobj.object.formatter && args.length) {
		var body = [];
		//TODO: pull out right type -> typeobj.object.arguments[0].type
		body.push('JSValueRef formatarg = '+argumentsName+'[0];');
		body.push('NSString *format = HyperloopToNSString(ctx,formatarg);');
		body.push('switch ('+argumentsLengthName+')');
		body.push('{');
		for (var c=1;c<5;c++) {
			body.push('\tcase '+c+':');
			body.push('\t{');

			var argnames = ['format'];

			if (c===1) {
				argnames.push('nil');
			}

			for (var x=1;x<c;x++) {
				var argname = 'arg'+x+'$'+c,
					anyType = 'id';
				argnames.push(argname);
				body.push('\t\tJSValueRef '+argname+'$value = '+argumentsName+'['+(x)+'];');
				body.push('\t\t'+indentify(makeAnyArg(argname,argname+'$value',anyType),'\t\t'));
			}

			var fn = typeobj.name+'('+argnames.join(',')+');';
			if (!returnType.is_void) {
				fn = returnType.type+' result$ = ' + fnbody;
			}

			body.push('\t\t'+fn);

			body.push('\t\tbreak;');
			body.push('\t}');
		}
		body.push('}');
		fnbody = body.join('\n');
	}
	else {
		var is_function = typeobj.object.metatype === 'function';

		for (var c=0;c<args.length;c++) {
			var arg =  is_function ?
				resolveType(state, args[c].type||args[c].name) :  // global functions such as fabsf don't have a type (where name is the type)
				resolveType(state, args[c].type);
			var va = makeVarAssignmentFromJSValueRef(state, typeobj, arg, args[c].name+'$'+c, argumentsName+'['+c+']', cleanup);
			code.push(va.code);
			if (is_function && !args[c].type) {
				// if we don't have a type (sometimes happens with global functions), don't cast
				argnames.push(va.varname);
			}
			else {
				argnames.push('('+args[c].type+') '+va.varname);
			}
		}
		fnbody = typeobj.name+'('+argnames.join(',')+');';
		if (!returnType.is_void) {
			fnbody = returnType.type+' result$ = ' + fnbody;
		}
	}

	code.push(fnbody);
	code.push(returnbody);
	cleanup.length && code.push(cleanup.join('\n'));
	code.push('return result;');

	return code.join('\n');
}

/**
 * construct a method body
 */
function makeMethod (state, typeobj, methodName, resultName, instanceName, argumentsName, argumentsLengthName, returnFilterFunc, useSuperCheck) {

	var methods = typeobj.methods && typeobj.methods[methodName],
		code = [],
		cases;

	if (!methods) {
		// search for method on a subclass
		var sc = typeobj.superClass;
		while (sc) {
			if (methodName in sc.methods) {
				methods = sc.methods[methodName];
				break;
			}
			sc = sc.superClass;
		}
		// if still not found, bail... this shouldn't happen
		if (!methods) {
			log.fatal("Couldn't find method named: "+methodName+" in "+typeobj.mangledName);
		}
	}

	if (methods.length > 1) {
		code.push('switch ('+argumentsLengthName+')');
		code.push('{');
		cases = [];
	}

	_.compact(methods).forEach(function(method) {

		var is_instance = method.instance,
			is_void = method.returnType.is_void,
			has_args = method.args.length > 0,
			sel = method.selector.split(':'),
			argbody = [],
			cleanup = [],
			argvarnames = [],
			fnbody,
			returnbody;

		//log.error(methodName,'=>',is_void);
		if (methods.length > 1) {
			if (cases.indexOf(method.args.length)!==-1) {
				// this is bad, this means we already have a case statement for this method. we have to drop it for now.
				log.debug('Dropping subsequent case with multiple method types for',typeobj.simpleType,method.name);
				return;
			}
			cases.push(method.args.length);
			code.push(INDENT+'case '+method.args.length+':');
			code.push(INDENT+'{');
		}

		if (!useSuperCheck) {
			if (is_instance) {
				fnbody = '[' + instanceName+' ' + method.name;
			}
			else {
				if (!method.instance && typeobj.metatype==='protocol') {
					// get the class from the object and use that instead of the normal class name
					fnbody = '[[' + instanceName+' class] ' + method.name;
				}
				else {
					fnbody = '[' + typeobj.simpleType + ' ' + method.name;
				}
			}
		}

		if (has_args) {

			if (method.formatter) {
				var cn = (is_instance ? instanceName : typeobj.simpleType);
				!is_void && code.push('id '+resultName+'$$ = nil;');
				var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, method.args[0], method.args[0].argument.name+'$'+0, argumentsName+'[0]', cleanup);
				code.push(INDENT+varassign.code);
				code.push(INDENT+'switch('+argumentsLengthName+')');
				code.push(INDENT+'{');
				for (var c=1;c<5;c++) {
					var argnames = [method.args[0].argument.name+'$'+0];
					code.push(INDENT+'\tcase '+c+':');
					code.push(INDENT+'\t{');
					if (c===1) {
						argnames.push('nil');
					}
					else {
						for (var x=1;x<c;x++) {
							code.push(INDENT+'\t\intptr_t arg$'+x+'$ = 0;'); //intptr_t
							code.push(INDENT+'\t\tif (JSValueIsObject(ctx,'+argumentsName+'['+x+']))');
							code.push(INDENT+'\t\t{');
							var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, {type:'id'}, 'arg$'+x, argumentsName+'['+x+']', cleanup);
							code.push(INDENT+'\t\t\t'+varassign.code);
							code.push(INDENT+'\t\t\targ$'+x+'$ = (intptr_t)arg$'+x+';');
							code.push(INDENT+'\t\t}');
							code.push(INDENT+'\t\telse if (JSValueIsNumber(ctx,'+argumentsName+'['+x+']))');
							code.push(INDENT+'\t\t{');
							var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, {type:'double'}, 'arg$'+x, argumentsName+'['+x+']', cleanup);
							code.push(INDENT+'\t\t\t'+varassign.code);
							code.push(INDENT+'\t\t\targ$'+x+'$ = (intptr_t)arg$'+x+';');
							code.push(INDENT+'\t\t}');
							code.push(INDENT+'\t\telse if (JSValueIsBoolean(ctx,'+argumentsName+'['+x+']))');
							code.push(INDENT+'\t\t{');
							var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, {type:'bool'}, 'arg$'+x, argumentsName+'['+x+']', cleanup);
							code.push(INDENT+'\t\t\t'+varassign.code);
							code.push(INDENT+'\t\t\targ$'+x+'$ = (intptr_t)arg$'+x+';');
							code.push(INDENT+'\t\t}');
							code.push(INDENT+'\t\telse if (JSValueIsString(ctx,'+argumentsName+'['+x+']))');
							code.push(INDENT+'\t\t{');
							var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, {type:'NSString *'}, 'arg$'+x, argumentsName+'['+x+']', cleanup);
							code.push(INDENT+'\t\t\t'+varassign.code);
							code.push(INDENT+'\t\t\targ$'+x+'$ = (intptr_t)arg$'+x+';');
							code.push(INDENT+'\t\t}');
							argnames.push('arg$'+x+'$');
						}
					}

					if (is_void) {
						code.push(INDENT+'\t\t['+cn+' '+method.name+':'+argnames.join(',')+'];');
					}
					else {
						code.push(INDENT+'\t\t'+resultName+'$$ = ['+cn+' '+method.name+':'+argnames.join(',')+'];');
					}
					code.push(INDENT+'\t\tbreak;');
					code.push(INDENT+'\t}');
				}
				code.push(INDENT+'}');
			}
			else {
				var varassign = makeVarAssignmentFromJSValueRef(state, typeobj, method.args[0], method.args[0].argument.name+'$'+0, argumentsName+'[0]', cleanup);

				argbody.push(varassign.code);
				fnbody += ':'+varassign.varname;
				argvarnames.push(varassign.varname);

				for (var c=1;c<method.args.length;c++) {
					var va = makeVarAssignmentFromJSValueRef(state, typeobj, method.args[c], method.args[c].argument.name+'$'+c, argumentsName+'['+c+']', cleanup);
					argbody.push(va.code);
					fnbody+=' '+sel[c]+':'+va.varname;
					argvarnames.push(va.varname);
				}
			}
		}

		if (useSuperCheck) {
			var superClass = typeobj.superClass.simpleType;
			var cln = instanceName+'.isSuperClass ? ['+superClass+' class] : ['+instanceName+' class]';
			fnbody = objc.generateInstanceInvocation(instanceName,cln,method.selector,method.args,argvarnames,method.returnType,resultName+'$');
		}
		else {
			fnbody = fnbody.trim() + (method.requiresSentinel ? ',nil':'') + '];';
		}

		if (!is_void) {
			if (method.formatter) {
				fnbody = method.returnType.type + ' ' + resultName + '$ = (' +method.returnType.type+') ' + resultName+'$$;';
			}
			else {
				if (!useSuperCheck) {
					if (method.returnType.type==='id' && method.returnSubtype==='instancetype') {
						fnbody = typeobj.simpleType + '* ' + resultName + '$ = ' + fnbody;
						returnbody = convertToJSValueRef(state, typeobj, typeobj.simpleType, resolveType(state,typeobj.simpleType), resultName);
					}
					else if (method.returnType.is_const) {
						fnbody = method.returnType.type + ' ' + resultName + '$ = (' +method.returnType.type+') ' + fnbody;
					}
					else {
						fnbody = method.returnType.type + ' ' + resultName + '$ = ' + fnbody;
					}
					if (method.name==='alloc') {
						// we need to handle special case
						returnbody = convertToJSValueRef(state, typeobj, typeobj.simpleType, resolveType(state,typeobj.simpleType), resultName);
					}
				}
			}
			if (!returnbody) {
				// export this symbol
				method.returnType.externTypedef && state.typedefs[typeobj.type].push(method.returnType.externTypedef);
				returnbody = convertToJSValueRef(state, typeobj, method.returnType.mangledName, resolveType(state,method.returnType.type), resultName);
			}
		}
		else {
			if (method.formatter) {
				fnbody = '';
				!is_void && code.push('if ('+resultName+'$$){}');
			}
			returnbody = 'JSValueRef ' + resultName + ' = JSValueMakeUndefined(ctx);';
		}


		var originalResultName = resultName,
			originalInstanceName = resultName+'$';

		if (method.returnType.type==='id' && method.name!=='alloc') {
			returnbody = 'JSValueRef '+resultName+'$c = [HyperloopConverters convertIDToJSValueRef:'+resultName+'$ withContext:(void*)ctx];\n' +
						// fall back to id conversion if we can't get a normal class conversion
					      'if ('+resultName+'$c==NULL)\n' +
					      '{\n' +
					      '\t' + returnbody + '\n' +
					      '\t' + resultName + '$c = '+resultName+';\n' +
					      '}\n';
			resultName += '$c';
			originalResultName = resultName;
		}

		var indent = methods.length > 1 ? INDENT+INDENT : '';

		argbody.forEach(function(b){
			code.push(indent+b);
		});
		fnbody && code.push(fnbody);
		code.push(indent+returnbody);
		if (useSuperCheck) {
			// if we're calling super on an instancetype (return type), then we
			// are going to use the last selfObject returned by the init method as the
			// result here. we do this in case the init method attached properties to the
			// self object before returning it
			code.push('if (instance.selfObject!=NULL)');
			code.push('{');
			code.push('\t'+originalResultName+' = instance.selfObject;');
			code.push('\tinstance.selfObject = NULL;');
			code.push('}');
		}
		if (returnFilterFunc && typeof(returnFilterFunc)==='function') {
			var rc = returnFilterFunc(originalResultName,originalInstanceName);
			rc && code.push(rc);
		}
		cleanup.length && (code = code.concat(cleanup));
		code.push(indent+'return '+resultName+';');

		if (methods.length > 1) {
			code.push(INDENT+'}');
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
 * currently, clang doesn't support third-party modules (non system frameworks) so we have
 * to turn those into normal #import <name> instead of @import
 */
function sortOutSystemFrameworks(state,imports,includes) {
	var i = _.clone(imports),
		inc = _.clone(includes);

	imports.splice(0,imports.length);
	includes.splice(0,includes.length);

	i.forEach(function(name){
		if (!name) return;
		if (state.system_frameworks.indexOf(name)===-1) {
			var p = '<'+name+'/'+name+'.h>';
			if (inc.indexOf(p)===-1) {
				inc.push(p);
			}
		}
		else if (imports.indexOf(name)===-1) {
			imports.push(name);
		}
	});

	// sort child frameworks
	inc.sort(function(a,b) { return a < b ? 1 : a == b ? 0 : -1 } ).forEach(function(i) {
		includes.push(i);
	});
}

/**
 * return interface header contents
 */
function generateInterfaceHeader (state, name) {

	var obj = resolveType(state, name);

	// de-dup them
	var externs = _.uniq(state.externs[obj.type]||[]).sort(),
		imports = _.uniq(state.imports[obj.type]||[]).sort(),
		includes = _.uniq(state.includes[obj.type]||[]).sort(),
		typedefs = _.uniq(state.typedefs[obj.type]||[]).sort();

	name = obj.mangledName;

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(header_template, {
		name: name,
		entry: obj.object || {},
		state: state,
		object: obj,
		externs: externs,
		imports: imports,
		_includes: includes,
		typedefs: typedefs,
		extra_includes: (obj.object && obj.object.extra_includes) || []
	});
}

/**
 * return interface contents
 */
function generateInterface (state, name) {

	var obj = resolveType(state, name),
		includes = _.uniq(state.includes[obj.type]||[]).sort(),
		imports = _.uniq(state.imports[obj.type]||[]).sort();

	name = obj.mangledName;

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(class_template, {
		entry: obj.object || {name:name},
		state: state,
		metadata: state.metadata,
		object: obj,
		instanceName: obj.instanceName,
		name: name,
		filename: mangleTypeName(obj.name),
		varname: name.toLowerCase(),
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
	});

}

/**
 * return struct header contents
 */
function generateStructHeader(state, name) {

	var obj = resolveType(state,name),
		instanceName = obj.type.replace('const ',''), //FIXME
		// de-dup them
		externs = _.uniq(state.externs[obj.type]||[]).sort(),
		imports = _.uniq(state.imports[obj.type]||[]).sort(),
		includes = _.uniq(state.includes[obj.type]||[]).sort(),
		typedefs = _.uniq(state.typedefs[obj.type]||[]).sort();

	if (!obj.is_pointer) {
		instanceName+=' *';
	}
	if (obj.framework && imports.indexOf(obj.framework)===-1) {
		imports.push(obj.framework);
	}
	if (obj.import && includes.indexOf(obj.import)===-1) {
		includes.push(obj.import);
	}

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(struct_header_template, {
		state: state,
		entry: obj.object,
		object: obj,
		varname: obj.type.toLowerCase(),
		imports:imports,
		_includes: includes,
		externs: externs,
		typedefs: typedefs,
		instanceName: instanceName,
		name: obj.mangledName,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify
	});
}

/**
 * return struct contents
 */
function generateStruct (state, name) {

	var obj = resolveType(state,name),
		filename = 'js_'+mangleTypeName(name),
		instanceName = obj.type.replace('const ',''),  //FIXME
		assign = false;

	if (!obj.is_pointer) {
		instanceName+=' *';
	}

	// void * or typeless structs (whereby fields are hidden from header) must be assigned and not copied
	if (obj.object && !obj.object.fields || obj.is_void) {
		assign = true;
	}

	return ejs.render(struct_template, {
		state: state,
		entry: obj.object || {},
		object: obj,
		instanceName: instanceName,
		varname: obj.simpleType.toLowerCase(),
		name: obj.mangledName,
		simpleType: obj.simpleType,
		type: obj.type,
		filename: filename,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify,
		assign: assign
	});
}

/**
 * return typedefs contents
 */
function generateTypedef (state, name) {

	var obj = resolveType(state,name),
		is_primitive = primitiveTypeRegex.test(obj.object.type);

	return ejs.render(typedef_template, {
		state: state,
		entry: obj.object,
		object: obj,
		instanceName: obj.name,
		varname: obj.type.toLowerCase(),
		simpleType: obj.simpleType,
		name: obj.mangledName,
		makeMethod: makeMethod,
		makeGetProperty: makeGetProperty,
		makeSetProperty: makeSetProperty,
		indentify: indentify
	});
}

/**
 * return typedefs header contents
 */
function generateTypedefHeader(state, name) {

	var obj = resolveType(state,name),
		// de-dup them
		externs = _.uniq(state.externs[obj.type]||[]).sort(),
		imports = _.uniq(state.imports[obj.type]||[]).sort(),
		includes = _.uniq(state.includes[obj.type]||[]).sort(),
		typedefs = _.uniq(state.typedefs[obj.type]||[]).sort();

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(typedef_header_template, {
		state: state,
		entry: obj.object,
		object: obj,
		name: obj.mangledName,
		varname: obj.type.toLowerCase(),
		instanceName: obj.name,
		imports:imports,
		_includes: includes,
		externs: externs,
		typedefs: typedefs
	});
}

/**
 * return a suitable default value
 */
function defaultValue(obj) {
	if (obj.is_char_array) return "NULL";
	if (obj.simpleType=='char') return "'\\0'";
	if (obj.is_primitive) return "0";
	return "NULL";
}

/**
 * return primitive code
 */
function generatePrimitive (state, name) {

	var obj = resolveType(state,name),
		varType = obj.type + ' result',
		returnType = obj.type,
		typeName = name,
		includes = _.uniq(state.includes[obj.type]||[]).sort(),
		imports = _.uniq(state.imports[obj.type]||[]).sort();

	if (obj.is_const) {
		returnType = obj.type.replace('const ','').trim();
		varType = returnType + ' result';
	}

	if (obj.object && obj.object.type) {
		typeName = obj.object.type;
	}

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(type_to_native_template, {
		state: state,
		typeName: typeName,
		name: obj.mangledName,
		typeObject: obj,
		instanceName: obj.name,
		variableName: 'object',
		resultName: 'result',
		isArray: obj.is_array,
		isPointer: obj.is_pointer,
		isPointerToPointer: obj.is_pointer_to_pointer,
		isPrimitive: obj.is_primitive,
		returnType: returnType,
		varType: varType,
		type: obj.type,
		simpleType: obj.simpleType,
		length: obj.length,
		isCharArray: obj.is_char_array,
		defaultValue: defaultValue(obj),
		imports: imports,
		_includes: includes
	});
}

/**
 * generate the interface converters file contents
 */
function generateInterfaceConverters (state, interfaces, filename, code, externs) {
	var imports = ['Foundation','JavaScriptCore'],
		includes = [],
		intf = {},
		// need to give preference to Mutable classes before their non-Mutable equivalents
		sortable = function (a,b) { var index = a.simpleType.indexOf('Mutable'), eq = a.simpleType==b.simpleType; return (eq ? 0 : -index) };

	interfaces.sort(sortable).forEach(function(entry) {
		var framework = entry && entry.object && entry.object.framework;
		framework && imports.push(framework);
		if (!(entry.simpleType in intf)) {
			intf[entry.simpleType] = entry;
		}
		var imp = entry && entry.object && entry.object.import;
		imp && includes.push(imp);
	});

	imports = _.uniq(imports);
	includes = _.uniq(includes);
	externs = _.uniq(externs);

	sortOutSystemFrameworks(state,imports,includes);

	var implementation = ejs.render(interface_to_native_class_template,{
		state:state,
		filename:filename,
		interfaces: _.values(intf),
		imports: imports,
		_includes: includes,
		externs: externs,
		code: code.join('\n')
	});

	var header = ejs.render(interface_to_native_class_header_template,{
		state:state,
		filename:filename,
		imports: imports,
		_includes: includes,
		externs: _.uniq(externs),
	});

	return {
		header:header,
		implementation:implementation
	};
}

/**
 * generate block conversion code
 */
function generateBlock(state, object) {

	var imports = _.uniq(object.frameworks),
		includes = [];

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(block_to_native_template,{
		state:state,
		object:object,
		imports: imports,
		_includes: includes
	});
}

/**
 * generate function pointer conversion code
 */
function generateFunctionPointer(state, object) {
	var imports = _.uniq(object.frameworks),
		includes = [];

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(function_pointer_to_native_template,{
		state:state,
		object:object,
		imports: imports,
		_includes: includes
	});
}

/**
 * generate function conversion code
 */
function generateFunction(state, object) {

	var fnbody = makeFunction(state,object,'arguments','argumentCount'),
		imports = [object.object.framework],
		includes = object.object.import ? ['<'+object.object.import+'>'] : [];


	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(function_to_native_template,{
		state:state,
		object:object,
		makeFunction: makeFunction,
		indentify: indentify,
		fnbody: fnbody,
		imports: imports,
		_includes: includes
	});
}

/**
 * generate enum code
 */
function generateEnum(state, object) {
	if (object.object.alias) {
		object = resolveType(state,object.object.alias);
		if (object.object.alias) {
			object = resolveType(state, object.object.alias);
		}
	}

	var imports = [object.object.framework],
		includes = [];

	sortOutSystemFrameworks(state,imports,includes);

	return ejs.render(enum_to_native_template,{
		state:state,
		object:object,
		imports: imports,
		_includes: includes
	});
}

/**
 * return the method object for a given method name
 */
function findSuperClassMethod(state,name,typeobj) {
	var sc = typeobj.superClass;
	while (sc) {
		var m = sc.methods[name];
		if (m) {
			return m[0];
		}
		sc = sc.superClass;
	}
	return null;
}

function generateCustomClass(state,name,classdef,srcdir,srcs,version) {

	var methods = [],
		imports = [],
		instance_methods = {},
		copymethods = _.clone(classdef.methods),
		typeobj,
		extendsType = resolveType(state, classdef.extendsName || 'NSObject');

	// convert our class definition methods into metabase style methods
	classdef.methods.forEach(function(method) {
		var returnType = resolveType(state, method.returnType || 'void'),
			selector = method.name,
			args = [];
		if (method.arguments) {
			for (var c=0;c<method.arguments.length;c++) {
				var arg = method.arguments[c],
					type = resolveType(state, arg.type);
				if (c===0) {
					selector+=':';
				}
				else {
					selector+=arg.name+':';
				}
				args.push(arg);
			}
		}

		instance_methods[method.name] = [{
			name: method.name,
			selector: selector.trim(),
			args: args,
			returnType: method.returnType,
			instance:true,
			methodtype: 'method'
		}];
	});

	classdef.methods = instance_methods;
	classdef.superClass = extendsType.name;
	state.customclasses[name]=classdef;

	// now turn this custom class into a metatype
	typeobj = resolveType(state,name);

	classdef.interfaces && classdef.interfaces.forEach(function(i){
		var t = resolveType(state,i);
		t.object.framework && imports.push(t.object.framework);
	});

	// build the code blocks for each method
	copymethods.forEach(function(method) {
		var returnType = resolveType(state, method.returnType || 'void'),
			selectorsig = '-(' + returnType.type + ')' + method.name,
			selector = method.name,
			code = [],
			init = '',
			cleanup = [],
			argnames = [],
			init = '',
			override = findSuperClassMethod(state,method.name,typeobj),
			instancetype = override && override.returnSubtype==='instancetype';

		if (override) {
			instancetype && (init = 'if (self = ');
			init += '[super '+method.name;
		}

		if (method.arguments) {

			code.push('JSObjectRef params$ = JSObjectMake(ctx,0,0);');
			code.push('JSValueRef args[1];');
			code.push('args[0]=params$;');

			for (var c=0;c<method.arguments.length;c++) {
				var arg = method.arguments[c],
					type = resolveType(state, arg.type);
				if (c===0) {
					selectorsig+=':('+type.type+')'+(arg.property||arg.name)+'$ ';
					selector+=':';
				}
				else {
					selectorsig+=arg.name+':('+type.type+')'+arg.name+'$ ';
					selector+=arg.name+':';
				}
				argnames.push(arg.name);
				var varassign = convertToJSValueRef(state, typeobj, type.mangledName, type, arg.name);
				code.push(varassign);
				if (type.is_object && !type.is_primitive && !type.is_void) {
					code.push('if ('+arg.name+'$==NULL)');
					code.push('{');
					code.push('\t'+arg.name+' = JSValueMakeNull(ctx);');
					code.push('}');
				}
				code.push('JSStringRef name$'+arg.name+' = JSStringCreateWithUTF8CString("'+(arg.property||arg.name)+'");');
				code.push('JSObjectSetProperty(ctx,params$,name$'+arg.name+','+arg.name+',kJSPropertyAttributeNone,0);');
				code.push('JSStringRelease(name$'+arg.name+');');
				if (override) {
					if (c===0) {
						init+=':'+arg.name+'$';
					}
					else {
						init+=arg.name+':'+arg.name+'$';
					}
					if (c+1<method.arguments.length) {
						init+=' ';
					}
				}
			}
			if (override &&  selector!==override.selector) {
				override = null;
				init = null;
			}
		}
		else {
			code.push('JSValueRef args=NULL;');
		}

		code.push('JSValueRef exception$ = NULL;');
		code.push('JSStringRef action$name$ = JSStringCreateWithUTF8CString("'+method.action_name+'");');
		code.push('JSValueRef fnv$ = JSObjectGetProperty(ctx,source,action$name$,&exception$);');
		code.push('JSObjectRef fn$ = JSValueToObject(ctx,fnv$,0);');
		code.push('JSStringRelease(action$name$);');
		cleanup.length && (code=code.concat(cleanup));

		if (!returnType.is_void) {
			code.push('JSValueRef result$$ = JSObjectCallAsFunction(ctx,fn$,thisObject,'+method.arguments.length+',args,&exception$);');
			code.push('CHECK_EXCEPTION(ctx, exception$);');
			code.push('bool free$ = false;');
			if (instancetype) {
				code.push('self.selfObject = JSValueToObject(ctx,result$$,0); //no retain');
				state.externs[typeobj.type].push('extern '+name+'* HyperloopJSValueRefTo'+name+'(JSContextRef,JSValueRef,JSValueRef*,bool*);');
				code.push('self = HyperloopJSValueRefTo'+name+'(ctx,result$$,&exception$,&free$);');
				code.push('return self;');
			}
			else {
				code.push('return HyperloopJSValueRefTo'+returnType.mangledName+'(ctx,result$$,&exception$,&free$);');
			}
			// export this symbol
			returnType.externTypedef && state.typedefs[typeobj.type].push(returnType.externTypedef);
			// export this symbol
			state.externs[typeobj.type].push('extern '+returnType.type+' HyperloopJSValueRefTo'+returnType.mangledName+'(JSContextRef,JSValueRef,JSValueRef*,bool*);');
		}
		else {
			code.push('JSObjectCallAsFunction(ctx,fn$,thisObject,1,args,&exception$);');
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
			initcode.push('\t'+init);
			initcode.push('\t{');
			initcode.push('\t\treturn self;');
			initcode.push('\t}');
			initcode.push('}');
			code = initcode.join('\n') + '\n' + code;
	    }

		var m = {
			code: code + '\n' + cleanup.join('\n'),
			selector: selectorsig.trim(),
			method: method
		};
		methods.push(m);
	});

	var class_methods = {};

	Object.keys(typeobj.class_methods).sort().forEach(function(m) {
	    var code = makeMethod(state, typeobj, m, 'result', 'instance', 'arguments', 'argumentCount', function(resultname,instancename){
	    	if (typeobj.class_methods[m][0].returnSubtype==='instancetype' || typeobj.class_methods[m][0].returnSubtype==='id') {
		    	var code = [];
		    	code.push('if (['+instancename+' isKindOfClass:['+typeobj.simpleType+' class]])');
		    	code.push('{');
		    	code.push('\t[(('+typeobj.simpleType+' *)'+instancename+') _configure:private->callback context:private->context];');
		    	code.push('}');
		    	return code.join('\n');
	    	}
	    });
    	class_methods[m] = code;
    });

    imports = imports.concat(_.uniq(state.imports[typeobj.type]));


	var _includes = _.uniq(state.includes[typeobj.type]),
		externs = _.uniq(state.externs[typeobj.type]),
		typedefs = _.uniq(state.typedefs[typeobj.type]);

	// push the extern for our superClass which we will inject as super property of this
	externs.push('extern JSValueRef Hyperloop'+classdef.extendsName+'ToJSValueRef(JSContextRef,'+typeobj.type+');');

	sortOutSystemFrameworks(state,imports,_includes);

	var implementation = ejs.render(custom_class_template,{
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
	});

	var header = ejs.render(custom_class_header_template,{
		methods: methods,
		className: typeobj.object.className,
		interfaces: classdef.interfaces,
		extendsName: classdef.extendsName,
		imports: imports,
		_includes: _includes,
		externs: externs,
		typedefs: typedefs,
		indentify: indentify
	});

	return {
		header: header,
		implementation: implementation
	};
}
