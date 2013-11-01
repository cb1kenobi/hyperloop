#pragma once
using namespace Platform;
#include <string>
#include <JavaScriptCore/JavaScript.h>

class Utils
{
public:
	static Platform::String^ convertJSString(JSStringRef sValue);
};

