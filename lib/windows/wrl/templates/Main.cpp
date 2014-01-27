/*
 * Hyperloop on Windows. 
 * (Note that this will not yet run on Windows Phone.)
 */
using namespace Platform;
using namespace Windows::UI::Xaml;
using namespace Windows::ApplicationModel::Activation;

#include <JavaScriptCore/JavaScript.h>
#include <Windows.h>
#include "hyperloop.h"
#include "GeneratedApp.h"
<% function boot() { %>
	JSGlobalContextRef ctx = HyperloopCreateVM();
	JSObjectRef global = JSContextGetGlobalObject(ctx);
	GeneratedApp::loadWithObject(ctx, global);
	JSStringRef script = GeneratedApp::source(),
		sourceURL = JSStringCreateWithUTF8CString("app.hjs");
	JSValueRef exception = NULL;
	JSValueRef result = JSEvaluateScript(ctx, script, global, sourceURL, 0, &exception);
	CHECK_EXCEPTION(ctx, exception);
	String^ sResult = hyperloop::getPlatformString(ctx, result);
	JSStringRelease(sourceURL);
	JSStringRelease(script);
<% }
if (!compiler.manual_bootstrap) { %>
ref class HyperloopApp sealed : public Application
{
public:
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
private:
	JSContextRef context;
};
void HyperloopApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	<% boot() %>
}
<% } %>
[Platform::MTAThread]
int main(Platform::Array<Platform::String^>^)
{<% if (!compiler.manual_bootstrap) { %>
	Application::Start(ref new ApplicationInitializationCallback([](ApplicationInitializationCallbackParams^ params) {
		HyperloopApp^ app = ref new HyperloopApp();
	}));<%
	} else {
		boot();
	} %>
	return 0;
}