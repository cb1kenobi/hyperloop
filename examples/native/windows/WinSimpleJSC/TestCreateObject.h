#pragma once
#include "Headers.h"

class TestCreateObject
{
public:
	static void run(String^ &out, JSContextRef context, JSObjectRef global) {
		JSClassDefinition myClassDefinition = kJSClassDefinitionEmpty;
		JSClassRef myClass = JSClassCreate(&myClassDefinition);
		JSObjectRef myObject = JSObjectMake(context, myClass, NULL);
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("color"),
			valueProperty = JSStringCreateWithUTF8CString("bright red"),
			classProperty = JSStringCreateWithUTF8CString("marker");
		JSValueRef valueRef = JSValueMakeString(context, valueProperty);
		JSObjectSetProperty(context, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSObjectSetProperty(context, global, classProperty, myObject, kJSPropertyAttributeNone, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);
		JSStringRelease(classProperty);
		JSStringRef string = JSStringCreateWithUTF8CString("marker.color");
		JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
		out += "\n" + Utils::convertJSString(string) + " = " + Utils::convertJSString(sValue);
		JSStringRelease(string);
		JSClassRelease(myClass);
	}
};

