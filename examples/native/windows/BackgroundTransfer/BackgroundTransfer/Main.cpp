/*
 * Performs an asynchronous GET request to openweathermap.org.
 */
#include <Windows.h>
#include <ppltasks.h>
using namespace concurrency;
using namespace Platform;
using namespace Windows::Web::Http;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Controls;
using namespace Windows::Foundation;
using namespace Windows::ApplicationModel::Activation;

ref class MyApp sealed : public ::Application
{
public:
	MyApp();
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
};

MyApp::MyApp(){}

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	Window^ window = Window::Current;
	auto tb = ref new TextBlock();
	tb->Text = "Downloading, please wait...";
	tb->FontSize = 40;
	tb->TextWrapping = TextWrapping::Wrap;
	tb->VerticalAlignment = VerticalAlignment::Center;
	tb->HorizontalAlignment = HorizontalAlignment::Center;
	window->Content = tb;
	window->Activate();

	auto uri = ref new Uri("http://api.openweathermap.org/data/2.5/weather?lat=37.389587&lon=-122.05037");
	auto client = ref new HttpClient();
	auto getString = client->GetStringAsync(uri);
	create_task(getString).then([tb](String^ result) {
		tb->Text = result;
	});
}

int main(Platform::Array<Platform::String^>^)
{
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		MyApp^ app = ref new MyApp();
	}));

	return 0;
}