<%- renderTemplate('jsc/templates/doc.ejs') %>
using namespace Platform;
using namespace Windows::UI::Xaml;
using namespace Windows::ApplicationModel::Activation;

#include <JavaScriptCore/JavaScript.h>
#include <Windows.h>
#include "hyperloop.h"
#include "GeneratedApp.h"
<% function boot() { %>
	GeneratedApp::loadSources();
	JSGlobalContextRef ctx = HyperloopCreateVM("./<%=main_js%>", "<%=prefix%>");
	if (ctx == nullptr) {
		OutputDebugStringA("Failed to start the Hyperloop VM; do you have a valid app.hjs?");
	}
	else {
		JSObjectRef global = JSContextGetGlobalObject(ctx);
		GeneratedApp::loadWithObject(ctx, global);
		JSStringRef script = JSStringCreateWithUTF8CString(GeneratedApp::sources["/app"].c_str()),
			sourceURL = JSStringCreateWithUTF8CString("<%=main_js%>");
		JSValueRef exception = NULL;
		JSEvaluateScript(ctx, script, global, sourceURL, 0, &exception);
		CHECK_EXCEPTION(ctx, exception);
		JSStringRelease(sourceURL);
		JSStringRelease(script);
	}<% }
if (!compiler.manual_bootstrap) { %>
ref class HyperloopApp sealed : public Application
{
public:
	virtual void OnLaunched(LaunchActivatedEventArgs^ args) override;
	virtual void OnActivated(IActivatedEventArgs^ args) override;
private:
	void Boot();
	JSContextRef context;
	bool booted;
};
void HyperloopApp::OnLaunched(LaunchActivatedEventArgs^ args)
{
	Boot();
}
void HyperloopApp::OnActivated(IActivatedEventArgs^ args)
{
	if (args->Kind == Windows::ApplicationModel::Activation::ActivationKind::Protocol)
	{
		Boot();
	}
}
void HyperloopApp::Boot()
{
	if (booted) {
		return;
	}
	booted = true;
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