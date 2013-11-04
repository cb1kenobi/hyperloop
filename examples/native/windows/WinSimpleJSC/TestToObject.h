#pragma once
#include "Headers.h"

class TestToObject
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("{ \"eat\": \"cheese\" }");
		JSValueRef oValue = JSValueMakeFromJSONString(context, string);
		JSStringRef soValue = JSValueCreateJSONString(context, oValue, 4, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + Utils::getPlatformString(soValue);
		JSStringRelease(soValue);
		JSStringRelease(string);
	}
};

