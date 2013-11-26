#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_TranslateTransform
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("TranslateTransform");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("TranslateTransform");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... property: setX.
		JSStringRef setXProperty = JSStringCreateWithUTF8CString("setX");
		JSValueRef setX = JSObjectMakeFunctionWithCallback(ctx, setXProperty, SetX);
		JSObjectSetProperty(ctx, prototype, setXProperty, setX, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setXProperty);

		// ... property: getX.
		JSStringRef getXProperty = JSStringCreateWithUTF8CString("getX");
		JSValueRef getX = JSObjectMakeFunctionWithCallback(ctx, getXProperty, GetX);
		JSObjectSetProperty(ctx, prototype, getXProperty, getX, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getXProperty);

		// ... property: setY.
		JSStringRef setYProperty = JSStringCreateWithUTF8CString("setY");
		JSValueRef setY = JSObjectMakeFunctionWithCallback(ctx, setYProperty, SetY);
		JSObjectSetProperty(ctx, prototype, setYProperty, setY, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setYProperty);

		// ... property: getY.
		JSStringRef getYProperty = JSStringCreateWithUTF8CString("getY");
		JSValueRef getY = JSObjectMakeFunctionWithCallback(ctx, getYProperty, GetY);
		JSObjectSetProperty(ctx, prototype, getYProperty, getY, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getYProperty);

		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(TranslateTransform.prototype, 'X', { get: TranslateTransform.prototype.getX, set:TranslateTransform.prototype.setX });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(TranslateTransform.prototype, 'Y', { get: TranslateTransform.prototype.getY, set:TranslateTransform.prototype.setY });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		TranslateTransform^ nobj = ref new TranslateTransform();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(nobj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static JSValueRef SetX(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);
		nobj->X = nVal;
		return val;
	}

	static JSValueRef GetX(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->X); 
	}

	static JSValueRef SetY(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);
		nobj->Y = nVal;
		return val;
	}

	static JSValueRef GetY(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Y); 
	}

};

