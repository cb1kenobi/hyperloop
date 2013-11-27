#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_TransformGroup
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("TransformGroup");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		TransformGroup^ nobj = ref new TransformGroup();
		poc->set(nobj);
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;		
		classDefinition.finalize = classDestructor;
	
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, poc);

		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		JSStringRef appendMethod = JSStringCreateWithUTF8CString("Append");
		JSValueRef append = JSObjectMakeFunctionWithCallback(ctx, appendMethod, Append);
		JSObjectSetProperty(ctx, prototype, appendMethod, append, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(appendMethod);

		return classDef; 
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

