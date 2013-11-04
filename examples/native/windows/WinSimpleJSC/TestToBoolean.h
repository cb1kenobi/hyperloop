#pragma once
#include "Headers.h"

class TestToBoolean
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("Superman >= Batman");
		JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + JSValueToBoolean(context, result);
		JSStringRelease(string);
	}
};

