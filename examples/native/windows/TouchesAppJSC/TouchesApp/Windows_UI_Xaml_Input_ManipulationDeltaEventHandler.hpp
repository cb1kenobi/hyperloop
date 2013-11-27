#pragma once
#include "Headers.h"
#include <ManipulationHandler.hpp>

class Windows_UI_Xaml_Input_ManipulationDeltaEventHandler
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("ManipulationDeltaEventHandler");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		JSValueRef val = arguments[0];
		JSValueRef val2 = arguments[1];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		void* raw = JSObjectGetPrivate(objRef);
		ManipulationHandler_UID^ nobj = (ManipulationHandler_UID^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		poc->set(nobj);
	    nobj->SetDeltaCallback((int64)JSValueToObject(ctx, val2, NULL));
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.finalize = classDestructor;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}
};

