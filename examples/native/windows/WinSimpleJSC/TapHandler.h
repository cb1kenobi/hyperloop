#pragma once

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml::Input;
using namespace Windows::UI::Xaml::Controls;

#include <JavaScriptCore/JavaScript.h>

/*
 * When tapped, color the Grid, and update the TextBlock to show the current time.
 */
ref class TapHandler
{
internal:
	TapHandler(JSContextRef ctx, TextBlock^ text);
	void TapHandler::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e);
private:
	TextBlock^ text;
	JSContextRef ctx;
};