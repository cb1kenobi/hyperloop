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
	void clean() {
		obj = nullptr;
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
		JSEvaluateScript(ctx, defineProperty, global, NULL, 0, NULL);
		JSStringRelease(defineProperty);

		// Add a global "Window { Current: { Content: get; set; } }" object.
		JSStringRef sWindow = JSStringCreateWithUTF8CString("Window"),
			sCurrent = JSStringCreateWithUTF8CString("Current"),
			sContent = JSStringCreateWithUTF8CString("Content");
		JSClassDefinition currentDefinition = kJSClassDefinitionEmpty;
		JSStaticValue currentValues[] = {
			{ "Content", 0, SetCurrentContent, kJSPropertyAttributeNone },
			{ 0, 0, 0, 0 }
		};
		currentDefinition.staticValues = currentValues;
		JSClassRef windowClass = JSClassCreate(&kJSClassDefinitionEmpty),
			currentClass = JSClassCreate(&currentDefinition);
		JSObjectRef window = JSObjectMake(ctx, windowClass, NULL),
			current = JSObjectMake(ctx, currentClass, NULL);
		JSObjectSetProperty(ctx, window, sCurrent, current, kJSPropertyAttributeNone, NULL);
		JSObjectSetProperty(ctx, global, sWindow, window, kJSPropertyAttributeNone, NULL);
		JSStringRelease(sWindow);
		JSStringRelease(sCurrent);
		JSStringRelease(sContent);

		JSStringRef string = JSStringCreateWithUTF8CString("var textBlock = new TextBlock();\ntextBlock.text = 'Hello, world!';\nWindow.Current.Content = textBlock;");
		JSValueRef result = JSEvaluateScript(ctx, string, global, NULL, 0, NULL);
		JSStringRef sValue = JSValueToStringCopy(ctx, result, NULL);
		out += "\n" + Utils::getPlatformString(string) + " = " + Utils::getPlatformString(sValue);
		JSStringRelease(sValue);
		JSStringRelease(string);
	}

	static JSObjectRef TextBlockConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		TextBlock^ text = ref new TextBlock();
		text->TextAlignment = TextAlignment::Center;
		text->VerticalAlignment = VerticalAlignment::Center;
		text->HorizontalAlignment = HorizontalAlignment::Center;
		text->FontSize = 36;
		poc->set(text);
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
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}

	static bool SetCurrentContent(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef value, JSValueRef* exception) {
		// TODO: Validate args.
		JSObjectRef obj = JSValueToObject(ctx, value, NULL);
		void* raw = JSObjectGetPrivate(obj);
		UIElement^ ui = (UIElement^)reinterpret_cast<PrivateObjectContainer*>(raw)->get();
		Window::Current->Content = ui;
		return true;
	}

};

