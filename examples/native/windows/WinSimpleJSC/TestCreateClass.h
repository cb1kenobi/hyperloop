#pragma once
#include "Headers.h"

class TestCreateClass
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSStringRef string = JSStringCreateWithUTF8CString("this.name = name;"),
			className = JSStringCreateWithUTF8CString("Tree"),
			params = JSStringCreateWithUTF8CString("name");
		JSObjectRef tree = JSObjectMakeFunction(context, className, 1, &params, string, NULL, 1, NULL);
		JSObjectSetProperty(context, global, className, tree, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);
		JSStringRelease(params);
		string = JSStringCreateWithUTF8CString("var tree = new Tree('Redwood');\ntree.name");
		JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
		out += "\n" + Utils::convertJSString(string) + " = " + Utils::convertJSString(sValue);
		JSStringRelease(string);
		string = JSStringCreateWithUTF8CString("var tree = new Tree('Aspen');\ntree.constructor");
		result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		sValue = JSValueToStringCopy(context, result, NULL);
		out += "\n" + Utils::convertJSString(string) + " = " + Utils::convertJSString(sValue);
		JSStringRelease(string);
	}
};

