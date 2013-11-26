#pragma once
#include "Headers.h"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml;

class Windows_UI_Xaml_Window
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("Window");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("Window");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... method: setContent.
		JSStringRef setContentProperty = JSStringCreateWithUTF8CString("setContent");
		JSValueRef setContent = JSObjectMakeFunctionWithCallback(ctx, setContentProperty, SetContent);
		JSObjectSetProperty(ctx, prototype, setContentProperty, setContent, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setContentProperty);

		// ... method: Activate.
		JSStringRef activateMethod = JSStringCreateWithUTF8CString("activate");
		JSValueRef activate = JSObjectMakeFunctionWithCallback(ctx, activateMethod, Activate);
		JSObjectSetProperty(ctx, prototype, activateMethod, activate, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(activateMethod);

		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Window.prototype, 'content', { set:Window.prototype.setContent });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		Window^ nobj = Window::Current;
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(nobj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static JSValueRef SetContent(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {	
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Content =  (UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return val;
	}

	static JSValueRef Activate(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		nobj->Activate();
		return JSValueMakeUndefined(ctx);
	}
};

