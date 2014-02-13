#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <JavaScriptCore/JavaScript.h>
#include <string>

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
HyperloopJS *HyperloopLoadJS(JSContextRef ctx, HyperloopJS *parent, std::string path, std::string prefix);
HyperloopJS *HyperloopLoadJSWithLogger(JSContextRef ctx, HyperloopJS *parent, std::string path, std::string prefix, JSObjectRef logger);