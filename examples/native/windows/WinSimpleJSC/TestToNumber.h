#pragma once
#include "Headers.h"

class TestToNumber
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("2 + 2");
		JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		out += "\n" + Utils::convertJSString(string) + " = " + JSValueToNumber(context, result, NULL);
		JSStringRelease(string);
	}
};

