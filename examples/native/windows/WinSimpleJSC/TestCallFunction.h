#pragma once
#include "Headers.h"

class TestCallFunction
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("return text;"),
			params = JSStringCreateWithUTF8CString("text");
		JSValueRef arguments = JSValueMakeNumber(context, 1337);
		JSObjectRef print = JSObjectMakeFunction(context, NULL, 1, &params, string, NULL, 1, NULL);
		JSValueRef result = JSObjectCallAsFunction(context, print, global, 1, &arguments, NULL);
		out += "\n func " + Utils::convertJSString(string) + " = " + JSValueToNumber(context, result, NULL);
		JSStringRelease(params);
		JSStringRelease(string);
	}
};

