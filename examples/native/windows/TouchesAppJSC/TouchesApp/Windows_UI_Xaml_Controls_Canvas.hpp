#pragma once
#include "Headers.h"
#include "ManipulationHandler.hpp"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Controls_Canvas
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("Canvas");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		Canvas^ nobj = ref new Canvas();
		poc->set(nobj);
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;		
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "Width", GetWidth, SetWidth, kJSPropertyAttributeNone }, 
		                                    { "Height", GetHeight, SetHeight, kJSPropertyAttributeNone }, 
											{ "Background", GetBackground, SetBackground, kJSPropertyAttributeNone }, 
											{ "RenderTransform", GetRenderTransform, SetRenderTransform, kJSPropertyAttributeNone }, 
											{ "ManipulationMode", GetManipulationMode, SetManipulationMode, kJSPropertyAttributeNone }, 
		                                    { 0, 0, 0, 0 }
		                                    };
		
		classDefinition.staticValues = StaticValueArray; 
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, poc);

		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		JSStringRef setTopMethod = JSStringCreateWithUTF8CString("SetTop");
		JSValueRef setTop = JSObjectMakeFunctionWithCallback(ctx, setTopMethod, SetTop);
		JSObjectSetProperty(ctx, prototype, setTopMethod, setTop, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setTopMethod);

		JSStringRef setLeftMethod = JSStringCreateWithUTF8CString("SetLeft");
		JSValueRef setLeft = JSObjectMakeFunctionWithCallback(ctx, setLeftMethod, SetLeft);
		JSObjectSetProperty(ctx, prototype, setLeftMethod, setLeft, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setLeftMethod);

		JSStringRef appendMethod = JSStringCreateWithUTF8CString("Append");
		JSValueRef append = JSObjectMakeFunctionWithCallback(ctx, appendMethod, Append);
		JSObjectSetProperty(ctx, prototype, appendMethod, append, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(appendMethod);

		JSStringRef addMethod = JSStringCreateWithUTF8CString("add");
		JSValueRef addRef = JSObjectMakeFunctionWithCallback(ctx, addMethod, add);
		JSObjectSetProperty(ctx, prototype, addMethod, addRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(addMethod);

		return classDef; 
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static bool SetWidth(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		double nVal = JSValueToNumber(ctx, value, NULL);
		nobj->Width =  nVal;
		return true;
	}

	static JSValueRef GetWidth(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Width); 
	}

	static bool SetHeight(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		double nVal = JSValueToNumber(ctx, value, NULL);
		nobj->Height =  nVal;
		return true;
	}

	static JSValueRef GetHeight(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Height); 
	}

	static bool SetBackground(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSObjectRef objRef = JSValueToObject(ctx, value, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Background =  (SolidColorBrush^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return true;
	}

	static JSValueRef GetBackground(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, 0); //nobj->Background); 
	}

	static bool SetRenderTransform (JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();		
		JSObjectRef objRef = JSValueToObject(ctx, value, NULL);
		raw = JSObjectGetPrivate(objRef);
        TransformGroup^ nobj2 = (TransformGroup^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
	    nobj->RenderTransform = nobj2;
		return true;
	}

	static JSValueRef GetRenderTransform(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, 0); //nobj->RenderTransform); 
	}

	static bool SetManipulationMode(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();		

		double nVal = JSValueToNumber(ctx, value, NULL);

		if (nVal == 0)
			nobj->ManipulationMode =  ManipulationModes::All;
		
		return true;
	}

	static JSValueRef GetManipulationMode(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, 0); //nobj->ManipulationMode); 
	}

	static JSValueRef SetTop(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSValueRef val2 = arguments[1];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->SetTop((UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get(), JSValueToNumber(ctx, val2, NULL));
		return val;
	}

	static JSValueRef SetLeft(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSValueRef val2 = arguments[1];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->SetLeft((UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get(), JSValueToNumber(ctx, val2, NULL));
		return val;
	}

	static JSValueRef Append(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSValueRef val2 = arguments[1];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Children->Append((UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get());
		return val;
	}

	static JSValueRef add(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {	
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();	
		JSValueRef val = arguments[0];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
        ManipulationHandler_UID^ nobj2 = (ManipulationHandler_UID^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
	    nobj2->SetSource((int64)thisObject);
		nobj->ManipulationDelta::add(ref new ManipulationDeltaEventHandler(nobj2, &ManipulationHandler_UID::ManipulationDelta));
		return JSValueMakeUndefined(ctx);
	}
};

