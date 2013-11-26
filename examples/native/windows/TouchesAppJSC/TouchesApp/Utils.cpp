#include "Utils.h"

Platform::String^ Utils::getPlatformString(JSStringRef sValue) {
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
	JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring w_str(s_str.begin(), s_str.end());
	return ref new Platform::String(w_str.c_str());
}

JSStringRef Utils::getJSStringRef(Platform::String^ string) {
	std::wstring w_str(string->Begin());
	std::string s_str(w_str.begin(), w_str.end());
	const char* charStr = s_str.c_str();
	return JSStringCreateWithUTF8CString(charStr);
}


 JSContextRef Utils::getAppContext() {
	return app_context;
}

 void Utils::setAppContext(JSContextRef context) {
	 app_context = context;
}

