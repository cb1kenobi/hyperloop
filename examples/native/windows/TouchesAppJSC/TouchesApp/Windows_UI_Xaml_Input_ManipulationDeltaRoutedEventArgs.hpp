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

		JSStringRef expansionProperty = JSStringCreateWithUTF8CString("Expansion");
		JSValueRef valueRef = JSValueMakeNumber(ctx, e->Delta.Expansion);
		JSObjectSetProperty(ctx, myObject, expansionProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(expansionProperty);

	    JSStringRef originalSourceProperty = JSStringCreateWithUTF8CString("OriginalSource");
		valueRef = source;
		JSObjectSetProperty(ctx, myObject, originalSourceProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(originalSourceProperty);

		JSStringRef xProperty = JSStringCreateWithUTF8CString("X");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Translation.X);
		JSObjectSetProperty(ctx, myObject, xProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(xProperty);

		JSStringRef yProperty = JSStringCreateWithUTF8CString("Y");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Translation.Y);
		JSObjectSetProperty(ctx, myObject, yProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(yProperty);

		JSStringRef angleProperty = JSStringCreateWithUTF8CString("Angle");
		valueRef = JSValueMakeNumber(ctx, e->Delta.Rotation);
		JSObjectSetProperty(ctx, myObject, angleProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(angleProperty);

		return myObject;
	}
};

