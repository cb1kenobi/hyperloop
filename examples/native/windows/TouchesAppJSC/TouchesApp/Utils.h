#pragma once
using namespace Platform;
#include <string>
#include <JavaScriptCore/JavaScript.h>

using namespace Windows::UI::Xaml;

class Utils
{
public:
	static Platform::String^ getPlatformString(JSStringRef sValue);
	static JSStringRef getJSStringRef(Platform::String^ string);
private:
	Utils();
};

class PrivateObjectContainer
{
private:
	Object^ obj;
public:
	void set(Object^ obj) {
		this->obj = obj;
	}
	Object^ get() {
		return obj;
	}
	void clean() {
		obj = nullptr;
	}
};
