/*
 * Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
 * 
 * (Note that this will not yet run on Windows Phone.)
 *
 * Russ + Dawsonish
 *
 */
#include <Windows.h>

#include <JavaScriptCore/JavaScript.h>
#include <Windows_UI_Xaml_Controls_Canvas.hpp>
#include <Windows_UI_Xaml_Media_SolidColorBrush.hpp>
#include <Windows_UI_Xaml_Window.hpp>

using namespace Windows::UI;
using namespace Windows::UI::Core;
using namespace Windows::UI::Input;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml::Input;
using namespace Windows::UI::Xaml::Controls;
using namespace Windows::UI::Xaml::Controls::Primitives;
using namespace Windows::Foundation;
using namespace Windows::ApplicationModel;
using namespace Windows::ApplicationModel::Activation;
using namespace Windows::Globalization;
using namespace Platform::Details;

//using namespace std;

ref class ManipulationHandler sealed
{
public:
	 ManipulationHandler();
	 void ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e);

private:
	float angle_;
	Point translation_;
};

ManipulationHandler::ManipulationHandler()
	: angle_(0.0), translation_(0.0, 0.0) {}

void ManipulationHandler::ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e)
{
    Canvas^ view = (Canvas^)e->OriginalSource;

	view->RenderTransformOrigin = Point(.5, .5);
	RotateTransform^ rotateTransform = ref new RotateTransform();
	//((ManipulationHandler^)sender)->angle_ +=  e->Delta.Rotation;
	angle_ +=  e->Delta.Rotation;
	rotateTransform->Angle = angle_;
	
	TranslateTransform^ translateTransform = ref new TranslateTransform();
	translation_.X += e->Delta.Translation.X;
	translation_.Y += e->Delta.Translation.Y;
	translateTransform->X = translation_.X;
	translateTransform->Y = translation_.Y;

	// Scale easier to set size properties directly
	view->Width += e->Delta.Expansion;
	view->Height += e->Delta.Expansion;

	TransformGroup^ transformGroup = ref new TransformGroup(); 
	transformGroup->Children->Append(rotateTransform);  
	transformGroup->Children->Append(translateTransform);
	view->RenderTransform = transformGroup;

	e->Handled = true;
}

ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
private:
	ManipulationHandler^ manipulationHandler1;
	ManipulationHandler^ manipulationHandler2;
	ManipulationHandler^ manipulationHandler3;

	JSContextRef context;
};

MyApp::MyApp()
{
	context = JSGlobalContextCreate(NULL);
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	JSObjectRef global = JSContextGetGlobalObject(context);

	// ToDo use AddRef on object to keep it around rather then add to App
	this->manipulationHandler1 = ref new ManipulationHandler();
	ManipulationDeltaEventHandler^ manipulationDelta1 = 
		ref new ManipulationDeltaEventHandler(manipulationHandler1, &ManipulationHandler::ManipulationDelta);

	this->manipulationHandler2 = ref new ManipulationHandler();
	ManipulationDeltaEventHandler^ manipulationDelta2 = 
		ref new ManipulationDeltaEventHandler(manipulationHandler2, &ManipulationHandler::ManipulationDelta);

	this->manipulationHandler3 = ref new ManipulationHandler();
	ManipulationDeltaEventHandler^ manipulationDelta3 = 
		ref new ManipulationDeltaEventHandler(manipulationHandler3, &ManipulationHandler::ManipulationDelta);

	/*
	Canvas^ view = ref new Canvas();
	Canvas::SetTop(view, 50);
	Canvas::SetLeft(view, 50);
	view->Width = 200;
	view->Height = 300;
	SolidColorBrush^ red = ref new SolidColorBrush();
	red->Color = Colors::Red;
	view->Background = red;
	view->ManipulationMode =  ManipulationModes::All;	
	view->ManipulationDelta::add(manipulationDelta1);
	canvas->Children->Append(view);

	Canvas^ view2 = ref new Canvas();
	Canvas::SetTop(view2, 50);
	Canvas::SetLeft(view2, 350);
	view2->Width = 200;
	view2->Height = 300;
	SolidColorBrush^ yellow = ref new SolidColorBrush();
	yellow->Color = Colors::Yellow;
	view2->Background = yellow;
	view2->ManipulationMode =  ManipulationModes::All;
	view2->ManipulationDelta::add(manipulationDelta2);
	canvas->Children->Append(view2);
	*/


	Windows_UI_Xaml_Controls_Canvas::create(context, global);
	Windows_UI_Xaml_Media_SolidColorBrush::create(context, global);
	Windows_UI_Xaml_Window::create(context, global);

	/* ToDo:
	   1) Need Windows Bounds
	   2) Need Canvas Children 
	   3) Need Event Handler
	   4) Activate should not need an arg
    */

	//Window^ window = Window::Current;
	// ...
	//canvas->Width = window->Bounds.Width;
	//canvas->Height = window->Bounds.Height;
	// ...
	//canvas->Children->Append(view);
	// ...
	//view->ManipulationMode =  ManipulationModes::All;
	//view->ManipulationDelta::add(manipulationDelta2);
	// ...
	///window->Activate();

	// Objects are available in runtime now use them	
	JSStringRef string = JSStringCreateWithUTF8CString(
											"var Colors = { Red : 0, Yellow : 1, Green : 2, Blue: 3 };\n"
											"var canvas = new Canvas();\n"
											"canvas.width = 1600;\n"
											"canvas.height = 900;\n"
											"var blue = new SolidColorBrush();\n"
											"blue.color = Colors.Blue;\n"
											"canvas.background = blue;\n"

											"var view = new Canvas();\n"
											"view.width = 200;\n"
											"view.height = 300;\n"
											"var red = new SolidColorBrush();\n"
											"red.color = Colors.Red;\n"
											"view.background = red;\n"
											"canvas.setTop(view, 50);\n"
											"canvas.setLeft(view, 50);\n"
											"canvas.append(view);\n"

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
											"window.activate(1);\n"
											 ); 
	JSValueRef result = JSEvaluateScript(context, string, global, NULL, 0, NULL);
	JSStringRef sValue = JSValueToStringCopy(context, result, NULL);
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