#pragma once
#include <string>
#include <Windows.h>
#include <JavaScriptCore/JavaScript.h>
#include "JSPrivateObject.h"
using namespace Platform;
using namespace Platform::Details;

class hyperloop
{
public:
	static std::wstring getWString(JSStringRef sValue);
	static std::wstring getWString(JSContextRef ctx, JSValueRef ref);
	static const char* hyperloop::getCStr(Platform::String^ string);
	static Platform::String^ getPlatformString(JSStringRef sValue);
	static Platform::String^ getPlatformString(JSContextRef ctx, JSStringRef sValue);
	static Platform::String^ getPlatformString(JSContextRef ctx, JSValueRef exception);
	static JSStringRef getJSStringRef(Platform::String^ string);
	static JSValueRef getJSValueRef(JSContextRef ctx, Platform::String^ string);
private:
	hyperloop();
};

#define CHECK_EXCEPTION(ctx, exception)\
if (exception != nullptr) {\
	OutputDebugString(hyperloop::getWString(ctx, exception).c_str());\
	OutputDebugStringA("\n");\
}

JSValueRef HyperloopundefinedToJSValueRef(JSContextRef, Object^);
JSValueRef HyperloopundefinedToJSValueRef(JSContextRef, void*);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is an id
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx, Object^ object);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a void *
 */
JSPrivateObject* HyperloopMakePrivateObjectForPointer(void *pointer);

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a double
 */
JSPrivateObject* HyperloopMakePrivateObjectForNumber(double value);

/**
 * return a JSPrivateObject as an ID (or nil if not of type JSPrivateObjectTypeID)
 */
Object^ HyperloopGetPrivateObjectAsID(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a void * (or NULL if not of type JSPrivateObjectTypePointer)
 */
void* HyperloopGetPrivateObjectAsPointer(JSObjectRef objectRef);

/**
 * return a JSPrivateObject as a double (or NaN if not of type JSPrivateObjectTypeNumber)
 */
double HyperloopGetPrivateObjectAsNumber(JSObjectRef objectRef);

/**
 * return true if JSPrivateObject contained in JSObjectRef is of type
 */
bool HyperloopPrivateObjectIsType(JSObjectRef objectRef, JSPrivateObjectType type);

/**
 * destroy a JSPrivateObject stored in a JSObjectRef
 */
void HyperloopDestroyPrivateObject(JSObjectRef object);

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *message, JSValueRef *exception);

/**
 * return a string representation as a JSValueRef for an Object^
 */
JSValueRef HyperloopToString(JSContextRef ctx, Object^ object);

/**
 * return a string representation as a JSValueRef for a void*
 */
JSValueRef HyperloopToString(JSContextRef ctx, void* object);

/**
 * attempt to convert a JSValueRef to a String
 */
String^ HyperloopToString(JSContextRef ctx, JSValueRef value);

/**
 * create a hyperloop VM
 */
JSGlobalContextRef HyperloopCreateVM ();

/**
 * given a context, get the global context
 */
JSGlobalContextRef HyperloopGetGlobalContext(JSContextRef ctx);

/**
 * destroy a hyperloop VM
 */
void HyperloopDestroyVM(JSGlobalContextRef ctx);

/**
 * attempt to convert a JSString to a String
 */
String^ HyperloopToStringFromString(JSContextRef ctx, JSStringRef value);

<% [ 'float64', 'float32', 'float',
		'int64', 'int32', 'int16', 'int8', 'int',
		'uint8', 'uint16', 'uint32', 'uint64'
	]
	.forEach(function(type) { %>
JSValueRef Hyperloop<%- type %>ToJSValueRef(JSContextRef ctx, <%- type %> val);
<%- type %> HyperloopJSValueRefTo<%- type %>(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);
<% }) %>

JSValueRef HyperloopboolToJSValueRef(JSContextRef ctx, bool boolean);
bool HyperloopJSValueRefTobool(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);

JSValueRef HyperloopstringToJSValueRef(JSContextRef ctx, String^ string);
String^ HyperloopJSValueRefTostring(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);

JSObjectRef MakeObjectForObject(JSContextRef ctx, Object^ instance);
JSClassRef CreateClassForObject();
JSClassRef CreateClassForObjectConstructor();
JSValueRef HyperloopObjectToJSValueRef(JSContextRef ctx, Object^ instance);
Object^ HyperloopJSValueRefToObject(JSContextRef ctx, JSValueRef instance);
Object^ HyperloopJSValueRefToobject(JSContextRef ctx, JSValueRef instance, JSValueRef *exception, bool *cleanup);
JSValueRef HyperloopobjectToJSValueRef(JSContextRef ctx, Object^ instance);