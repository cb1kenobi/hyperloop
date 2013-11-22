/*
 * Simple app to demonstrate native control hookup using JavaScript. 
 *
 * Russ + Dawson
 *
 */
#include <Windows.h>

#include <JavaScriptCore/JavaScript.h>
#include <Windows_UI_Xaml_Controls_Canvas.hpp>
#include <Windows_UI_Xaml_Media_SolidColorBrush.hpp>
#include <Windows_UI_Xaml_Window.hpp>
#include <ManipulationHandler.hpp>
#include <Windows_UI_Xaml_Input_ManipulationDeltaEventHandler.hpp>

ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;

private:
	const JSContextRef context;
	const JSObjectRef global;
};

MyApp::MyApp() : context(JSGlobalContextCreate(NULL)), global(JSContextGetGlobalObject(context))
{
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	Windows_UI_Xaml_Controls_Canvas::create(context, global);
	Windows_UI_Xaml_Media_SolidColorBrush::create(context, global);
	Windows_UI_Xaml_Window::create(context, global);
	ManipulationHandler::create(context, global);
	Windows_UI_Xaml_Input_ManipulationDeltaEventHandler::create(context, global);

	/* ToDo:
	   1) Need singleton objects so new is not done on them
			a) Windows Bounds
			b) Need Canvas Children 
			c) Need Canvas ManipulationDelta object
	   2) JS api names match MS names fo caps see Dawsons Sample for example width should be Width
	   3) For JS defined handlers prepended UID?
	   4) Create MyApp from gen code and do load of app.js from file
	   5) Ensure no memory leaks
	   6) Cleanup include and using files
	   7) Figure how to set public non winrt types in handlers 
	*/

	// Objects are available in runtime now use them	
	JSStringRef string = JSStringCreateWithUTF8CString(
											"var Colors = { Red : 0, Yellow : 1, Green : 2, Blue: 3 };\n"
											"var ManipulationModes = { All : 0 };\n"

											"var canvas = new Canvas();\n"
											"canvas.width = 1600;\n"
											"canvas.height = 900;\n"
											"var blue = new SolidColorBrush();\n"
											"blue.color = Colors.Blue;\n"
											"canvas.background = blue;\n"

											"var handler = new ManipulationHandler();\n"
											"var delta = new ManipulationDeltaEventHandler(handler,\n"
											"                                       manipulationDelta);\n"	

											"var view = new Canvas();\n"
											"view.width = 200;\n"
											"view.height = 300;\n"
											"var red = new SolidColorBrush();\n"
											"red.color = Colors.Red;\n"
											"view.background = red;\n"
											"canvas.setTop(view, 50);\n"
											"canvas.setLeft(view, 50);\n"
											"canvas.append(view);\n"
											"//view.ManipulationMode = ManipulationModes.All;\n"
											"view.add(delta);\n"

											"var view2 = new Canvas();\n"
											"view2.width = 200;\n"
											"view2.height = 300;\n"
											"var yellow = new SolidColorBrush();\n"
											"yellow.color = Colors.Yellow;\n"
											"view2.background = yellow;\n"
											"canvas.setTop(view2, 50);\n"
											"canvas.setLeft(view2, 350);\n"
											"canvas.append(view2);\n"

											"var view3 = new Canvas();\n"
											"view3.width = 200;\n"
											"view3.height = 300;\n"
											"var green = new SolidColorBrush();\n"
											"green.color = Colors.Green;\n"
											"view3.background = green;\n"
											"canvas.setTop(view3, 50);\n"
											"canvas.setLeft(view3, 650);\n"
											"canvas.append(view3);\n"

											"var window = new Window();\n"
											"window.content = canvas;\n"
											"window.activate();\n"

											"function manipulationDelta(sender, e) {\n"
											"   new Window();\n"
											"	//var rotateTransform = new RotateTransform();\n"
											"	//var view = e.OriginalSource;\n"
											"   //var angle = e.Rotation;\n"
											"}\n"
											 ); 
	JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
	JSStringRelease(sValue);
	JSStringRelease(string);
	JSObjectRef global = JSContextGetGlobalObject(context);
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}