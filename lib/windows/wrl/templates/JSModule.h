#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <JavaScriptCore/JavaScript.h>
#include <string>
#include <map>
#include "hyperloop.h"
#include "GeneratedApp.h"

using namespace std;
using namespace Platform;
using namespace Windows::Data::Json;

class HyperloopJS
{
public:
	std::string id;
	std::string filename;
	std::string prefix;
	bool loaded;
	HyperloopJS *parent;
	JSObjectRef exports;
	JSContextRef context;
	~HyperloopJS();
};

JSObjectRef HyperloopMakeJSObject(JSContextRef ctx, HyperloopJS *module);
HyperloopJS *HyperloopLoadJS(JSContextRef ctx, HyperloopJS *parent, string path, string prefix);
HyperloopJS *HyperloopLoadJSWithLogger(JSContextRef ctx, HyperloopJS *parent, string path, string prefix, JSObjectRef logger);