/**
 * generator for types
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	semver = require('semver'),
	interface_to_native = fs.readFileSync(path.join(__dirname,'templates','interface_to_native.ejs')).toString(),
	protocol_to_native = fs.readFileSync(path.join(__dirname,'templates','protocol_to_native.ejs')).toString(),
	interface_to_native_class = fs.readFileSync(path.join(__dirname,'templates','interface_to_native_class.ejs')).toString(),
	id_to_native = fs.readFileSync(path.join(__dirname,'templates','id_to_native.ejs')).toString(),
	type_to_native = fs.readFileSync(path.join(__dirname,'templates','type_to_native.ejs')).toString();


exports.generateOutput = generateOutput;

/**
 * these classes are not available 
 */
const BLACKLIST_CLASSES = [
	'Protocol',
	'NSSocketPort'	 // not available on iOS, although clang says it is
];

const BLACKLIST_PROTOCOLS = [
	'NSObject'
];

const TRANSLATED_TYPES = {
	'CFString': 'CFStringRef'
};

var primitiveTypeRegex = /^(un)?(signed)?\s*(short|float|double|long|bool|int|char|unichar|_Bool)/i,
	voidpointerRegex = /^(const)?\s*void/,
	subarrayRegex = /(\w+)\s*\[(\d+)?\]/,
	signedRegex = /(un?signed )/;


/**
 * turn a string of content into a string with each line with an indent
 */
function indentify(string, indent) {
	indent = indent || '\t';
	return string.split(/\n/).map(function(s){ return indent + s }).join('\n');
}

function convertToSimpleType (type) {
	var t = type.replace(/__unsafe_unretained/g,'').replace(/__strong/g,'').replace('volatile','').replace('*const','').replace('const ','').trim();
	if (t in TRANSLATED_TYPES) {
		return TRANSLATED_TYPES[t];
	}
	return t.replace(/\*/g,'').trim();
}

function generateInterfaceConverters (state, interfaces) {
	var imports = ['Foundation','JavaScriptCore'];
	interfaces.forEach(function(name) {
		var framework = state.metadata.classes[name].framework;
		if (imports.indexOf(framework)===-1) {
			imports.push(framework);
		}
	});
	return ejs.render(interface_to_native_class,{
		state:state,
		interfaces: interfaces,
		imports: imports
	});
}

function convertInterfaceToNativeValue (state, typeName, interfaceObject) {
	return ejs.render(interface_to_native,{
		state:state,
		typeName:typeName,
		interfaceObject:interfaceObject,
		variableName:'object',
		resultName:'result',
		addImports: state.addImports,
		skipCopyright: state.skipCopyright
	});
}

function convertProtocolToNativeValue (state, typeName, protocolObject) {
	return ejs.render(protocol_to_native,{
		state:state,
		typeName:typeName,
		protocolObject:protocolObject,
		variableName:'object',
		resultName:'result',
		addImports: state.addImports,
		skipCopyright: state.skipCopyright
	});
}

function convertTypeNameToVarname(type) {
	return type.replace(/[\*\^\(\)\[\]\s]/g, '_');
}

function convertSymbolToNativeValue (state, typeName, symbolObject) {
//	return JSON.stringify(symbolObject,null,3);
}

function convertTypeToNativeValue (state, typeName, typeObject) {
	return ejs.render(type_to_native, {
		state: state,
		typeName: typeObject.obj.type || typeObject.obj.alias,
		name: typeObject.name,
		typeObject: typeObject.obj,
		variableName: 'object',
		resultName: 'result',
		addImports: state.addImports,
		skipCopyright: state.skipCopyright,
		isArray: typeObject.isArray,
		isPointer: typeObject.isPointer,
		isPointerToPointer: typeObject.isPointerToPointer,
		returnType: typeObject.returnType,
		varType: typeObject.varType,
		simpleType:typeObject.simpleType,
		length: typeObject.length,
		isCharArray: typeObject.isCharArray,
		defaultValue: typeObject.defaultValue
	});
}

function convertIDToNativeValue (state) {
	/*return ejs.render(id_to_native,{
		state:state,
		variableName:'object',
		resultName:'result'
	});*/
	//+(void*)convertIDToJSValueRef:(id)object withContext:(void*)ctx;
}

function convertJSValueToNativeValue (state, typeObject) {
	var metadata = state.metadata,
		typeName = typeObject.name,
		simpleType = convertToSimpleType(typeName);

	if (simpleType==='id') {
		// this is a special type
		return convertIDToNativeValue(state);
	}
	switch(typeObject._type_) {
		case 'class': {
			return convertInterfaceToNativeValue(state, typeName, typeObject);
		}
		case 'protocol': {
			return convertProtocolToNativeValue(state, typeName, typeObject);
		}
		case 'symbol': {
			return convertSymbolToNativeValue(state, typeName, typeObject);
		}
		case 'typedef': {
			return convertTypeToNativeValue(state, typeName, typeObject);
		}
	}

	//TODO: id, void, primitives

	console.log(simpleType,'=>',typeObject);
}

function createState (metadata) {
	return {
		imports: [],
		makers: [],
		metadata: metadata
	};
}

function satisfies (check, version) {
	if (!check || check==='0') return false;
	check = makeVersion(check);
	version = makeVersion(version);
	return semver.gte(version,check);
}

function makeVersion (version) {
	if (version.split('.').length===2) {
		version+='.0';
	}
	return version;
}

function sortNameFunction(a,b) {
	if (a.name===b.name) return 0;
	if (a.name < b.name) return -1;
	return 1;
}

