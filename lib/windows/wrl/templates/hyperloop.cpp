<%- renderTemplate('jsc/templates/doc.ejs') %>
#include "hyperloop.h"
#include "Logger.h"
#include "nan.h"
#include <collection.h>
#include <algorithm>
using namespace Platform;
using namespace Platform::Details;
using namespace Platform::Collections;
using namespace Windows::Foundation;
using namespace Windows::Foundation::Collections;
using namespace Windows::UI::Xaml;

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

std::string hyperloop::getSStr(Platform::String^ string) {
	return std::string(string->Begin(), string->End());
}

const char* hyperloop::getCStr(Platform::String^ string) {
	return std::string(string->Begin(), string->End()).c_str();
}

const char* hyperloop::getCStr(JSContextRef ctx, JSValueRef ref) {
	JSStringRef sValue = JSValueToStringCopy(ctx, ref, NULL);
	std::wstring w_str = hyperloop::getWString(sValue);
	std::string s_str(w_str.begin(), w_str.end());
	int length = sizeof(w_str);
	char *c_str = new char[length];
	strcpy_s(c_str, length, s_str.c_str());
	return c_str;
}

String^ hyperloop::getPlatformString(std::string s_str) {
	std::wstring b(s_str.begin(), s_str.end());
	const wchar_t *wcString = b.c_str();
	return ref new String(wcString);
}

String^ hyperloop::getPlatformString(JSStringRef sValue) {
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
	JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring w_str(s_str.begin(), s_str.end());
	return ref new String(hyperloop::getWString(sValue).c_str());
}

