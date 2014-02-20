#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <string>
#include <Windows.h>
#include <JavaScriptCore/JavaScript.h>
#include "JSPrivateObject.h"
#include "JSModule.h"
#include "ObjectGuid.h"

class hyperloop
{
public:
	static std::wstring getWString(JSStringRef sValue);
	static std::wstring getWString(JSContextRef ctx, JSValueRef ref);
	static std::string getSStr(Platform::String^ string);
	static const char* getCStr(Platform::String^ string);
	static const char* getCStr(JSContextRef ctx, JSValueRef ref);
	static Platform::String^ getPlatformString(std::string sValue);
	static Platform::String^ getPlatformString(JSStringRef sValue);
	static Platform::String^ getPlatformString(JSContextRef ctx, JSStringRef sValue);
	static Platform::String^ getPlatformString(JSContextRef ctx, JSValueRef exception);
	static JSStringRef getJSStringRef(char *c_str, int length);
	static JSStringRef getJSStringRef(Platform::String^ string);
	static JSValueRef getJSValueRef(JSContextRef ctx, Platform::String^ string);
	static void log(String ^string);
private:
	hyperloop();
};

#define CHECK_EXCEPTION(ctx, exception)\
if (exception != nullptr) {\
	hyperloop::log(hyperloop::getPlatformString(ctx, exception));\
}

JSValueRef HyperloopundefinedToJSValueRef(JSContextRef, Object^);
JSValueRef HyperloopundefinedToJSValueRef(JSContextRef, void*);

/**
 * for a given JSObject, return the value of its length property.
 */
int HyperloopGetLength(JSContextRef ctx, JSObjectRef objRef, JSValueRef *exception);

/**
 * function will properly convert a native exception into a JS Error and throw it back
 * into the JSContext by setting the Error in the exception passed
 */
void HyperloopRaiseNativeToJSException(JSContextRef ctx, JSValueRef *exception, Exception ^ex, const char *file, const char *fnName, int lineNumber);

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
JSValueRef HyperloopToString(JSContextRef ctx, Object ^object);

/**
 * return a string representation as a JSValueRef for a void*
 */
JSValueRef HyperloopToString(JSContextRef ctx, void *object);

/**
 * attempt to convert a JSValueRef to a String
 */
String^ HyperloopToString(JSContextRef ctx, JSValueRef value);

/**
 * create a hyperloop VM
 */
JSGlobalContextRef HyperloopCreateVM(JSGlobalContextRef globalContextRef, JSObjectRef globalObjectref, String ^name, String ^prefix);

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
void *HyperloopJSValueRefTovoid(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);

<% [ 'float64', 'float32', 'float',
		'double', 'char', 'unsigned char',
		'int64', 'int32', 'int16', 'int8', 'int',
		'uint8', 'uint16', 'uint32', 'uint64'
	]
	.forEach(function(type) { %>
JSValueRef Hyperloop<%- type.replace(/ /g,'') %>ToJSValueRef(JSContextRef ctx, <%- type %> val);
<%- type %> HyperloopJSValueRefTo<%- type.replace(/ /g,'') %>(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);
JSValueRef Hyperloop<%- type.replace(/ /g,'') %>ArrayToJSValueRef(JSContextRef ctx, <%- type %>* val, int length);
<%- type %>* HyperloopJSValueRefTo<%- type.replace(/ /g,'') %>Array(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);
<% }) %>

JSValueRef HyperloopboolToJSValueRef(JSContextRef ctx, bool boolean);
bool HyperloopJSValueRefTobool(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);

JSValueRef HyperloopStringToJSValueRef(JSContextRef ctx, String^ string);
String^ HyperloopJSValueRefToString(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup);