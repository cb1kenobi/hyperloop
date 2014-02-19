<%- renderTemplate('jsc/templates/doc.ejs') %>
#include "ObjectGuid.h"
#include "hyperloop.h"

<% [ [ 'Object', '^', true ], [ 'Guid', '', false ] ].forEach(function(args) {
	var type = args[0], pointer = args[1], isRefType = args[2]; %>
JSClassDefinition ClassDefinitionFor<%- type %>;
JSClassDefinition ClassDefinitionFor<%- type %>Constructor;
JSClassRef <%- type %>ClassDef;
JSClassRef <%- type %>ClassDefForConstructor;

JSObjectRef MakeObjectFor<%- type %>(JSContextRef ctx, <%- type + pointer %> instance)
{
	JSPrivateObject* poc = new JSPrivateObject();
	<%
	if (isRefType) {
		%>poc->object = instance;
	poc->type = JSPrivateObjectTypeID;<%
	} else {
		%>size_t len = sizeof(<%- type %>);
	<%- type %> *copy = (<%- type %> *)malloc(len);
	memcpy(copy, &instance, len);
	poc->buffer = copy;
	poc->type = JSPrivateObjectTypePointer;<%
	} %>
	JSObjectRef object = JSObjectMake(ctx, CreateClassFor<%- type %>(), poc);
	JSObjectRef value = JSObjectMake(ctx, CreateClassFor<%- type %>Constructor(), 0);

	JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
	JSObjectSetProperty(ctx, object, cproperty, value, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(cproperty);

	JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
	JSStringRef valueProperty = JSStringCreateWithUTF8CString("<%- type %>");
	JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
	JSObjectSetProperty(ctx, value, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(nameProperty);
	JSStringRelease(valueProperty);

	return object;
}
JSValueRef Hyperloop<%- type %>ToJSValueRef(JSContextRef ctx, <%- type + pointer %> instance)
{
	return MakeObjectFor<%- type %>(ctx, instance);
}
<%- type + pointer %> HyperloopJSValueRefTo<%- type %>(JSContextRef ctx, JSValueRef instance)
{
	JSObjectRef object = JSValueToObject(ctx, instance, 0);
	<%
	if (isRefType) {
		%>return HyperloopGetPrivateObjectAsID(object);<%
	} else {
		%>return *(<%- type %> *)HyperloopGetPrivateObjectAsPointer(object);<%
	}
	%>
}
<%- type + pointer %> HyperloopJSValueRefTo<%- type.toLowerCase() %>(JSContextRef ctx, JSValueRef value, JSValueRef *exception, bool *cleanup)
{
	<%
	if (!isRefType) {
		%>return *(<%- type %> *)HyperloopGetPrivateObjectAsPointer(JSValueToObject(ctx, value, exception));<%
	} else { %>
	if (JSValueIsObject(ctx, value))
	{
		JSObjectRef object = JSValueToObject(ctx, value, exception);
		return HyperloopGetPrivateObjectAsID(object);
	}
	if (JSValueIsString(ctx, value) || JSValueIsBoolean(ctx, value) || JSValueIsNumber(ctx, value))
	{
		return hyperloop::getPlatformString(ctx, value);
	}
	return nullptr;
	<% } %>
}
void InitializerFor<%- type %> (JSContextRef ctx, JSObjectRef object)
{
	JSPrivateObject *po = (JSPrivateObject *)JSObjectGetPrivate(object);
}
void FinalizerFor<%- type %> (JSObjectRef object)
{
	HyperloopDestroyPrivateObject(object);
}
JSValueRef toStringFor<%- type %> (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	String^ obj = "<%- type %>";
	return hyperloop::getJSValueRef(ctx, obj);
}
JSValueRef JSTypeConvertorFor<%- type %>(JSContextRef ctx, JSObjectRef object, JSType type, JSValueRef* exception)
{
	<%- type + pointer %> obj = (<%- type + pointer %>)HyperloopGetPrivateObjectAsID(object);
	if (type == kJSTypeString)
	{
		return toStringFor<%- type %>(ctx,NULL,object,0,NULL,exception);
	}
	return NULL;
}
bool IsInstanceFor<%- type %> (JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
{
	return false;
}
static JSStaticValue StaticValueArrayFor<%- type %> [] = {
	{ 0, 0, 0, 0 }
};
static JSStaticFunction StaticFunctionArrayFor<%- type %> [] = {
	{ "toString", toStringFor<%- type %>, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },
	{ 0, 0, 0 }
};
JSClassRef CreateClassFor<%- type %> ()
{
	static bool init;
	if (!init)
	{
		init = true;

		ClassDefinitionFor<%- type %> = kJSClassDefinitionEmpty;
		ClassDefinitionFor<%- type %>.staticValues = StaticValueArrayFor<%- type %>;
		ClassDefinitionFor<%- type %>.staticFunctions = StaticFunctionArrayFor<%- type %>;
		ClassDefinitionFor<%- type %>.initialize = InitializerFor<%- type %>;
		ClassDefinitionFor<%- type %>.finalize = FinalizerFor<%- type %>;
		ClassDefinitionFor<%- type %>.convertToType = JSTypeConvertorFor<%- type %>;
		ClassDefinitionFor<%- type %>.className = "<%- type %>";
		ClassDefinitionFor<%- type %>.hasInstance = IsInstanceFor<%- type %>;

		<%- type %>ClassDef = JSClassCreate(&ClassDefinitionFor<%- type %>);

		JSClassRetain(<%- type %>ClassDef);
	}
	return <%- type %>ClassDef;
}
JSObjectRef <%- type %>MakeInstance (JSContextRef ctx, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	HyperloopRaiseNativeToJSException(ctx, exception, ref new Exception(-1, "<%- type %> constructor has not been exposed via hyperloop yet!"), __FILE__, __FUNCTION__, __LINE__);
	return nullptr;
}
JSObjectRef MakeInstanceFor<%- type %> (JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return <%- type %>MakeInstance(ctx,argumentCount,arguments,exception);
}
JSValueRef MakeInstanceFromFunctionFor<%- type %> (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return <%- type %>MakeInstance(ctx,argumentCount,arguments,exception);
}
static JSStaticFunction StaticFunctionArrayFor<%- type %>Constructor [] = {
	{ 0, 0, 0 }
};
JSClassRef CreateClassFor<%- type %>Constructor ()
{
	static bool init;
	if (!init)
	{
		init = true;

		ClassDefinitionFor<%- type %>Constructor = kJSClassDefinitionEmpty;
		ClassDefinitionFor<%- type %>Constructor.className = "<%- type %>Constructor";
		ClassDefinitionFor<%- type %>Constructor.callAsConstructor = MakeInstanceFor<%- type %>;
		ClassDefinitionFor<%- type %>Constructor.callAsFunction = MakeInstanceFromFunctionFor<%- type %>;
		ClassDefinitionFor<%- type %>Constructor.staticFunctions = StaticFunctionArrayFor<%- type %>Constructor;

		<%- type %>ClassDefForConstructor = JSClassCreate(&ClassDefinitionFor<%- type %>Constructor);

		JSClassRetain(<%- type %>ClassDefForConstructor);
	}
	return <%- type %>ClassDefForConstructor;
}

JSValueRef Hyperloop<%- type.toLowerCase() %>ToJSValueRef(JSContextRef ctx, <%- type + pointer %> instance) {
	JSPrivateObject* poc = new JSPrivateObject();
	<%
	if (isRefType) {
		%>poc->object = instance;
	poc->type = JSPrivateObjectTypeID;<%
	} else {
		%>size_t len = sizeof(<%- type %>);
	<%- type %> *copy = (<%- type %> *)malloc(len);
	memcpy(copy, &instance, len);
	poc->buffer = copy;
	poc->type = JSPrivateObjectTypePointer;<%
	} %>
	JSObjectRef object = JSObjectMake(ctx, CreateClassFor<%- type %>(), poc);
	JSObjectRef value = JSObjectMake(ctx, CreateClassFor<%- type %>Constructor(), 0);

	JSStringRef cproperty = JSStringCreateWithUTF8CString("constructor");
	JSObjectSetProperty(ctx, object, cproperty, value, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(cproperty);

	JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
	JSStringRef valueProperty = JSStringCreateWithUTF8CString("<%- type %>");
	JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
	JSObjectSetProperty(ctx, value, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
	JSStringRelease(nameProperty);
	JSStringRelease(valueProperty);

	return object;
}
<% }); %>