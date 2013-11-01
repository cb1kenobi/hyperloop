#pragma once
#include "Headers.h"

class TestCreateTextBlock
{
public:

	static JSValueRef TextBlockGetProperty(JSContextRef ctx, JSObjectRef object, JSStringRef propertyNameJS, JSValueRef* exception)
	{
		return JSValueMakeUndefined(ctx);
	}

	static JSObjectRef TextBlockConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
	{
		return constructor;
	}

	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSClassDefinition textBlockClassDefinition = kJSClassDefinitionEmpty;
		JSClassRef textBlockClass = JSClassCreate(&textBlockClassDefinition);
		JSObjectRef textBlockConstructor = JSObjectMakeConstructor(context, textBlockClass, TextBlockConstructor);
		// TODO: should create an underlying TextBlock.
		JSStringRef className = JSStringCreateWithUTF8CString("TextBlock");
		JSObjectSetProperty(context, global, className, textBlockConstructor, kJSPropertyAttributeNone, NULL);
		// TODO: Allow writing "text" property -- pass through to underlying.
		// TODO: Allow reading "text" property -- pass through to underlying.
		// TODO: Expose read-only "Window" object with property "Current", and sub-property "content" (which sets Window::Current->Content).
		JSStringRef string = JSStringCreateWithUTF8CString("var textBlock = new TextBlock();\
														   textBlock.text = 'Hello, world!';\
														   Window.Current.content = textBlock;");
		JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		JSStringRelease(string);
		// TODO: If we comment out "window->Content = text;" in Main.cpp, we should be able to see TextBlock created above.
	}
};

