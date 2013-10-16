/**
 * objective-c runtime code generation
 */

exports.generateClassInvocation = generateClassInvocation;
exports.generateInstanceInvocation = generateInstanceInvocation;

function generateInvocation(isInstance, instanceName, className, selector, arguments, argvalues, returnType, returnVarname) {
	var code = [],
		argtypes = arguments.map(function(a){return a.type}).join(',');

	code.push('typedef '+returnType.type+' (*Function)(id,SEL'+(argtypes?(','+argtypes):'')+');');
	code.push('Function _fn;');
	code.push('SEL _sel = @selector('+selector+');');
	if (isInstance) {
		code.push('Method _method = class_getInstanceMethod('+className+',_sel);');
	}
	else {
		code.push('Method _method = class_getClassMethod('+className+',_sel);');
	}
	code.push('_fn = (Function)method_getImplementation(_method);');

	var invocation = '_fn(' + instanceName + ',_sel' +
			(argvalues.length ? (',' + argvalues) : '') + ');';

	if (!returnType.is_void) {
		code.push(returnType.type+' '+returnVarname+';');
		invocation = returnVarname+' = ' + invocation;
	}

	code.push('@try');
	code.push('{');
	code.push('\t'+invocation);
	code.push('}');
	code.push('@catch (NSException *_ex)');
	code.push('{');
	code.push('\tNSLog(@"[ERROR] Unhandled Exception caught: %@",_ex);');
	code.push('}');

	return code.join('\n');
}

function generateClassInvocation(instanceName, className, selector, arguments, argvalues, returnType, returnVarname) {
	return generateInvocation(false,instanceName, className, selector, arguments, argvalues, returnType, returnVarname);
}

function generateInstanceInvocation(instanceName, className, selector, arguments, argvalues, returnType, returnVarname) {
	return generateInvocation(true,instanceName, className, selector, arguments, argvalues, returnType, returnVarname);
}

if (module.id===".") {
	// log.log(generateInstanceInvocation('b','[A class]','foo',[],[],{type:'void',is_void:true}));
	// log.log('==============================================================================');
	// log.log(generateInstanceInvocation('b','[A class]','foo',[{type:'int'}],['a'],{type:'void',is_void:true}));
	// log.log('==============================================================================');
	log.log(generateInstanceInvocation('b','[A class]','foo',[{type:'int'}],['a'],{type:'int',is_void:false},'result'));
	// log.log('==============================================================================');
	// log.log(generateClassInvocation('b','[B class]','bar',[],[],{type:'void',is_void:true}));
	// log.log('==============================================================================');
	// log.log(generateClassInvocation('b','className','bar',[{type:'int'}],['a'],{type:'void',is_void:true}));
}
