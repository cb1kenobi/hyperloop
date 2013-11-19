#pragma once
#include "Headers.h"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_SolidColorBrush
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("SolidColorBrush");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("SolidColorBrush");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... method: setColor.
		JSStringRef setColorProperty = JSStringCreateWithUTF8CString("setColor");
		JSValueRef setColor = JSObjectMakeFunctionWithCallback(ctx, setColorProperty, SetColor);
		JSObjectSetProperty(ctx, prototype, setColorProperty, setColor, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setColorProperty);

		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(SolidColorBrush.prototype, 'color', { set:SolidColorBrush.prototype.setColor });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		SolidColorBrush^ nobj = ref new SolidColorBrush();
		nobj->Color = Colors::AliceBlue;
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(nobj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static JSValueRef SetColor(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		SolidColorBrush^ nobj = (SolidColorBrush^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);

		if (nVal == 0)
			nobj->Color =  Colors::Red; 
		if (nVal == 1)
			nobj->Color =  Colors::Yellow; 
		if (nVal == 2)
			nobj->Color =  Colors::Green; 
		if (nVal == 3)
			nobj->Color =  Colors::Blue; 

		return val;
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

};