String^ hyperloop::getPlatformString(JSContextRef ctx, JSStringRef ref) {
	return hyperloop::getPlatformString(ref);
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

void hyperloop::log(String ^string) {
	Logger::log(string);
}

JSValueRef HyperloopundefinedToJSValueRef(JSContextRef ctx, Object^ o) {
	return JSValueMakeUndefined(ctx);
}
JSValueRef HyperloopundefinedToJSValueRef(JSContextRef ctx, void* o) {
	return JSValueMakeUndefined(ctx);
}

int HyperloopGetLength(JSContextRef ctx, JSObjectRef objRef, JSValueRef *exception) {
	JSStringRef str = JSStringCreateWithUTF8CString("length");
	JSValueRef length = JSObjectGetProperty(ctx, objRef, str, exception);
	JSStringRelease(str);
	return (int)JSValueToNumber(ctx, length, exception);
}


/**
 * function will properly convert a native exception into a JS Error and throw it back
 * into the JSContext by setting the Error in the exception passed
 */
void HyperloopRaiseNativeToJSException(JSContextRef ctx, JSValueRef *exception, Exception ^ex, const char *file, const char *fnName, int lineNumber)
{
	JSValueRef exargs[1];
	JSStringRef exstr = hyperloop::getJSStringRef(ex->Message);
	exargs[0] = JSValueMakeString(ctx, exstr);

	// make the js Error object
	JSObjectRef exobj = JSObjectMakeError(ctx, 1, exargs, 0);

	// set the native source filename
	{
		JSStringRef prop = JSStringCreateWithUTF8CString("nativeSource");
		JSStringRef valueStr = JSStringCreateWithUTF8CString(file);
		JSValueRef value = JSValueMakeString(ctx, valueStr);
		JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
		JSStringRelease(prop);
		JSStringRelease(valueStr);
	}
	// set the native source function
	{
		JSStringRef prop = JSStringCreateWithUTF8CString("nativeFunction");
		JSStringRef valueStr = JSStringCreateWithUTF8CString(fnName);
		JSValueRef value = JSValueMakeString(ctx, valueStr);
		JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
		JSStringRelease(prop);
		JSStringRelease(valueStr);
	}
	// set the native line number
	{
		JSStringRef prop = JSStringCreateWithUTF8CString("nativeLine");
		JSValueRef value = JSValueMakeNumber(ctx, lineNumber);
		JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
		JSStringRelease(prop);
	}

	JSStringRelease(exstr);

	// set our exception object
	*exception = exobj;
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
	hyperloop::log(out);

	return JSValueMakeUndefined(ctx);
}

JSValueRef HyperloopAlerter (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	if (argumentCount <= 0) {
		return JSValueMakeUndefined(ctx);
	}
	auto title = argumentCount == 1 ? "Alert" : HyperloopToString(ctx, arguments[0]);
	auto message = HyperloopToString(ctx, arguments[argumentCount == 1 ? 0 : 1]);
	try {
		(ref new Windows::UI::Popups::MessageDialog(message, title))->ShowAsync();
	}
	catch (Exception ^ex) {
		HyperloopRaiseNativeToJSException(ctx, exception, ex, __FILE__, __FUNCTION__, __LINE__);
	}
	return JSValueMakeUndefined(ctx);
}

/*
 Timeout and Interval Implementation.
*/

private class TimerState {
public:
	bool isInterval;
	int id;
	JSGlobalContextRef gctx;
	JSObjectRef thisObject;
	JSObjectRef callback;
};

static int timerCount;
static auto timers = ref new Map<int, DispatcherTimer ^>();
static auto timerStates = new std::map<int, TimerState *>();

private ref class TimerDoneCallback sealed {
private:
	int id;
public:
	TimerDoneCallback(int id) {
		this->id = id;
	};
	void EventCallback(Object^ sender, Object^ e);
};

static auto timerHandlers = ref new Map<int, TimerDoneCallback ^>();

void TimerDoneCallback::EventCallback(Object^ sender, Object^ e) {
	if (!timers->HasKey(id)) {
		return;
	}
	auto state = timerStates->at(id);
	JSValueRef exception = NULL;
	JSValueProtect(state->gctx, state->thisObject);
	JSValueProtect(state->gctx, state->callback);
	JSObjectCallAsFunction(state->gctx, state->callback, state->thisObject, 0, 0, &exception);
	JSValueUnprotect(state->gctx, state->thisObject);
	JSValueUnprotect(state->gctx, state->callback);
	if (!timers->HasKey(id)) {
		return;
	}
	CHECK_EXCEPTION(state->gctx, exception);
	if (!state->isInterval) {
		timers->Lookup(id)->Stop();
		JSValueUnprotect(state->gctx, state->thisObject);
		JSValueUnprotect(state->gctx, state->callback);
		timers->Remove(id);
		timerStates->erase(id);
		timerHandlers->Remove(id);
	}
}

JSValueRef HyperloopSetTimeoutOrInterval(bool isInterval, JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
	if (argumentCount <= 0) {
		return JSValueMakeUndefined(ctx);
	}
	auto id = timerCount++;
	auto gctx = HyperloopGetGlobalContext(ctx);
	auto callback = JSValueToObject(ctx, arguments[0], exception);
	auto timerDone = ref new TimerDoneCallback(id);
	auto handler = ref new Windows::Foundation::EventHandler<Object^>(timerDone, &TimerDoneCallback::EventCallback);

	auto timerState = new TimerState();
	timerState->isInterval = isInterval;
	timerState->id = id;
	timerState->gctx = gctx;
	timerState->thisObject = thisObject;
	timerState->callback = callback;
	timerStates->insert(std::make_pair(id, timerState));

	JSValueProtect(gctx, callback);
	JSValueProtect(gctx, thisObject);
	timerHandlers->Insert(id, timerDone);
	TimeSpan timeout;
	timeout.Duration = (argumentCount == 1 ? 0 : JSValueToNumber(ctx, arguments[1], exception)) * 10000;
	auto timer = ref new DispatcherTimer();
	timer->Tick += handler;
	timer->Interval = timeout;
	timer->Start();
	timers->Insert(id, timer);
	return JSValueMakeNumber(ctx, id);
}

JSValueRef HyperloopSetTimeout(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return HyperloopSetTimeoutOrInterval(false, ctx, function, thisObject, argumentCount, arguments, exception);
}

JSValueRef HyperloopSetInterval(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return HyperloopSetTimeoutOrInterval(true, ctx, function, thisObject, argumentCount, arguments, exception);
}

JSValueRef HyperloopClearIntervalOrTimeout(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	if (argumentCount <= 0) {
		return JSValueMakeUndefined(ctx);
	}
	auto id = JSValueToNumber(ctx, arguments[0], exception);
	if (id > timerCount || !timers->HasKey(id)) {
		return JSValueMakeUndefined(ctx);
	}
	auto timer = timers->Lookup(id);
	if (timer->IsEnabled) {
		timer->Stop();
	}
	auto state = timerStates->at(id);
	JSValueUnprotect(state->gctx, state->thisObject);
	JSValueUnprotect(state->gctx, state->callback);
	timers->Remove(id);
	timerStates->erase(id);
	timerHandlers->Remove(id);
	return JSValueMakeUndefined(ctx);
}

/**
 * create a hyperloop VM
 */

JSGlobalContextRef HyperloopCreateVM(JSGlobalContextRef globalContextRef, JSObjectRef globalObjectRef, String ^name, String ^prefix)
{
	// inject...
	// ... console.log.
	auto consoleObject = JSObjectMake(globalContextRef, 0, 0);
	auto logProperty = JSStringCreateWithUTF8CString("log");
	auto consoleProperty = JSStringCreateWithUTF8CString("console");
	auto logFunction = JSObjectMakeFunctionWithCallback(globalContextRef, logProperty, HyperloopLogger);
	JSObjectSetProperty(globalContextRef, consoleObject, logProperty, logFunction, kJSPropertyAttributeNone, 0);
	JSObjectSetProperty(globalContextRef, globalObjectRef, consoleProperty, consoleObject, kJSPropertyAttributeNone, 0);
	JSStringRelease(logProperty);
	JSStringRelease(consoleProperty);

	// ... alert.
	auto alertObject = JSObjectMake(globalContextRef, 0, 0);
	auto alertProperty = JSStringCreateWithUTF8CString("alert");
	auto alertFunction = JSObjectMakeFunctionWithCallback(globalContextRef, alertProperty, HyperloopAlerter);
	JSObjectSetProperty(globalContextRef, globalObjectRef, alertProperty, alertFunction, kJSPropertyAttributeNone, 0);
	JSStringRelease(alertProperty);

	// ... setTimeout.
	auto setTimeoutObject = JSObjectMake(globalContextRef, 0, 0);
	auto setTimeoutProperty = JSStringCreateWithUTF8CString("setTimeout");
	auto setTimeoutFunction = JSObjectMakeFunctionWithCallback(globalContextRef, setTimeoutProperty, HyperloopSetTimeout);
	JSObjectSetProperty(globalContextRef, globalObjectRef, setTimeoutProperty, setTimeoutFunction, kJSPropertyAttributeNone, 0);
	JSStringRelease(setTimeoutProperty);

	// ... setInterval.
	auto setIntervalObject = JSObjectMake(globalContextRef, 0, 0);
	auto setIntervalProperty = JSStringCreateWithUTF8CString("setInterval");
	auto setIntervalFunction = JSObjectMakeFunctionWithCallback(globalContextRef, setIntervalProperty, HyperloopSetInterval);
	JSObjectSetProperty(globalContextRef, globalObjectRef, setIntervalProperty, setIntervalFunction, kJSPropertyAttributeNone, 0);
	JSStringRelease(setIntervalProperty);

	// ... clearTimeout.
	auto clearTimeoutObject = JSObjectMake(globalContextRef, 0, 0);
	auto clearTimeoutProperty = JSStringCreateWithUTF8CString("clearTimeout");
	auto clearTimeoutFunction = JSObjectMakeFunctionWithCallback(globalContextRef, clearTimeoutProperty, HyperloopClearIntervalOrTimeout);
	JSObjectSetProperty(globalContextRef, globalObjectRef, clearTimeoutProperty, clearTimeoutFunction, kJSPropertyAttributeNone, 0);
	JSStringRelease(clearTimeoutProperty);

	// ... clearInterval.
	auto clearIntervalObject = JSObjectMake(globalContextRef, 0, 0);
	auto clearIntervalProperty = JSStringCreateWithUTF8CString("clearInterval");
	auto clearIntervalFunction = JSObjectMakeFunctionWithCallback(globalContextRef, clearIntervalProperty, HyperloopClearIntervalOrTimeout);
	JSObjectSetProperty(globalContextRef, globalObjectRef, clearIntervalProperty, clearIntervalFunction, kJSPropertyAttributeNone, 0);
	JSStringRelease(clearIntervalProperty);

	// create a hook into our global context
	auto def = kJSClassDefinitionEmpty;
	auto classDef = JSClassCreate(&def);
	auto wrapper = JSObjectMake(globalContextRef, classDef, globalContextRef);
	auto prop = JSStringCreateWithUTF8CString("hyperloop$global");
	JSObjectSetProperty(globalContextRef, globalObjectRef, prop, wrapper, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete, 0);
	JSStringRelease(prop);

	// setup our globals object
	auto globalProperty = JSStringCreateWithUTF8CString("global");
	JSObjectSetProperty(globalContextRef, globalObjectRef, globalProperty, globalObjectRef, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete, 0);
	JSStringRelease(globalProperty);

	// retain it
	JSGlobalContextRetain(globalContextRef);

	// load the app into the context
	auto module = HyperloopLoadJS(globalContextRef, nullptr, hyperloop::getSStr(name), hyperloop::getSStr(prefix));
	if (module == nullptr)
	{
		return nullptr;
	}

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
void *HyperloopJSValueRefTovoid(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	if (JSValueIsObject(ctx, value)) {
		JSObjectRef object = JSValueToObject(ctx, value, exception);
		JSPrivateObject *p = reinterpret_cast<JSPrivateObject*>(JSObjectGetPrivate(object));
		if (p != nullptr)
		{
			if (p->type == JSPrivateObjectTypeID)
			{
				return reinterpret_cast<void *>(p->object);
			}
			else
			{
				return p->buffer;
			}
		}
	}
	return nullptr;
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
		'double', 'char', 'unsigned char',
		'int64', 'int32', 'int16', 'int8', 'int',
		'uint8', 'uint16', 'uint32', 'uint64'
	]
	.forEach(function(type) { %>
JSValueRef Hyperloop<%- type.replace(/ /g,'') %>ToJSValueRef(JSContextRef ctx, <%- type %> val) {
	return JSValueMakeNumber(ctx, (double)val);
}
<%- type %> HyperloopJSValueRefTo<%- type.replace(/ /g,'') %>(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	if (JSValueIsNumber(ctx, value)) {
		return (<%- type %>)JSValueToNumber(ctx, value, exception);
	}
	return 0;
}
JSValueRef Hyperloop<%- type.replace(/ /g,'') %>ArrayToJSValueRef(JSContextRef ctx, <%- type %>* val, int length) {
	throw ref new Exception(-1, "Hyperloop<%- type %>ArrayToJSValueRef has not been implemented yet!");
}
<%- type %>* HyperloopJSValueRefTo<%- type.replace(/ /g,'') %>Array(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	if (JSValueIsObject(ctx, value)) {
		JSObjectRef objRef = JSValueToObject(ctx, value, exception);
		int length = HyperloopGetLength(ctx, objRef, exception);
		auto result = new <%- type %>[length];
		for (int i = 0; i < length; i++) {
			JSValueRef val = JSObjectGetPropertyAtIndex(ctx, objRef, i, exception);
			result[i] = HyperloopJSValueRefTo<%- type.replace(/ /g,'') %>(ctx, val, exception, 0);
		}
		return result;
	}
	return 0;
}
<% }) %>

JSValueRef HyperloopStringToJSValueRef(JSContextRef ctx, String^ val) {
	return hyperloop::getJSValueRef(ctx, val);
}
String^ HyperloopJSValueRefToString(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup) {
	return hyperloop::getPlatformString(ctx, value);
}