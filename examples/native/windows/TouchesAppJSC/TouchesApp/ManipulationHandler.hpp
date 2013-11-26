#pragma once
#include "Headers.h"
#include <Windows_UI_Xaml_Input_ManipulationDeltaRoutedEventArgs.hpp>

using namespace Windows::UI::Xaml::Input;

ref class ManipulationHandler_UID sealed : public ::Object
{
public:
	ManipulationHandler_UID();
	void ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e);
	void SetContext(int64 context);
	void SetDeltaCallback(int64 callback);
	void SetSource(int64 source);
	
private:
    JSContextRef context;
	JSObjectRef deltaCallback;
	JSObjectRef source;	
};

ManipulationHandler_UID::ManipulationHandler_UID() {}

void ManipulationHandler_UID::ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e)
{
	JSObjectRef evtArg = Windows_UI_Xaml_Input_ManipulationDeltaRoutedEventArgs::create(context, 
									source, e);

    JSValueRef args[] = { source, evtArg };
	JSValueRef result = JSObjectCallAsFunction(context, deltaCallback, source, 2, args, NULL);
}

void ManipulationHandler_UID::SetContext(int64 context)
{
	this->context = (JSContextRef)context;
}

void ManipulationHandler_UID::SetDeltaCallback(int64 callback)
{
	deltaCallback = (JSObjectRef)callback;
}

void ManipulationHandler_UID::SetSource(int64 source)
{
	this->source = (JSObjectRef)source;
}

class  ManipulationHandler
{
public:
	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("ManipulationHandler");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("ManipulationHandler");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		ManipulationHandler_UID^ obj = ref new ManipulationHandler_UID();
		obj->SetContext((int64)Utils::getAppContext());
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(obj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}
};