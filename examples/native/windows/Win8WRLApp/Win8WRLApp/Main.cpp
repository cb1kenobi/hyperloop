/*
* Simple Windows Store (Metro) app that runs on ARM and x86 Windows. The source is completely ISO CPP.
* 
* Will not run on Windows Phone.
*
* TODO: 
*     Still need to add gesture recognition
*     Need to create UIElements without XAML
*
*/

#include <windows.h>
#include <roapi.h>
#include <wchar.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wrl.h>

#include <Windows.UI.Xaml.h>
#include <Windows.UI.Xaml.Markup.h>
#include <Windows.ApplicationModel.Activation.h>

using namespace Microsoft::WRL;
using namespace Microsoft::WRL::Wrappers;
using namespace Windows::Foundation;
using namespace ABI::Windows::UI::Xaml;
using namespace ABI::Windows::UI::Xaml::Markup;
using namespace ABI::Windows::ApplicationModel::Activation;

#define MARKUP_TO_LOAD \
	L"<Grid xmlns=\"http://schemas.microsoft.com/winfx/2006/xaml/presentation\">" \
	L"  <TextBlock Text=\"Native Application using WRL!\" VerticalAlignment=\"Center\" HorizontalAlignment=\"Center\" FontSize=\"48\" />" \
	L"</Grid>"

void CheckHRESULT(HRESULT hr, LPCWSTR message)
{
	if (FAILED(hr))
	{
		WCHAR aBuf[1024];
		swprintf_s(aBuf, L"Error 0x%08X during: %s", hr, message);
		// TODO: Add logger functionality
		//MessageBoxW(NULL, aBuf, L"BareMetalMetroApp", MB_ICONERROR);
		exit(1);
	}
}

/*
* A WRL WinRT component. Usually in it's own dll with winmd metadata but put here for simplicity.
*/

class AppOverides: public RuntimeClass<IApplicationOverrides>
{
	InspectableClass(L"BareMetalWRLApp.AppOverides", BaseTrust);

protected:
	ComPtr<IApplicationOverrides> pBaseImpl;

public:
	void SetBase(IApplicationOverrides* _pBaseImpl)
	{
		pBaseImpl = _pBaseImpl;
	}

	STDMETHOD(OnLaunched)(ILaunchActivatedEventArgs* args);
	STDMETHOD(OnWindowCreated)(IWindowCreatedEventArgs* args);

	STDMETHOD(OnActivated)(IActivatedEventArgs* args) { return pBaseImpl->OnActivated(args); }	
	STDMETHOD(OnFileActivated)(IFileActivatedEventArgs* args) { return pBaseImpl->OnFileActivated(args); }
	STDMETHOD(OnSearchActivated)(ISearchActivatedEventArgs* args) { return pBaseImpl->OnSearchActivated(args); }
	STDMETHOD(OnShareTargetActivated)(IShareTargetActivatedEventArgs* args) { return pBaseImpl->OnShareTargetActivated(args); }
	STDMETHOD(OnFileOpenPickerActivated)(IFileOpenPickerActivatedEventArgs* args) { return pBaseImpl->OnFileOpenPickerActivated(args); }
	STDMETHOD(OnFileSavePickerActivated)(IFileSavePickerActivatedEventArgs* args) { return pBaseImpl->OnFileSavePickerActivated(args); }
	STDMETHOD(OnCachedFileUpdaterActivated)(ICachedFileUpdaterActivatedEventArgs* args) { return pBaseImpl->OnCachedFileUpdaterActivated(args); }
};

/*
*  A snippet of XAML. Using XAML here to test dynamically loading XAML. It also makes this sample a bit
* less verbose.
*/

STDMETHODIMP AppOverides::OnWindowCreated(IWindowCreatedEventArgs* args)
{
	return S_OK;
}

STDMETHODIMP AppOverides::OnLaunched(ILaunchActivatedEventArgs* args)
{
	HStringReference WindowClsName(RuntimeClass_Windows_UI_Xaml_Window);
	HStringReference XamlReaderClsName(RuntimeClass_Windows_UI_Xaml_Markup_XamlReader);
	HStringReference MarkupData(MARKUP_TO_LOAD);

	// Puts up the statistics strip. Shows memory, frame rates and more
	ComPtr<IWindow> pCurWin;
	{
		ComPtr<IWindowStatics> pWinStatics;
		CheckHRESULT(GetActivationFactory(WindowClsName.Get(), &pWinStatics), L"IWinStatics");
		CheckHRESULT(pWinStatics->get_Current(&pCurWin), L"get_Current");
	}

	ComPtr<IUIElement> pContent;
	{
		ComPtr<IXamlReaderStatics> pXamlReaderStatics;
		ComPtr<IInspectable> pObj;

		// pContent = XamlReader::Load(MarkupData)
		CheckHRESULT(GetActivationFactory(XamlReaderClsName.Get(), &pXamlReaderStatics), L"IXamlReaderStatics");
		CheckHRESULT(pXamlReaderStatics->Load(MarkupData.Get(), &pObj), L"Markup loading failure");
		CheckHRESULT(pObj.As(&pContent), L"IUIElement");
	}

	// pCurWin->Content = pContent
	pCurWin->put_Content(pContent.Get());
	pCurWin->Activate();

	return S_OK;
}

static STDMETHODIMP InitApplication(IApplicationInitializationCallbackParams* args)
{
	// Prepare HSTRING versions of class names
	HStringReference ApplicationClsName(RuntimeClass_Windows_UI_Xaml_Application);

	ComPtr<IApplicationFactory> pAppFactory;
	CheckHRESULT(GetActivationFactory(ApplicationClsName.Get(), &pAppFactory), L"IApplicationFactory");

	ComPtr<AppOverides> pAppOverides = Make<AppOverides>();
	ComPtr<IApplication> pApp;
	{
		IInspectable* pInner;
		CheckHRESULT(pAppFactory->CreateInstance(pAppOverides.Get(), &pInner, &pApp), L"CreateInstance");
	}

	// Set the inherited Application object
	ComPtr<IApplicationOverrides> pBaseImpl;
	CheckHRESULT(pApp.As(&pBaseImpl), L"IApplicationOverrides");
	pAppOverides->SetBase(pBaseImpl.Get());

	return S_OK;
}

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow)
{
	RoInitializeWrapper init(RO_INIT_MULTITHREADED);
	CheckHRESULT(init, L"RoInitialize");

	ComPtr<IApplicationStatics> pAppStatics;
	HStringReference ApplicationClsName(RuntimeClass_Windows_UI_Xaml_Application);
	CheckHRESULT(GetActivationFactory(ApplicationClsName.Get(), &pAppStatics), L"IApplicationStatics");

	ComPtr<IApplicationInitializationCallback> pCallback = Callback<IApplicationInitializationCallback>(InitApplication);
	pAppStatics->Start(pCallback.Get());

	return 0;
}
