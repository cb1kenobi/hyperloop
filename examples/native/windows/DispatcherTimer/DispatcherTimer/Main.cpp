/*
 * Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
 * 
 * (Note that this will not yet run on Windows Phone.)
 *
 *
 */
#include <Windows.h>


using namespace Windows::UI;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml::Controls;
using namespace Windows::UI::Xaml::Controls::Primitives;
using namespace Windows::Foundation;
using namespace Windows::ApplicationModel;
using namespace Windows::ApplicationModel::Activation;

ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;	
	void DispatcherTimer_Tick(Platform::Object^ sender, Platform::Object^ e);
};

MyApp::MyApp(){}

void MyApp::DispatcherTimer_Tick(Platform::Object^ sender, Platform::Object^ e)
{
   // Do your timer callback stuff here. Dispatcher run on UI thread so safe to update the UI...
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
	window->Content = canvas;

	DispatcherTimer^ timer = ref new DispatcherTimer;
    timer->Tick += ref new Windows::Foundation::EventHandler<Object^>(this, &MyApp::DispatcherTimer_Tick);
    TimeSpan t;
    t.Duration=1000;
    timer->Interval = t;
    timer->Start();

	window->Activate();
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}