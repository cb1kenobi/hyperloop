#pragma once
#include "Headers.h"

class PrivateObjectContainer
{
private:
	DependencyObject^ obj;
public:
	void set(DependencyObject^ obj) {
		this->obj = obj;
	}
	DependencyObject^ get() {
		return obj;
	}
};

JSClassRef textBlockClass;

class TestCreateTextBlock
{
public:

	static void run(String^ &out, JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition textBlockClassDefinition = kJSClassDefinitionEmpty;
		textBlockClass = JSClassCreate(&textBlockClassDefinition);
		textBlockClassDefinition.callAsConstructor = TextBlockConstructor;
		textBlockClassDefinition.finalize = TextBlockDestructor;
		JSObjectRef textBlock = JSObjectMakeConstructor(ctx, textBlockClass, TextBlockConstructor);

		// Add to its prototype...
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, textBlock), NULL);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
			valueProperty = JSStringCreateWithUTF8CString("TextBlock");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);

		// ... method: getText.
		JSStringRef getTextProperty = JSStringCreateWithUTF8CString("getText");
		JSValueRef getText = JSObjectMakeFunctionWithCallback(ctx, getTextProperty, TextBlockGetText);
		JSObjectSetProperty(ctx, prototype, getTextProperty, getText, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(getTextProperty);

		// ... method: setText.
		JSStringRef setTextProperty = JSStringCreateWithUTF8CString("setText");
		JSValueRef setText = JSObjectMakeFunctionWithCallback(ctx, setTextProperty, TextBlockSetText);
		JSObjectSetProperty(ctx, prototype, setTextProperty, setText, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(setTextProperty);

		// Set the prototype.
		JSObjectSetPrototype(ctx, textBlock, prototype);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("TextBlock");
		JSObjectSetProperty(ctx, global, className, textBlock, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Call Object.defineProperty.
		JSStringRef defineProperty = JSStringCreateWithUTF8CString("Object.defineProperty(TextBlock.prototype, 'text', { get: TextBlock.prototype.getText, set: TextBlock.prototype.setText });");
		JSEvaluateScript(ctx, defineProperty, JSContextGetGlobalObject(ctx), NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// TODO: Expose read-only "Window" object with property "Current", and sub-property "content" (which sets Window::Current->Content).
		// TODO: If we comment out "window->Content = text;" in Main.cpp, we should be able to see the TextBlock created below.

		JSStringRef string = JSStringCreateWithUTF8CString("var textBlock = new TextBlock();\ntextBlock.text = 'Hi!';\ntextBlock.text");
		JSValueRef result = JSEvaluateScript(ctx, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(ctx, result, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + Utils::getPlatformString(sValue);
		JSStringRelease(sValue);
		JSStringRelease(string);
	}

	static JSObjectRef TextBlockConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		poc->set(ref new TextBlock());
		return JSObjectMake(ctx, textBlockClass, poc);
	}

	static JSValueRef TextBlockSetText(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		// TODO: Validate args.
		void* raw = JSObjectGetPrivate(thisObject);
		TextBlock^ tb = (TextBlock^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSValueRef val = arguments[0];
		JSStringRef sVal = JSValueToStringCopy(ctx, val, NULL);
		tb->Text = Utils::getPlatformString(sVal);
		return val;
	}

	static JSValueRef TextBlockGetText(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		void* raw = JSObjectGetPrivate(thisObject);
		TextBlock^ tb = (TextBlock^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		JSStringRef text = Utils::getJSStringRef(tb->Text);
		JSValueRef val = JSValueMakeString(ctx, text);
		JSStringRelease(text);
		return val;
	}

	static void TextBlockDestructor(JSObjectRef object) {
	}

};

