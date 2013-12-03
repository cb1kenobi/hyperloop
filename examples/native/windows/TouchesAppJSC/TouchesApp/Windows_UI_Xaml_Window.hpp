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
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "Current", GetCurrent, NULL, kJSPropertyAttributeReadOnly }, 
		                                    { 0, 0, 0, 0 }
		                                   };
		classDefinition.staticValues = StaticValueArray; 

		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("Window");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);
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
		return thisObject;  
	}

	static JSValueRef GetCurrent(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {		
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		Window^ nobj = Window::Current;
		poc->set(nobj);
		
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "Content", GetContent, SetContent, kJSPropertyAttributeNone },
											{ "Current", GetCurrent, NULL, kJSPropertyAttributeReadOnly }, 
		                                    { 0, 0, 0, 0 }
		                                   };
		classDefinition.staticValues = StaticValueArray; 

		JSStaticFunction StaticFunctionArray[] = {{ "Activate", Activate, kJSPropertyAttributeNone },
		                                          { 0, 0, 0 }
		                                         };		
		classDefinition.staticFunctions = StaticFunctionArray; 

		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, poc);
		
		return classDef;
	}

	static JSValueRef Activate(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Window^ nobj = (Window^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		nobj->Activate();
		
		return JSValueMakeUndefined(ctx);
	}
};

