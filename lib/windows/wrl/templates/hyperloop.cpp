#include "hyperloop.h"

static double NAN = std::numeric_limits<double>::quiet_NaN();

std::wstring hyperloop::getWString(JSStringRef sValue) {
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
	JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring w_str(s_str.begin(), s_str.end());
	return w_str;
}

std::wstring hyperloop::getWString(JSContextRef ctx, JSValueRef ref) {
	JSStringRef sValue = JSValueToStringCopy(ctx, ref, NULL);
	return hyperloop::getWString(sValue);
}

const char* hyperloop::getCStr(Platform::String^ string) {
	std::wstring w_str(string->Begin());
	std::string s_str(w_str.begin(), w_str.end());
	return s_str.c_str();
}

const char* hyperloop::getCStr(JSContextRef ctx, JSValueRef ref) {
	JSStringRef sValue = JSValueToStringCopy(ctx, ref, NULL);
	std::wstring w_str = hyperloop::getWString(sValue);
	std::string s_str(w_str.begin(), w_str.end());
	return s_str.c_str();
}

String^ hyperloop::getPlatformString(JSStringRef sValue) {
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
	JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring w_str(s_str.begin(), s_str.end());
	return ref new String(hyperloop::getWString(sValue).c_str());
}

String^ hyperloop::getPlatformString(JSContextRef ctx, JSValueRef ref) {
	JSValueRef exception = NULL;
	JSStringRef sValue = JSValueToStringCopy(ctx, ref, &exception);
	CHECK_EXCEPTION(ctx, exception);
	return hyperloop::getPlatformString(sValue);
}

JSStringRef hyperloop::getJSStringRef(char *c_str, int length) {
	std::string s_str(c_str, length);
	const char* charStr = s_str.c_str();
	return JSStringCreateWithUTF8CString(charStr);
}

JSStringRef hyperloop::getJSStringRef(Platform::String^ string) {
	std::wstring w_str(string->Begin());
	std::string s_str(w_str.begin(), w_str.end());
	const char* charStr = s_str.c_str();
	return JSStringCreateWithUTF8CString(charStr);
}

JSValueRef hyperloop::getJSValueRef(JSContextRef ctx, Platform::String^ string) {
	JSStringRef str = hyperloop::getJSStringRef(string);
	JSValueRef retVal = JSValueMakeString(ctx, str);
	JSStringRelease(str);
	return retVal;
}

