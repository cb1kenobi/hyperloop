#pragma once
#include "Headers.h"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml;

class Windows_UI_Xaml_Window
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("Window");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		Window^ nobj =  Window::Current;
		poc->set(nobj);
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;		
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "Content", GetContent, SetContent, kJSPropertyAttributeNone }, 
		                                    { 0, 0, 0, 0 }
		                                    };
		
		classDefinition.staticValues = StaticValueArray; 
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, poc);

		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		JSStringRef activateMethod = JSStringCreateWithUTF8CString("Activate");
		JSValueRef activate = JSObjectMakeFunctionWithCallback(ctx, activateMethod, Activate);
		JSObjectSetProperty(ctx, prototype, activateMethod, activate, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(activateMethod);

		return classDef; 
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static bool SetContent(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSObjectRef objRef = JSValueToObject(ctx, value, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Content =  (UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return true;
	}

	static JSValueRef GetContent(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, 0); //nobj->Width); 
	}

	static JSValueRef Activate(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		nobj->Activate();
		return JSValueMakeUndefined(ctx);
	}
};

