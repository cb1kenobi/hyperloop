#pragma once
#include "Headers.h"

using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Media_SolidColorBrush
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		JSClassRef clsRef = JSClassCreate(&classDefinition);
		JSObjectRef classDef = JSObjectMake(ctx, clsRef, NULL);
		JSStringRef className = JSStringCreateWithUTF8CString("SolidColorBrush");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		SolidColorBrush^ nobj = ref new SolidColorBrush();
		poc->set(nobj);
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;		
		classDefinition.finalize = classDestructor;
		JSStaticValue StaticValueArray[] = {{ "Color", GetColor, SetColor, kJSPropertyAttributeNone }, 
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

	static bool SetColor(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, const JSValueRef value, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		SolidColorBrush^ nobj = (SolidColorBrush^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		double nVal = JSValueToNumber(ctx, value, NULL);

		if (nVal == 0)
			nobj->Color =  Colors::Red; 
		if (nVal == 1)
			nobj->Color =  Colors::Yellow; 
		if (nVal == 2)
			nobj->Color =  Colors::Green; 
		if (nVal == 3)
			nobj->Color =  Colors::Blue; 

		return true;
	}

	static JSValueRef GetColor(JSContextRef ctx, JSObjectRef thisObject,  JSStringRef propertyName, JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		SolidColorBrush^ nobj = (SolidColorBrush^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		
		return  JSValueMakeNumber(ctx, 0); //nobj->Color); 
	}

};