JSValueRef HyperloopundefinedToJSValueRef(JSContextRef ctx, Object^ o) {
	return JSValueMakeUndefined(ctx);
}
JSValueRef HyperloopundefinedToJSValueRef(JSContextRef ctx, void* o) {
	return JSValueMakeUndefined(ctx);
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx, Object^ object)
{
    JSPrivateObject *p = new JSPrivateObject();
    p->object = object;
    p->value = NAN;
    p->type = JSPrivateObjectTypeID;
    p->context = ctx;
	return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a void *
 */
JSPrivateObject* HyperloopMakePrivateObjectForPointer(void *pointer)
{
    JSPrivateObject *p = new JSPrivateObject();
    p->buffer = pointer;
    p->type = JSPrivateObjectTypePointer;
    p->value = std::numeric_limits<double>::quiet_NaN();
    return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a double
 */
JSPrivateObject* HyperloopMakePrivateObjectForNumber(double value)
{
    JSPrivateObject *p = new JSPrivateObject();
    p->value = value;
    p->type = JSPrivateObjectTypeNumber;
    return p;
}

/**
 * destroy a JSPrivateObject stored in a JSObjectRef
 */
void HyperloopDestroyPrivateObject(JSObjectRef object)
{
	JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
	if (p!=nullptr)
	{
        JSObjectSetPrivate(object,0);
	}
}

/**
 * return a JSPrivateObject as an ID (or nullptr if not of type JSPrivateObjectTypeID)
 */
Object^ HyperloopGetPrivateObjectAsID(JSObjectRef object)
{
    if (object!=nullptr)
    {
        JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
        if (p!=nullptr)
        {
            if (p->type == JSPrivateObjectTypeID)
            {
                return p->object;
            }
        }
    }
	return nullptr;
}

/**
 * return a JSPrivateObject as a void * (or nullptr if not of type JSPrivateObjectTypePointer)
 */
void* HyperloopGetPrivateObjectAsPointer(JSObjectRef object)
{
    if (object!=nullptr)
    {
        JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
        if (p!=nullptr)
        {
            if (p->type == JSPrivateObjectTypePointer)
            {
                return p->buffer;
            }
        }
    }
    return nullptr;
}

/**
 * return a JSPrivateObject as a double (or NaN if not of type JSPrivateObjectTypeNumber)
 */
double HyperloopGetPrivateObjectAsNumber(JSObjectRef object)
{
    if (object!=nullptr)
    {
        JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
        if (p!=nullptr)
        {
            if (p->type == JSPrivateObjectTypeNumber)
            {
                return p->value;
            }
        }
    }
    return NAN;
}


/**
 * return true if JSPrivateObject is of type
 */
bool HyperloopPrivateObjectIsType(JSObjectRef object, JSPrivateObjectType type)
{
    if (object!=nullptr)
    {
        JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
        if (p!=nullptr)
        {
            return p->type == type;
        }
    }
	return false;
}

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *error, JSValueRef *exception)
{
    if (exception!=nullptr)
    {
        JSStringRef string = JSStringCreateWithUTF8CString(error);
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
    }
	return JSValueMakeUndefined(ctx);
}

/**
 * return a string representation as a JSValueRef for an Object^
 */
JSValueRef HyperloopToString(JSContextRef ctx, Object^ object)
{
	return hyperloop::getJSValueRef(ctx, "" + object);
}

/**
 * return a string representation as a JSValueRef for an void*
 */
JSValueRef HyperloopToString(JSContextRef ctx, void* object)
{
	std::string *sp = static_cast<std::string*>(object);
	std::string s = *sp;
	const char* charStr = s.c_str();
	JSStringRef str = JSStringCreateWithUTF8CString(charStr);
	JSValueRef retVal = JSValueMakeString(ctx, str);
	JSStringRelease(str);
	delete sp;
	return retVal;
}

/**
 * attempt to convert a JSValueRef to a NSString
 */
String^ HyperloopToString(JSContextRef ctx, JSValueRef value)
{
	return hyperloop::getPlatformString(ctx, value);
}

JSValueRef HyperloopLogger (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	if (argumentCount <= 0) {
		return JSValueMakeUndefined(ctx);
	}
	String^ out = HyperloopToString(ctx, arguments[0]);
	if (argumentCount > 1) {
		for (size_t c = 1; c < argumentCount; c++)
		{
			out += " " + HyperloopToString(ctx, arguments[c]);
		}
	}
	out += "\n";
	std::wstring w_str(out->Begin());
	OutputDebugString(w_str.c_str());

	return JSValueMakeUndefined(ctx);
}

/**
 * create a hyperloop VM
 */
 
JSGlobalContextRef HyperloopCreateVM ()
{
    JSGlobalContextRef globalContextRef = JSGlobalContextCreate(nullptr);
    JSObjectRef globalObjectref = JSContextGetGlobalObject(globalContextRef);

    // inject a simple console logger
    JSObjectRef consoleObject = JSObjectMake(globalContextRef, 0, 0);
    JSStringRef logProperty = JSStringCreateWithUTF8CString("log");
    JSStringRef consoleProperty = JSStringCreateWithUTF8CString("console");
    JSObjectRef logFunction = JSObjectMakeFunctionWithCallback(globalContextRef, logProperty, HyperloopLogger);
    JSObjectSetProperty(globalContextRef, consoleObject, logProperty, logFunction, kJSPropertyAttributeNone, 0);
    JSObjectSetProperty(globalContextRef, globalObjectref, consoleProperty, consoleObject, kJSPropertyAttributeNone, 0);
    JSStringRelease(logProperty);
    JSStringRelease(consoleProperty);

    // create a hook into our global context
    JSClassDefinition def = kJSClassDefinitionEmpty;
    JSClassRef classDef = JSClassCreate(&def);
    JSObjectRef wrapper = JSObjectMake(globalContextRef, classDef, globalContextRef);
    JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
    JSObjectSetProperty(globalContextRef, globalObjectref, prop, wrapper, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete, 0);
    JSStringRelease(prop);

    // setup our globals object
    JSStringRef globalProperty = JSStringCreateWithUTF8CString("globals");
    JSObjectSetProperty(globalContextRef, globalObjectref, globalProperty, globalObjectref, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete, 0);
    JSStringRelease(globalProperty);

    // retain it
    JSGlobalContextRetain(globalContextRef);

    // load the app into the context
    //HyperloopJS *module = HyperloopLoadJS(globalContextRef,nullptr,name,prefix);
    //if (module==nullptr)
    //{
     //   return nullptr;
    //}

    return globalContextRef;
}

/**
 * given a context, get the global context
 */
JSGlobalContextRef HyperloopGetGlobalContext (JSContextRef ctx)
{
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
    JSValueRef value = JSObjectGetProperty(ctx, global, prop, nullptr);
    JSStringRelease(prop);
    if (JSValueIsObject(ctx,value))
    {
        JSObjectRef obj = JSValueToObject(ctx,value,0);
        return (JSGlobalContextRef)JSObjectGetPrivate(obj);
    }
    return nullptr;
}

/**
 * destroy a hyperloop VM
 */
void HyperloopDestroyVM (JSGlobalContextRef ctx)
{
    JSGlobalContextRef globalCtx = HyperloopGetGlobalContext(ctx);
    if (globalCtx!=nullptr)
    {
        JSObjectRef global = JSContextGetGlobalObject(ctx);
        JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
        JSValueRef value = JSObjectGetProperty(ctx, global, prop, nullptr);
        JSObjectRef obj = JSValueToObject(ctx,value,0);
        JSStringRelease(prop);
        JSObjectSetPrivate(obj,nullptr);
        JSGlobalContextRelease(globalCtx);
    }
}

/**
 * attempt to convert a JSString to a NSString
 */
String^ HyperloopToStringFromString(JSContextRef ctx, JSStringRef stringRef) {
	return hyperloop::getPlatformString(stringRef);
}

JSValueRef HyperloopboolToJSValueRef(JSContextRef ctx, bool boolean) {
	return JSValueMakeBoolean(ctx, boolean);
}
bool HyperloopJSValueRefTobool(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	if (JSValueIsBoolean(ctx, value)) {
        return JSValueToBoolean(ctx, value);
	}
    return false;
}

<% [ 'float64', 'float32', 'float',
		'int64', 'int32', 'int16', 'int8', 'int',
		'uint8', 'uint16', 'uint32', 'uint64'
	]
	.forEach(function(type) { %>
JSValueRef Hyperloop<%- type %>ToJSValueRef(JSContextRef ctx, <%- type %> val) {
	return JSValueMakeNumber(ctx, (double)val);
}
<%- type %> HyperloopJSValueRefTo<%- type %>(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	if (JSValueIsNumber(ctx, value)) {
        return (<%- type %>)JSValueToNumber(ctx, value, exception);
	}
    return 0;
}
<% }) %>

JSClassDefinition ClassDefinitionForObject;
JSClassDefinition ClassDefinitionForObjectConstructor;
JSClassRef ObjectClassDef;
JSClassRef ObjectClassDefForConstructor;
JSValueRef HyperloopstringToJSValueRef(JSContextRef ctx, String^ val) {
	return hyperloop::getJSValueRef(ctx, val);
}
String^ HyperloopJSValueRefTostring(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	return hyperloop::getPlatformString(ctx, value);
}
JSObjectRef MakeObjectForObject(JSContextRef ctx, Object^ instance)
{
	JSPrivateObject* poc = new JSPrivateObject();
	poc->object = instance;
	poc->type = JSPrivateObjectTypeID;
	JSObjectRef object = JSObjectMake(ctx, CreateClassForObject(), poc);
	JSObjectRef value = JSObjectMake(ctx, CreateClassForObjectConstructor(), 0);

	JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
	JSObjectSetProperty(ctx, object, cproperty, value, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(cproperty);

	JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
	JSStringRef valueProperty = JSStringCreateWithUTF8CString("Object");
	JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
	JSObjectSetProperty(ctx, value, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(nameProperty);
	JSStringRelease(valueProperty);

	return object;
}
JSValueRef HyperloopObjectToJSValueRef(JSContextRef ctx, Object^ instance)
{
	return MakeObjectForObject(ctx, instance);
}
Object^ HyperloopJSValueRefToObject(JSContextRef ctx, JSValueRef instance)
{
	JSObjectRef object = JSValueToObject(ctx, instance, 0);
	return HyperloopGetPrivateObjectAsID(object);
}
Object^ HyperloopJSValueRefToobject(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup)
{
	if (JSValueIsObject(ctx, value))
	{
		JSObjectRef object = JSValueToObject(ctx, value, exception);
		return HyperloopGetPrivateObjectAsID(object);
	}
	else
	{
		return nullptr;
	}
}
void InitializerForObject (JSContextRef ctx, JSObjectRef object)
{
	JSPrivateObject *po = (JSPrivateObject *)JSObjectGetPrivate(object);
}
void FinalizerForObject (JSObjectRef object)
{
	HyperloopDestroyPrivateObject(object);
}
JSValueRef toStringForObject (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	String^ obj = "Object";
	return hyperloop::getJSValueRef(ctx, obj);
}
JSValueRef JSTypeConvertorForObject(JSContextRef ctx, JSObjectRef object, JSType type, JSValueRef* exception)
{
	Object^ obj = (Object^)HyperloopGetPrivateObjectAsID(object);
	if (type == kJSTypeString)
	{
		return toStringForObject(ctx,NULL,object,0,NULL,exception);
	}
	return NULL;
}
bool IsInstanceForObject (JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
{
	return false;
}
static JSStaticValue StaticValueArrayForObject [] = {
	{ 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForObject [] = {
	{ "toString", toStringForObject, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },
	{ 0, 0, 0 }
};
JSClassRef CreateClassForObject ()
{
	static bool init;
	if (!init)
	{
		init = true;

		ClassDefinitionForObject = kJSClassDefinitionEmpty;
		ClassDefinitionForObject.staticValues = StaticValueArrayForObject;
		ClassDefinitionForObject.staticFunctions = StaticFunctionArrayForObject;
		ClassDefinitionForObject.initialize = InitializerForObject;
		ClassDefinitionForObject.finalize = FinalizerForObject;
		ClassDefinitionForObject.convertToType = JSTypeConvertorForObject;
		ClassDefinitionForObject.className = "Object";
		ClassDefinitionForObject.hasInstance = IsInstanceForObject;

		ObjectClassDef = JSClassCreate(&ClassDefinitionForObject);

		JSClassRetain(ObjectClassDef);
	}
	return ObjectClassDef;
}
JSObjectRef ObjectMakeInstance (JSContextRef ctx, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	throw ref new Exception(0, "Object constructor has not been exposed via hyperloop yet!");
}
JSObjectRef MakeInstanceForObject (JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return ObjectMakeInstance(ctx,argumentCount,arguments,exception);
}
JSValueRef MakeInstanceFromFunctionForObject (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return ObjectMakeInstance(ctx,argumentCount,arguments,exception);
}
static JSStaticFunction StaticFunctionArrayForObjectConstructor [] = {
	{ 0, 0, 0 }
};
JSClassRef CreateClassForObjectConstructor ()
{
	static bool init;
	if (!init)
	{
		init = true;

		ClassDefinitionForObjectConstructor = kJSClassDefinitionEmpty;
		ClassDefinitionForObjectConstructor.className = "ObjectConstructor";
		ClassDefinitionForObjectConstructor.callAsConstructor = MakeInstanceForObject;
		ClassDefinitionForObjectConstructor.callAsFunction = MakeInstanceFromFunctionForObject;
		ClassDefinitionForObjectConstructor.staticFunctions = StaticFunctionArrayForObjectConstructor;

		ObjectClassDefForConstructor = JSClassCreate(&ClassDefinitionForObjectConstructor);

		JSClassRetain(ObjectClassDefForConstructor);
	}
	return ObjectClassDefForConstructor;
}

JSValueRef HyperloopobjectToJSValueRef(JSContextRef ctx, Object^ instance) {
	JSPrivateObject* poc = new JSPrivateObject();
	poc->object = instance;
	poc->type = JSPrivateObjectTypeID;
	JSObjectRef object = JSObjectMake(ctx, CreateClassForObject(), poc);
	JSObjectRef value = JSObjectMake(ctx, CreateClassForObjectConstructor(), 0);

	JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
	JSObjectSetProperty(ctx, object, cproperty, value, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(cproperty);

	JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
	JSStringRef valueProperty = JSStringCreateWithUTF8CString("Object");
	JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
	JSObjectSetProperty(ctx, value, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(nameProperty);
	JSStringRelease(valueProperty);

	return object;
}