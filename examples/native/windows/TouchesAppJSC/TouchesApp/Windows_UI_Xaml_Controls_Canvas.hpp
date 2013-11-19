#pragma once
#include "Headers.h"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;

Canvas^ obj;

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
		
		// ... method: getWidth.
		JSStringRef getWidthProperty = JSStringCreateWithUTF8CString("getWidth");
		JSValueRef getWidth = JSObjectMakeFunctionWithCallback(ctx, getWidthProperty, GetWidth);
		JSObjectSetProperty(ctx, prototype, getWidthProperty, getWidth, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getWidthProperty);

		// ... method: setWidth.
		JSStringRef setWidthProperty = JSStringCreateWithUTF8CString("setWidth");
		JSValueRef setWidth = JSObjectMakeFunctionWithCallback(ctx, setWidthProperty, SetWidth);
		JSObjectSetProperty(ctx, prototype, setWidthProperty, setWidth, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setWidthProperty);

		// ... method: setHeight.
		JSStringRef setHeightProperty = JSStringCreateWithUTF8CString("setHeight");
		JSValueRef setHeight = JSObjectMakeFunctionWithCallback(ctx, setHeightProperty, SetHeight);
		JSObjectSetProperty(ctx, prototype, setHeightProperty, setHeight, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setHeightProperty);
	
		// ... method: setBackground.
		JSStringRef setBackgroundProperty = JSStringCreateWithUTF8CString("setBackground");
		JSValueRef setBackground = JSObjectMakeFunctionWithCallback(ctx, setBackgroundProperty, SetBackground);
		JSObjectSetProperty(ctx, prototype, setBackgroundProperty, setBackground, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setBackgroundProperty);	

		// ... method: setTop.
		JSStringRef setTopMethod = JSStringCreateWithUTF8CString("setTop");
		JSValueRef setTop = JSObjectMakeFunctionWithCallback(ctx, setTopMethod, SetTop);
		JSObjectSetProperty(ctx, prototype, setTopMethod, setTop, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setTopMethod);

		// ... method: setLeft.
		JSStringRef setLeftMethod = JSStringCreateWithUTF8CString("setLeft");
		JSValueRef setLeft = JSObjectMakeFunctionWithCallback(ctx, setLeftMethod, SetLeft);
		JSObjectSetProperty(ctx, prototype, setLeftMethod, setLeft, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setLeftMethod);	

		// ... method: append.
		JSStringRef appendMethod = JSStringCreateWithUTF8CString("append");
		JSValueRef append = JSObjectMakeFunctionWithCallback(ctx, appendMethod, Append);
		JSObjectSetProperty(ctx, prototype, appendMethod, append, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(appendMethod);		

		// Call Object.defineProperty for Width property.		
		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'width', { get: Canvas.prototype.getWidth, set: Canvas.prototype.setWidth });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);	

		// Call Object.defineProperty for Height property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'height', { set: Canvas.prototype.setHeight });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Call Object.defineProperty for Background property.		
		defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(Canvas.prototype, 'background', { set:Canvas.prototype.setBackground });");
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		obj = ref new Canvas();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(obj);
		return JSObjectMake(ctx, classDef, poc);
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

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static bool SetCurrentContent(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef value, JSValueRef* exception) {
		JSObjectRef obj = JSValueToObject(ctx, value, NULL);
		void* raw = JSObjectGetPrivate(obj);
		UIElement^ ui = (UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		Window::Current->Content = ui;
		return true;
	}

};

