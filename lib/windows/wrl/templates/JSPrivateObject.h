#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <JavaScriptCore/JavaScript.h>

using namespace Platform;

enum JSPrivateObjectType {
	JSPrivateObjectTypeID = 0,
	JSPrivateObjectTypeClass = 1,
	JSPrivateObjectTypeJSBuffer = 2,
	JSPrivateObjectTypePointer = 3,
	JSPrivateObjectTypeNumber = 4
};

class JSPrivateObject
{
public:
	JSPrivateObject::JSPrivateObject() {}
	Object^ object;
	void *buffer;
	double value;
	JSPrivateObjectType type;
	JSContextRef context;
};