function sortSimpleTypeFunction(a,b) {
	a = a.simpleType.toLowerCase() + a.length;
	b = b.simpleType.toLowerCase() + b.length;
	if (a===b) return 0;
	if (a < b) return -1;
	return 1;
}

/**
 * generate all the interfaces handling code
 */
function generateInterfaces (state, interfaces) {
	var code = []
	interfaces.sort(sortNameFunction).forEach(function(obj) {
		state.skipCopyright = code.length;
		code.push(convertJSValueToNativeValue(state, obj));
	});
	code.push('');
	code.push(generateInterfaceConverters(state, interfaces));
	return code.join('\n');
}

/**
 * generate all the protocols handling code
 */
function generateProtocols (state, protocols) {
	var code = [];
	protocols.sort(sortNameFunction).forEach(function(obj) {
		state.skipCopyright = code.length;
		code.push(convertJSValueToNativeValue(state, obj));
	});
	code.push('');
	return code.join('\n');
}

/**
 * generate all the symbol handling code
 */
function generateSymbols (state, symbols) {
	var code = [];
	symbols.sort(sortNameFunction).forEach(function(obj) {
		state.skipCopyright = code.length;
		code.push(convertJSValueToNativeValue(state, obj));
	});
	code.push('');
	return code.join('\n');
}

/**
 * generate all the types handling code
 */
function generateTypes (state, types) {
	var code = [];
	types.sort(sortSimpleTypeFunction).forEach(function(obj) {
		state.skipCopyright = code.length;
		code.push(convertJSValueToNativeValue(state, obj));
	});
	code.push('');
	return code.join('\n');
}

/**
 * return true if this metadata type is available on this platform, version
 */
function available(obj, version) {
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

function defaultValue(obj) {
	if (obj.isCharArray) return "NULL";
	if (obj.simpleType=='char') return "'\\0'";
	if (primitiveTypeRegex.test(obj.simpleType)) return "0";
	return "NULL";
}

function generateOutput (metadata, version, callback) {
	var state = createState(metadata);

	if (typeof(version)==='function') {
		callback = version;
		version = '7.0';
	}

	state.addImports = true;

	var interfaces = [],
		protocols = [],
		symbols = [],
		types = [],
		type_names = [],
		code = [];

	Object.keys(metadata.classes).forEach(function(name) {
		if (BLACKLIST_CLASSES.indexOf(name)!==-1) return;
		var obj = metadata.classes[name];
		obj.name = name;
		obj._type_ = 'class';
		available(obj,version) && obj.framework && interfaces.push(obj);
	});

	Object.keys(metadata.protocols).forEach(function(name) {
		if (BLACKLIST_PROTOCOLS.indexOf(name)!==-1) return;
		var obj = metadata.protocols[name];
		obj.name = name;
		obj._type_ = 'protocol';
		available(obj,version) && obj.framework && protocols.push(obj);
	});

	Object.keys(metadata.symbols).forEach(function(name) {
		var obj = metadata.symbols[name];
		obj.name = name;
		obj._type_ = 'symbol';
		available(obj,version) && symbols.push(obj);
	});

	Object.keys(metadata.types).forEach(function(name) {
		var obj = metadata.types[name];
		if (!available(obj,version)) return;
		switch(obj.metatype) {
			case 'typedef': {
				if (primitiveTypeRegex.test(obj.type) && obj.type.indexOf('^')===-1 && obj.type.indexOf('(*)')===-1)
				{
					var isArray = subarrayRegex.test(obj.type),	 // char[1]
						isPointerToPointer = obj.type.indexOf('**')>=0,	// char**
						isPointer = isArray|| (!isPointerToPointer && obj.type.indexOf('*')>=0), // char*
						name = convertTypeNameToVarname(obj.type),
						sub = subarrayRegex.exec(obj.type),
						returnType = isArray ? (sub[1]+'*') : obj.type,
						varType = isArray ? (sub[1]+' *result') : obj.type + ' result',
						simpleType = isArray ? sub[1] : convertToSimpleType(obj.type),
						length = isArray ? (sub[2]||0) : 0,
						isCharArray = (isArray || isPointer) && /char/.test(simpleType);
					if (isArray && signedRegex.test(obj.type)) {
						// unsigned char[16] -> unsigned char as simpleType
						simpleType = signedRegex.exec(obj.type)[1] + simpleType;
						returnType = simpleType+'*';
					}
					// only generate for unique types
					if (type_names.indexOf(name)===-1) {
						type_names.push(name);
						var typeObj = {_type_:'typedef',isCharArray:isCharArray,length:length,simpleType:simpleType,varType:varType,returnType:returnType,obj:obj,name:name,isArray:isArray,isPointerToPointer:isPointerToPointer,isPointer:isPointer};
						typeObj.defaultValue = defaultValue(typeObj);
						types.push(typeObj);
						// console.log(obj.type,'=>',types[types.length-1]);
					}
				}
			}
		}
	});

// process.exit(1)


	// code.push(generateInterfaces(state,interfaces));
	// code.push(generateProtocols(state,protocols));
	// code.push(generateSymbols(state,symbols));
	code.push(generateTypes(state,types));

	callback(null, code.join('\n'));
}


if (module.id===".") {
	var json = "/Users/jhaynie/Library/Application Support/org.appcelerator.hyperloop/cache/bbf2d450bac4ef5e4c37c2fc264c7e23.json",
		metadata = JSON.parse(fs.readFileSync(json).toString());
	generateOutput(metadata,function(err,buf){
		console.log(buf);
	});
}
