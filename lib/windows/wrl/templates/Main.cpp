/*
 * Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
 * 
 * (Note that this will not yet run on Windows Phone.)
 *
 * Russ + Dawsonish
 *
 */
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

#include <JavaScriptCore/JavaScript.h>

/*
 * When tapped, color the Grid, and update the TextBlock to show the current time.
 */
ref class TapHandler sealed
{
internal:
	TapHandler(JSContextRef ctx, TextBlock^ text, Grid^ grid);
	void TapHandler::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e);
private:
	TextBlock^ text;
	Grid^ grid;
	JSContextRef ctx;
};
TapHandler::TapHandler(JSContextRef ctx, TextBlock^ text, Grid^ grid)
{
	this->ctx = ctx;
	this->text = text;
	this->grid = grid;
}
void TapHandler::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e)
{
	SolidColorBrush^ green = ref new SolidColorBrush();
	green->Color = Colors::DarkGreen;
	grid->Background = green;
	this->text->FontSize = 180;

	JSObjectRef global = JSContextGetGlobalObject(this->ctx);
	JSStringRef string = JSStringCreateWithUTF8CString("2 + 2");
	JSValueRef result = JSEvaluateScript(this->ctx,string,global,NULL,0,NULL);
	double value = JSValueToNumber(this->ctx,result,NULL);

	this->text->Text = value.ToString();
}

/*
 * Our app shows a TextBlock to the user.
 */
ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
private:
	TapHandler^ tapHandler;
	JSContextRef context;
};

MyApp::MyApp()
{
	context = JSGlobalContextCreate(NULL);
}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	Window^ window = Window::Current;

	Grid^ grid = ref new Grid();
	SolidColorBrush^ red = ref new SolidColorBrush();
	red->Color = Colors::Red;
	grid->Background = red;

	TextBlock^ text = ref new TextBlock();
	text->Text = "Tap me to find out\nwhat 2+2 is!";
	text->TextAlignment = TextAlignment::Center;
	text->VerticalAlignment = VerticalAlignment::Center;
	text->HorizontalAlignment = HorizontalAlignment::Center;
	text->FontSize = 60;
	grid->Children->Append(text);

	// Tap handler needs to be an instance variable, or it will go out of scope
	// and be released (or collected? not sure what word to use here). This
	// means that delegates are not strong references.
	this->tapHandler = ref new TapHandler(this->context, text, grid);
	TappedEventHandler^ tapped = ref new TappedEventHandler(tapHandler, &TapHandler::PointerPressed);
	grid->Tapped::add(tapped);

	window->Content = grid;

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