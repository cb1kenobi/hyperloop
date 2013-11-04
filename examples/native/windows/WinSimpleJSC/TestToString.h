#pragma once
#include "Headers.h"

class TestToString
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("'Hello, world!'");
		auto result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + Utils::getPlatformString(sValue);
		JSStringRelease(sValue);
		JSStringRelease(string);
	}
};

