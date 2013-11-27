#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_TranslateTransform
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("TranslateTransform");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		TranslateTransform^ nobj = ref new TranslateTransform();
		poc->set(nobj);
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;		
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "X", GetX, SetX, kJSPropertyAttributeNone }, 
		                                    { "Y", GetY, SetY, kJSPropertyAttributeNone }, 
		                                    { 0, 0, 0, 0 }
		                                    };
		
		classDefinition.staticValues = StaticValueArray; 
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, poc);

		return classDef; 
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static bool SetX(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		double nVal = JSValueToNumber(ctx, value, NULL);
		nobj->X = nVal;
		return true;
	}

	static JSValueRef GetX(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->X); 
	}

	static bool SetY(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		double nVal = JSValueToNumber(ctx, value, NULL);
		nobj->Y = nVal;
		return true;
	}

	static JSValueRef GetY(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TranslateTransform^ nobj = (TranslateTransform^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Y); 
	}
};

