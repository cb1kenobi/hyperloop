#pragma once
#include "Headers.h"

JSClassDefinition ClassDefinitionForTextAlignment;
JSClassRef TextAlignmentClassDef;

JSValueRef HyperloopTextAlignmentToJSValueRef(JSContextRef ctx, TextAlignment type)
{
	double num = (double)type;
	return JSValueMakeNumber(ctx, (double)type);
}
JSValueRef GetCenterForTextAlignment (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    auto result$ = TextAlignment::Center;
    JSValueRef result = HyperloopTextAlignmentToJSValueRef(ctx, result$);
    return result;
}
JSValueRef GetLeftForTextAlignment (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    auto result$ = TextAlignment::Left;
    JSValueRef result = HyperloopTextAlignmentToJSValueRef(ctx, result$);
    return result;
}
JSValueRef GetRightForTextAlignment (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    auto result$ = TextAlignment::Right;
    JSValueRef result = HyperloopTextAlignmentToJSValueRef(ctx, result$);
    return result;
}
JSValueRef GetJustifyForTextAlignment (JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    auto result$ = TextAlignment::Justify;
    JSValueRef result = HyperloopTextAlignmentToJSValueRef(ctx, result$);
    return result;
}

static JSStaticValue StaticValueArrayForTextAlignment [] = {
    { "Center", GetCenterForTextAlignment, 0, kJSPropertyAttributeNone },
    { "Left", GetLeftForTextAlignment, 0, kJSPropertyAttributeNone },
    { "Right", GetRightForTextAlignment, 0, kJSPropertyAttributeNone },
    { "Justify", GetJustifyForTextAlignment, 0, kJSPropertyAttributeNone },
    { 0, 0, 0, 0 }
};

JSValueRef toStringForTextAlignment(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	JSStringRef result$ = JSStringCreateWithUTF8CString("TextAlignment");
	JSValueRef result = JSValueMakeString(ctx, result$);
	JSStringRelease(result$);
	return result;
}

static JSStaticFunction StaticFunctionArrayForTextAlignment [] = {
    { "toString", toStringForTextAlignment, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete },
    { 0, 0, 0 }
};


JSClassRef CreateClassForTextAlignment ()
{
    static bool init;
    if (!init)
    {
        init = true;

        ClassDefinitionForTextAlignment = kJSClassDefinitionEmpty;
        ClassDefinitionForTextAlignment.staticValues = StaticValueArrayForTextAlignment;
        ClassDefinitionForTextAlignment.staticFunctions = StaticFunctionArrayForTextAlignment;
        ClassDefinitionForTextAlignment.className = "TextAlignment";

        TextAlignmentClassDef = JSClassCreate(&ClassDefinitionForTextAlignment);

        JSClassRetain(TextAlignmentClassDef);
    }
    return TextAlignmentClassDef;
}


JSObjectRef MakeObjectForTextAlignment(JSContextRef ctx)
{
    JSClassRef classRef = CreateClassForTextAlignment();
    JSObjectRef object = JSObjectMake(ctx, classRef, 0);

    JSStringRef nameProperty = JSStringCreateWithUTF8CString("name");
    JSStringRef valueProperty = JSStringCreateWithUTF8CString("TextAlignment");
    JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
    JSObjectSetProperty(ctx, object, nameProperty, valueRef, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(nameProperty);
    JSStringRelease(valueProperty);

    JSObjectRef plainObject = JSObjectMake(ctx,0,0);
    JSStringRef prototypeProperty = JSStringCreateWithUTF8CString("prototype");
    JSObjectSetProperty(ctx, object, prototypeProperty, plainObject, kJSPropertyAttributeDontEnum, 0);
    JSStringRelease(prototypeProperty);

    return object;
}

class TestCreateObject
{
public:
	static void run(String^ &out, JSContextRef ctx, JSObjectRef global) {
		JSStringRef TextAlignmentProp = JSStringCreateWithUTF8CString("TextAlignment");
		JSObjectRef TextAlignmentObjectRef = MakeObjectForTextAlignment(ctx);
		JSObjectSetProperty(ctx, global, TextAlignmentProp, TextAlignmentObjectRef, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete, 0);
		JSStringRelease(TextAlignmentProp);


		JSStringRef string = JSStringCreateWithUTF8CString("TextAlignment.Right"); // = 2
		JSValueRef result = JSEvaluateScript(ctx, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(ctx, result, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + Utils::getPlatformString(sValue);
		JSStringRelease(string);
	}
};

