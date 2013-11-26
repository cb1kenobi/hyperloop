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
											"canvas.width = 1600;\n"
											"canvas.height = 900;\n"
											"var blue = new SolidColorBrush();\n"
											"blue.color = Colors.Blue;\n"
											"canvas.background = blue;\n"

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
											"view.width = 200;\n"
											"view.height = 300;\n"
											"var red = new SolidColorBrush();\n"
											"red.color = Colors.Red;\n"
											"view.background = red;\n"
											"canvas.setTop(view, 50);\n"
											"canvas.setLeft(view, 50);\n"
											"canvas.append(view);\n"
											"view.ManipulationMode = ManipulationModes.All;\n"
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
											"view2.ManipulationMode = ManipulationModes.All;\n"
											"view2.add(delta2);\n"

											"var view3 = new Canvas();\n"
											"view3.width = 200;\n"
											"view3.height = 300;\n"
											"var green = new SolidColorBrush();\n"
											"green.color = Colors.Green;\n"
											"view3.background = green;\n"
											"canvas.setTop(view3, 50);\n"
											"canvas.setLeft(view3, 650);\n"
											"canvas.append(view3);\n"
											"view3.ManipulationMode = ManipulationModes.All;\n"
											"view3.add(delta3);\n"

											"var window = new Window();\n"
											"window.content = canvas;\n"
											"window.activate();\n"

											"// ?? collides with  TranslateTransform.X - view.X = 0;\n"

											"function manipulationDelta(sender, e) {\n"
											"   var view = e.OriginalSource;\n"
											"   var _X = view._X || 0;\n"
											"   var _Y = view._Y || 0;\n"
											"   var _Angle = view._Angle || 0;\n"
											"   view.width += e.expansion;\n"
											"   view.height += e.expansion;\n"
											"   var translateTransform = new TranslateTransform();\n"
											"   _X += e._X;\n"
											"   _Y += e._Y;\n"
											"   translateTransform.X = _X;\n"
											"   translateTransform.Y = _Y;\n"
											"   view._X = _X;\n"
											"   view._Y = _Y;\n"
											"   var rotateTransform = new RotateTransform();\n"
											"   _Angle += e._Angle;\n"
                                            "   rotateTransform.Angle = _Angle;\n"
											"   view._Angle = _Angle;\n"
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