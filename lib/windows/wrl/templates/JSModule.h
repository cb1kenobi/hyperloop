#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <JavaScriptCore/JavaScript.h>
#include <string>
#include <map>
#include "hyperloop.h"

using namespace std;
using namespace Platform;

class HyperloopJS
{
public:
	String ^id;
	String ^filename;
	bool loaded;
	HyperloopJS *parent;
	JSObjectRef exports;
	JSContextRef context;
	String ^prefix;
	~HyperloopJS();
};

JSObjectRef HyperloopMakeJSObject(JSContextRef ctx, HyperloopJS *module);
HyperloopJS *HyperloopLoadJS(JSContextRef ctx, HyperloopJS *parent, String ^path, String ^prefix);
HyperloopJS *HyperloopLoadJSWithLogger(JSContextRef ctx, HyperloopJS *parent, String ^path, String ^prefix, JSObjectRef logger);
