/*
 * Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
 * 
 * (Note that this will not yet run on Windows Phone.)
 *
 * Russ + Dawsonish
 *
 */
using namespace Platform;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Controls;
using namespace Windows::ApplicationModel::Activation;

#include <string>
#include <JavaScriptCore/JavaScript.h>

/*
 * Our app shows a TextBlock to the user.
 */
ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
private:
	JSContextRef context;
};

MyApp::MyApp()
{
	context = JSGlobalContextCreate(NULL);
}

static Platform::String^ convertJSString(JSStringRef sValue)
{
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
    JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring wid_str = std::wstring(s_str.begin(), s_str.end());
	return ref new Platform::String(wid_str.c_str());
}

static JSValueRef TextBlockGetProperty(JSContextRef ctx, JSObjectRef object, JSStringRef propertyNameJS, JSValueRef* exception)
{
	return JSValueMakeUndefined(ctx);
}

static JSObjectRef TextBlockConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
	return constructor;
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	String^ out = "Results:";
	JSObjectRef global = JSContextGetGlobalObject(context);
	JSStringRef string;
	JSValueRef result;
	JSStringRef params;
	JSStringRef className;

	// To String.
	string = JSStringCreateWithUTF8CString("'Hello, world!'");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
	out += "\n" + convertJSString(string) + " = " + convertJSString(sValue);
	JSStringRelease(sValue);
	JSStringRelease(string);

	// To Boolean.
	string = JSStringCreateWithUTF8CString("Superman >= Batman");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	out += "\n" + convertJSString(string) + " = " + JSValueToBoolean(context, result);
	JSStringRelease(string);

	// To Number.
	string = JSStringCreateWithUTF8CString("2 + 2");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	out += "\n" + convertJSString(string) + " = " + JSValueToNumber(context, result, NULL);
	JSStringRelease(string);

	// To Object.
	string = JSStringCreateWithUTF8CString("{ \"eat\": \"cheese\" }");
	JSValueRef oValue = JSValueMakeFromJSONString(context, string);
	JSStringRef soValue = JSValueCreateJSONString(context, oValue, 4, NULL);
	out += "\n" + convertJSString(string) + " = " + convertJSString(soValue);
	JSStringRelease(soValue);
	JSStringRelease(string);

	// Create & Call Function.
	string = JSStringCreateWithUTF8CString("return text;");
	params = JSStringCreateWithUTF8CString("text");
	JSValueRef arguments[] = { JSValueMakeNumber(context, 1337) };
	JSObjectRef print = JSObjectMakeFunction(context, NULL, 1, &params, string, NULL, 1, NULL);
	result = JSObjectCallAsFunction(context, print, global, 1, arguments, NULL);
	out += "\n func " + convertJSString(string) + " = " + JSValueToNumber(context, result, NULL);
	JSStringRelease(params);
	JSStringRelease(string);
	
	// Create an Object.
	JSClassDefinition myClassDefinition = kJSClassDefinitionEmpty;
	JSClassRef myClass = JSClassCreate(&myClassDefinition);
	JSObjectRef myObject = JSObjectMake(context, myClass, NULL);
	JSStringRef nameProperty = JSStringCreateWithUTF8CString("color"),
		valueProperty = JSStringCreateWithUTF8CString("bright red"),
		classProperty = JSStringCreateWithUTF8CString("marker");
	JSValueRef valueRef = JSValueMakeString(context, valueProperty);
	JSObjectSetProperty(context, myObject, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
	JSObjectSetProperty(context, global, classProperty, myObject, kJSPropertyAttributeNone, NULL);
	JSStringRelease(nameProperty);
	JSStringRelease(valueProperty);
	JSStringRelease(classProperty);
	string = JSStringCreateWithUTF8CString("marker.color");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	sValue = JSValueToStringCopy(context, result, NULL);
	out += "\n" + convertJSString(string) + " = " + convertJSString(sValue);
	JSStringRelease(string);
	JSClassRelease(myClass);

	// Create a Class.
	string = JSStringCreateWithUTF8CString("this.name = name;");
	className = JSStringCreateWithUTF8CString("Tree");
	params = JSStringCreateWithUTF8CString("name");
	JSObjectRef tree = JSObjectMakeFunction(context, className, 1, &params, string, NULL, 1, NULL);
	JSObjectSetProperty(context, global, className, tree, kJSPropertyAttributeNone, NULL);
	JSStringRelease(className);
	JSStringRelease(params);
	string = JSStringCreateWithUTF8CString("var tree = new Tree('Redwood');\ntree.name");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	sValue = JSValueToStringCopy(context, result, NULL);
	out += "\n" + convertJSString(string) + " = " + convertJSString(sValue);
	JSStringRelease(string);
	string = JSStringCreateWithUTF8CString("var tree = new Tree('Aspen');\ntree.constructor");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	sValue = JSValueToStringCopy(context, result, NULL);
	out += "\n" + convertJSString(string) + " = " + convertJSString(sValue);
	JSStringRelease(string);

	// Create a Text Block.
	JSClassDefinition textBlockClassDefinition = kJSClassDefinitionEmpty;
	JSClassRef textBlockClass = JSClassCreate(&textBlockClassDefinition);
	JSObjectRef textBlockConstructor = JSObjectMakeConstructor(context, textBlockClass, TextBlockConstructor);
	// TODO: should create an underlying TextBlock.
	className = JSStringCreateWithUTF8CString("TextBlock");
	JSObjectSetProperty(context, global, className, textBlockConstructor, kJSPropertyAttributeNone, NULL);
	// TODO: Allow writing "text" property -- pass through to underlying.
	// TODO: Allow reading "text" property -- pass through to underlying.
	// TODO: Expose read-only "Window" object with property "Current", and sub-property "content" (which sets Window::Current->Content).
	string = JSStringCreateWithUTF8CString("var textBlock = new TextBlock();\
											textBlock.text = 'Hello, world!';\
											Window.Current.content = textBlock;");
	result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	JSStringRelease(string);
	// TODO: If we comment out "window->Content = text;" below, we should be able to see TextBlock created above.

	// Show the results.
	TextBlock^ text = ref new TextBlock();
	text->Text = out;
	text->TextAlignment = TextAlignment::Center;
	text->VerticalAlignment = VerticalAlignment::Center;
	text->HorizontalAlignment = HorizontalAlignment::Center;
	text->FontSize = 36;
	
	Window^ window = Window::Current;
	window->Content = text;
	window->Activate();
}

/*
 * Our standard entry point.
 */
int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}