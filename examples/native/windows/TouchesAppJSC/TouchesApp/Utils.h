#pragma once
using namespace Platform;
#include <string>
#include <JavaScriptCore/JavaScript.h>

using namespace Windows::UI::Xaml;

static JSContextRef app_context;

class Utils
{
public:
	static Platform::String^ getPlatformString(JSStringRef sValue);
	static JSStringRef getJSStringRef(Platform::String^ string);
	static JSContextRef getAppContext();
	static void setAppContext(JSContextRef context);
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
