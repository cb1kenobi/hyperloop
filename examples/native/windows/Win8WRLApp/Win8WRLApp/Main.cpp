/*
* Simple Windows Store (Metro) C++/CX app that runs on ARM and x86 Windows. 
* 
* Will not run on Windows Phone.
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

ref class App sealed : public ::Application
{
public:
	App();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
	virtual void App::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e);
private:
	TextBlock^ text;
	Grid^ grid;
};

App::App()
{
}

void App::OnLaunched(LaunchActivatedEventArgs^ args)
{
	auto window = Window::Current;

	this->grid = ref new Grid();
	auto red = ref new SolidColorBrush();
	red->Color = Colors::Red;
	grid->Background = red;

	this->text = ref new TextBlock();
	text->Text = "Tap me to find out\nwhat time it is!";
	text->TextAlignment = TextAlignment::Center;
	text->VerticalAlignment = VerticalAlignment::Center;
	text->HorizontalAlignment = HorizontalAlignment::Center;
	text->FontSize = 60;
	grid->Children->Append(text);

	grid->Tapped += ref new TappedEventHandler(this, &App::PointerPressed);

	window->Content = grid;

	window->Activate();
}

void App::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e)
{
	auto green = ref new SolidColorBrush();
	green->Color = Colors::DarkGreen;
	grid->Background = green;

	auto cal = ref new Calendar();
	this->text->FontSize = 180;
	this->text->Text = cal->HourAsPaddedString(2)
		+ ":" + cal->MinuteAsPaddedString(2)
		+ ":" + cal->SecondAsPaddedString(2);
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		auto app = ref new App();
	}));

	return 0;
}