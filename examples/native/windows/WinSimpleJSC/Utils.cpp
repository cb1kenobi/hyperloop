#include "Utils.h"
Platform::String^ Utils::convertJSString(JSStringRef sValue)
{
	size_t sLength = JSStringGetMaximumUTF8CStringSize(sValue);
	char* cValue = new char[sLength];
	JSStringGetUTF8CString(sValue, cValue, sLength);
	std::string s_str = cValue;
	std::wstring wid_str = std::wstring(s_str.begin(), s_str.end());
	return ref new Platform::String(wid_str.c_str());
}