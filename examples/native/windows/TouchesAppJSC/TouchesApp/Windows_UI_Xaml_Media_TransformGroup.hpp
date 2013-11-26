#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_TransformGroup
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("TransformGroup");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("TransformGroup");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... method: Append.
		JSStringRef AppendProperty = JSStringCreateWithUTF8CString("Append");
		JSValueRef AppendFunc = JSObjectMakeFunctionWithCallback(ctx, AppendProperty, Append);
		JSObjectSetProperty(ctx, prototype, AppendProperty, AppendFunc, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(AppendProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		TransformGroup^ nobj = ref new TransformGroup();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(nobj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static JSValueRef Append(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TransformGroup^ nobj = (TransformGroup^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Children->Append((Transform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get());

		return val;
	}

};

