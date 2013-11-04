#pragma once
using namespace Platform;
#include <string>
#include <JavaScriptCore/JavaScript.h>

class Utils
{
public:
	static Platform::String^ getPlatformString(JSStringRef sValue);
	static JSStringRef getJSStringRef(Platform::String^ string);
private:
	Utils();
};

