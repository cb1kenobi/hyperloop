#pragma once
#include "Headers.h"
#include "ManipulationHandler.hpp"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;

class Windows_UI_Xaml_Controls_Canvas
{
public:

	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Setup its prototype...
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("Canvas");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
			valueProperty = JSStringCreateWithUTF8CString("Canvas");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);
		
		// ... property: getWidth.
		JSStringRef getWidthProperty = JSStringCreateWithUTF8CString("getWidth");
		JSValueRef getWidth = JSObjectMakeFunctionWithCallback(ctx, getWidthProperty, GetWidth);
		JSObjectSetProperty(ctx, prototype, getWidthProperty, getWidth, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getWidthProperty);

		// ... property: setWidth.
		JSStringRef setWidthProperty = JSStringCreateWithUTF8CString("setWidth");
		JSValueRef setWidth = JSObjectMakeFunctionWithCallback(ctx, setWidthProperty, SetWidth);
		JSObjectSetProperty(ctx, prototype, setWidthProperty, setWidth, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setWidthProperty);

		// ... property: getHeight.
		JSStringRef getHeightProperty = JSStringCreateWithUTF8CString("getHeight");
		JSValueRef getHeight = JSObjectMakeFunctionWithCallback(ctx, getHeightProperty, GetHeight);
		JSObjectSetProperty(ctx, prototype, getHeightProperty, getHeight, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getHeightProperty);

		// ... property: setHeight.
		JSStringRef setHeightProperty = JSStringCreateWithUTF8CString("setHeight");
		JSValueRef setHeight = JSObjectMakeFunctionWithCallback(ctx, setHeightProperty, SetHeight);
		JSObjectSetProperty(ctx, prototype, setHeightProperty, setHeight, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setHeightProperty);
	
		// ... property: setBackground.
		JSStringRef setBackgroundProperty = JSStringCreateWithUTF8CString("setBackground");
		JSValueRef setBackground = JSObjectMakeFunctionWithCallback(ctx, setBackgroundProperty, SetBackground);
		JSObjectSetProperty(ctx, prototype, setBackgroundProperty, setBackground, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setBackgroundProperty);	
		
		// ... property: setRenderTransform.
		JSStringRef setRenderTransformProperty = JSStringCreateWithUTF8CString("setRenderTransform");
		JSValueRef setRenderTransform = JSObjectMakeFunctionWithCallback(ctx, setRenderTransformProperty, SetRenderTransform);
		JSObjectSetProperty(ctx, prototype, setRenderTransformProperty, setRenderTransform, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setRenderTransformProperty);	

		// ... property: setManipulationMode.
		JSStringRef setManipulationModeProperty = JSStringCreateWithUTF8CString("setManipulationMode");
		JSValueRef setManipulationMode = JSObjectMakeFunctionWithCallback(ctx, setManipulationModeProperty, SetManipulationMode);
		JSObjectSetProperty(ctx, prototype, setManipulationModeProperty, setManipulationMode, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setManipulationModeProperty);	


		// ... property: setTop.
		JSStringRef setTopMethod = JSStringCreateWithUTF8CString("setTop");
		JSValueRef setTop = JSObjectMakeFunctionWithCallback(ctx, setTopMethod, SetTop);
		JSObjectSetProperty(ctx, prototype, setTopMethod, setTop, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setTopMethod);

		// ... property: setLeft.
		JSStringRef setLeftMethod = JSStringCreateWithUTF8CString("setLeft");
		JSValueRef setLeft = JSObjectMakeFunctionWithCallback(ctx, setLeftMethod, SetLeft);
		JSObjectSetProperty(ctx, prototype, setLeftMethod, setLeft, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setLeftMethod);	

		// ... method: append.
		JSStringRef appendMethod = JSStringCreateWithUTF8CString("append");
		JSValueRef append = JSObjectMakeFunctionWithCallback(ctx, appendMethod, Append);
		JSObjectSetProperty(ctx, prototype, appendMethod, append, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(appendMethod);	

		// ... method: add.
		JSStringRef addMethod = JSStringCreateWithUTF8CString("add");
		JSValueRef addref = JSObjectMakeFunctionWithCallback(ctx, addMethod, add);
		JSObjectSetProperty(ctx, prototype, addMethod, addref, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(addMethod);		

		// Call Object.defineProperty for Width property.		
		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'width', { get: Canvas.prototype.getWidth, set: Canvas.prototype.setWidth });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);	

		// Call Object.defineProperty for Height property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'height', { get: Canvas.prototype.getHeight, set: Canvas.prototype.setHeight });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Call Object.defineProperty for Background property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'background', { set:Canvas.prototype.setBackground });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Call Object.defineProperty for RenderTransform property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'RenderTransform', { set:Canvas.prototype.setRenderTransform });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Call Object.defineProperty for RenderTransform property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'ManipulationMode', { set:Canvas.prototype.setManipulationMode });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Call Object.defineProperty for RenderTransform property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'ManipulationMode', { set:Canvas.prototype.setManipulationMode });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		Canvas^ obj = ref new Canvas();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(obj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static JSValueRef SetWidth(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);
		nobj->Width =  nVal;
		return val;
	}

	static JSValueRef GetWidth(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Width); 
	}

	static JSValueRef SetHeight(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		double nVal = JSValueToNumber(ctx, val, NULL);
		nobj->Height =  nVal;
		return val;
	}

	static JSValueRef GetHeight(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return  JSValueMakeNumber(ctx, nobj->Height); 
	}

	static JSValueRef SetBackground(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
		nobj->Background =  (SolidColorBrush^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		return val;
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

	static JSValueRef SetRenderTransform(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {	
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();		
		JSValueRef val = arguments[0];
		JSObjectRef objRef = JSValueToObject(ctx, val, NULL);
		raw = JSObjectGetPrivate(objRef);
        TransformGroup^ nobj2 = (TransformGroup^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
	    nobj->RenderTransform = nobj2;
		return JSValueMakeUndefined(ctx);
	}

	static JSValueRef SetManipulationMode(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {	
		void* raw = JSObjectGetPrivate(thisObject);
		Canvas^ nobj = (Canvas^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();		
		JSValueRef val = arguments[0];

		double nVal = JSValueToNumber(ctx, val, NULL);

		if (nVal == 0)
			nobj->ManipulationMode =  ManipulationModes::All;
		
		return JSValueMakeUndefined(ctx);
	}
};

