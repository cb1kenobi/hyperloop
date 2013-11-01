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

#include "TestCallFunction.h"
#include "TestCreateClass.h"
#include "TestCreateObject.h"
#include "TestCreateTextBlock.h"
#include "TestToBoolean.h"
#include "TestToNumber.h"
#include "TestToObject.h"
#include "TestToString.h"

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

void MyApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	String^ out = "Results:";
	JSObjectRef global = JSContextGetGlobalObject(context);
	JSStringRef string;
	JSValueRef result;
	JSStringRef params;
	JSStringRef className;

	TestToString::run(out, context, global);
	TestToBoolean::run(out, context, global);
	TestToNumber::run(out, context, global);
	TestToObject::run(out, context, global);
	TestCallFunction::run(out, context, global);
	TestCreateObject::run(out, context, global);
	TestCreateClass::run(out, context, global);
	TestCreateTextBlock::run(out, context, global);

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