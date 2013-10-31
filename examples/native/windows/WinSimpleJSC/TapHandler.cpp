#include "TapHandler.h"

/*
 * When tapped, color the Grid, and update the TextBlock to show the current time.
 */
TapHandler::TapHandler(JSContextRef ctx, TextBlock^ text)
{
	this->ctx = ctx;
	this->text = text;
}
void TapHandler::PointerPressed(Object^ sender, TappedRoutedEventArgs^ e)
{
	this->text->FontSize = 180;

	JSObjectRef global = JSContextGetGlobalObject(this->ctx);
	JSStringRef string = JSStringCreateWithUTF8CString("2 + 2");
	JSValueRef result = JSEvaluateScript(this->ctx,string,global,NULL,0,NULL);
	double value = JSValueToNumber(this->ctx,result,NULL);

	this->text->Text = value.ToString();
}
