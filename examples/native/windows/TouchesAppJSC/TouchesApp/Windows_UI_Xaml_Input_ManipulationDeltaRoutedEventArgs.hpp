#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Input;

class Windows_UI_Xaml_Input_ManipulationDeltaRoutedEventArgs
{
public:

	static JSObjectRef create(JSContextRef ctx, JSObjectRef source,  ManipulationDeltaRoutedEventArgs^ e) {
		JSObjectRef global = JSContextGetGlobalObject(ctx);
		JSClassDefinition myClassDefinition = kJSClassDefinitionEmpty;
		JSClassRef myClass = JSClassCreate(&myClassDefinition);
		JSObjectRef myObject = JSObjectMake(ctx, myClass, NULL);

		JSStringRef nameProperty = JSStringCreateWithUTF8CString("Expansion");
		JSValueRef valueRef = JSValueMakeNumber(ctx, e->Delta.Expansion);
		JSObjectSetProperty(ctx, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		
	    nameProperty = JSStringCreateWithUTF8CString("OriginalSource");
		valueRef = source;
		JSObjectSetProperty(ctx, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);

		nameProperty = JSStringCreateWithUTF8CString("X");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Translation.X);
		JSObjectSetProperty(ctx, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);

		nameProperty = JSStringCreateWithUTF8CString("Y");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Translation.Y);
		JSObjectSetProperty(ctx, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);

		nameProperty = JSStringCreateWithUTF8CString("Angle");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Rotation);
		JSObjectSetProperty(ctx, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);

		return myObject;
	}
};

