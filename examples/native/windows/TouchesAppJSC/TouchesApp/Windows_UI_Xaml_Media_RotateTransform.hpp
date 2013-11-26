#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_RotateTransform
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("RotateTransform");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("RotateTransform");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... property: setAngle.
		JSStringRef setAngleProperty = JSStringCreateWithUTF8CString("setAngle");
		JSValueRef setAngle = JSObjectMakeFunctionWithCallback(ctx, setAngleProperty, SetAngle);
		JSObjectSetProperty(ctx, prototype, setAngleProperty, setAngle, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setAngleProperty);

		// ... property: getAngle.
		JSStringRef getAngleProperty = JSStringCreateWithUTF8CString("getAngle");
		JSValueRef getAngle = JSObjectMakeFunctionWithCallback(ctx, getAngleProperty, GetAngle);
		JSObjectSetProperty(ctx, prototype, getAngleProperty, getAngle, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getAngleProperty);

		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(RotateTransform.prototype, 'Angle', { get: RotateTransform.prototype.getAngle, set:RotateTransform.prototype.setAngle });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		RotateTransform^ nobj = ref new RotateTransform();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(nobj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static JSValueRef SetAngle(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		RotateTransform^ nobj = (RotateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);
		nobj->Angle = nVal;
		return val;
	}

	static JSValueRef GetAngle(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		RotateTransform^ nobj = (RotateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Angle); 
	}
};

