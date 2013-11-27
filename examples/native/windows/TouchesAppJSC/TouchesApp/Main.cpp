/*
 * Simple app to demonstrate native control hookup using JavaScript. 
 *
 * Russ + Dawson
 *
 */
//#include <Windows.h>

#include <JavaScriptCore/JavaScript.h>
#include <Windows_UI_Xaml_Controls_Canvas.hpp>
#include <Windows_UI_Xaml_Media_SolidColorBrush.hpp>
#include <Windows_UI_Xaml_Window.hpp>
#include <ManipulationHandler.hpp>
#include <Windows_UI_Xaml_Input_ManipulationDeltaEventHandler.hpp>
#include <Windows_UI_Xaml_Media_TranslateTransform.hpp>
#include <Windows_UI_Xaml_Media_TransformGroup.hpp>
#include <Windows_UI_Xaml_Media_RotateTransform.hpp>

ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;

private:
};

MyApp::MyApp()
{
	Utils::setAppContext(JSGlobalContextCreate(NULL));
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	JSContextRef ctx = Utils::getAppContext();
	JSObjectRef global = JSContextGetGlobalObject(ctx);
	Windows_UI_Xaml_Controls_Canvas::create(ctx, global);
	Windows_UI_Xaml_Media_SolidColorBrush::create(ctx, global);
	Windows_UI_Xaml_Window::create(ctx, global);
	ManipulationHandler::create(ctx, global);
	Windows_UI_Xaml_Input_ManipulationDeltaEventHandler::create(ctx, global);
	Windows_UI_Xaml_Media_TranslateTransform::create(ctx, global);
	Windows_UI_Xaml_Media_TransformGroup::create(ctx, global);
	Windows_UI_Xaml_Media_RotateTransform::create(ctx, global);

	// Objects are available in runtime now use them	
	JSStringRef string = JSStringCreateWithUTF8CString(
											"var Colors = { Red : 0, Yellow : 1, Green : 2, Blue: 3 };\n"
											"var ManipulationModes = { All : 0 };\n"

											"var canvas = new Canvas();\n"
											"canvas.Width = 1600;\n"
											"canvas.Height = 900;\n"
											"var blue = new SolidColorBrush();\n"
											"blue.Color = Colors.Blue;\n"
											"canvas.Background = blue;\n"

											"var handler = new ManipulationHandler();\n"
											"var delta = new ManipulationDeltaEventHandler(handler,\n"
											"                                       manipulationDelta);\n"	
											"var handler2 = new ManipulationHandler();\n"
											"var delta2 = new ManipulationDeltaEventHandler(handler2,\n"
											"                                       manipulationDelta);\n"	
											"var handler3 = new ManipulationHandler();\n"
											"var delta3 = new ManipulationDeltaEventHandler(handler3,\n"
											"                                       manipulationDelta);\n"	

											"var view = new Canvas();\n"
											"view.Width = 200;\n"
											"view.Height = 300;\n"
											"var red = new SolidColorBrush();\n"
											"red.Color = Colors.Red;\n"
											"view.Background = red;\n"
											"canvas.SetTop(view, 50);\n"
											"canvas.SetLeft(view, 50);\n"
											"canvas.Append(view);\n"
											"view.ManipulationMode = ManipulationModes.All;\n"
											"view.add(delta);\n"

											"var view2 = new Canvas();\n"
											"view2.Width = 200;\n"
											"view2.Height = 300;\n"
											"var yellow = new SolidColorBrush();\n"
											"yellow.Color = Colors.Yellow;\n"
											"view2.Background = yellow;\n"
											"canvas.SetTop(view2, 50);\n"
											"canvas.SetLeft(view2, 350);\n"
											"canvas.Append(view2);\n"
											"view2.ManipulationMode = ManipulationModes.All;\n"
											"view2.add(delta2);\n"

											"var view3 = new Canvas();\n"
											"view3.Width = 200;\n"
											"view3.Height = 300;\n"
											"var green = new SolidColorBrush();\n"
											"green.Color = Colors.Green;\n"
											"view3.Background = green;\n"
											"canvas.SetTop(view3, 50);\n"
											"canvas.SetLeft(view3, 650);\n"
											"canvas.Append(view3);\n"
											"view3.ManipulationMode = ManipulationModes.All;\n"
											"view3.add(delta3);\n"

											"var window = new Window();\n"
											"window.Content = canvas;\n"
											"window.Activate();\n"

											"function manipulationDelta(sender, e) {\n"
											"   var view = e.OriginalSource;\n"
											"   var X = view.X || 0;\n"
											"   var Y = view.Y || 0;\n"
											"   var Angle = view.Angle || 0;\n"
											"   view.Width += e.Expansion;\n"
											"   view.Height += e.Expansion;\n"
											"   var translateTransform = new TranslateTransform();\n"
											"   X += e.X;\n"
											"   Y += e.Y;\n"
											"   translateTransform.X = X;\n"
											"   translateTransform.Y = Y;\n"
											"   view.X = X;\n"
											"   view.Y = Y;\n"
											"   var rotateTransform = new RotateTransform();\n"
											"   Angle += e.Angle;\n"
                                            "   rotateTransform.Angle = Angle;\n"
											"   view.Angle = Angle;\n"
											"   var transformGroup = new TransformGroup();\n"
											"   transformGroup.Append(rotateTransform);\n"
											"   transformGroup.Append(translateTransform);\n"										
											"   view.RenderTransform = transformGroup;\n"
											"}\n"
											 ); 
	JSValueRef result = JSEvaluateScript(ctx, string, global, NULL, 0, NULL);
	JSStringRef sValue = JSValueToStringCopy(ctx, result, NULL);
	JSStringRelease(sValue);
	JSStringRelease(string);
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}