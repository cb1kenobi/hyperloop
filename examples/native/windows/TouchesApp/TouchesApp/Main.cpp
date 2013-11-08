/*
 * Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
 * 
 * (Note that this will not yet run on Windows Phone.)
 *
 * Russ + Dawsonish
 *
 */
#include <Windows.h>

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

ref class ManipulationHandler sealed
{
public:
	 ManipulationHandler();
	 void ManipulationHandler::ManipulationStarted(Object^ sender, ManipulationStartedRoutedEventArgs^ e);
	 void ManipulationHandler::ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e);
	 void ManipulationHandler::ManipulationCompleted(Object^ sender, ManipulationCompletedRoutedEventArgs^ e);

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
};

MyApp::MyApp()
{
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	Window^ window = Window::Current;

	Canvas^ canvas = ref new Canvas();
	SolidColorBrush^ blue = ref new SolidColorBrush();
	blue->Color = Colors::Blue;
	canvas->Background = blue;
	canvas->Width = window->Bounds.Width;
	canvas->Height = window->Bounds.Height;

	// ToDo use AddRef on object to keep it around rather then add to App
	this->manipulationHandler1 = ref new ManipulationHandler();
	ManipulationDeltaEventHandler^ manipulationDelta1 = 
		ref new ManipulationDeltaEventHandler(manipulationHandler1, &ManipulationHandler::ManipulationDelta);

	this->manipulationHandler2 = ref new ManipulationHandler();
	ManipulationDeltaEventHandler^ manipulationDelta2 = 
		ref new ManipulationDeltaEventHandler(manipulationHandler2, &ManipulationHandler::ManipulationDelta);

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

	window->Content = canvas;
	window->Activate();
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}