<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <map>
#include <regex>
#include <sstream>
#include "JSModule.h"
#include "hyperloop.h"
#include "GeneratedApp.h"

using namespace std;
using namespace Platform;
using namespace Windows::Data::Json;


static map<string, HyperloopJS*> modules;

/*
 String manipulation utility functions.
 */

bool hasPrefix(string path, string prefix)
{
	return path.substr(0, prefix.length()) == prefix;
}
string stringByDeletingLastPathComponent(string path)
{
	auto index = path.find_last_of('/');
	if (index == -1)
	{
		return "";
	}
	else
	{
		return path.substr(0, index);
	}
}
string stringByAppendingPathComponent(string path, string component)
{
	if (path.find_last_of('/') == path.length())
	{
		return path + component;
	}
	else
	{
		return path + '/' + component;
	}
}
void replaceAll(std::string& str, const std::string& from, const std::string& to)
{
	if (from.empty())
	{
		return;
	}
	size_t start_pos = 0;
	while ((start_pos = str.find(from, start_pos)) != std::string::npos)
	{
		str.replace(start_pos, from.length(), to);
		start_pos += to.length(); // In case 'to' contains 'from', like replacing 'x' with 'yx'
	}
}
string stringByStandardizingPath(string path)
{
	replaceAll(path, "//", "/");
	replaceAll(path, "/./", "/");
	// TODO: "In absolute paths, resolution of references to the parent directory (Ã¢â‚¬Å“..Ã¢â‚¬Â) to the real parent directory;"
	return path;
}
string stringByDeletingPathExtension(string path)
{
	auto dotIndex = path.find_last_of('.');
	auto slashIndex = path.find_last_of('/');
	if (dotIndex == std::string::npos || (slashIndex != std::string::npos && slashIndex > dotIndex))
	{
		return path;
	}
	else
	{
		return path.substr(0, dotIndex);
	}
}

string resolveDotDotSlash(string s) {
	vector<string> elems;
	stringstream ss(s);
	ostringstream newPath;
	string item;

	// tokenize path
	while (getline(ss, item, '/')) {

		// if we encounter "..", remove the last path part
		if (item == "..") {
			if (elems.size() > 0) {
				elems.pop_back();
			}

		// add the current path part
		} else {
			elems.push_back(item);
		}
	}

	// create new path
	for (vector<string>::const_iterator i = elems.begin(); i != elems.end(); i++) {
		if (i != elems.begin()) {
			newPath << "/";
		}
		newPath << *i;
	}

	return newPath.str();
}

/*
 Implementation.
 */
HyperloopJS::~HyperloopJS()
{
}

JSValueRef JSGetId(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS *)JSObjectGetPrivate(object);
	auto str = JSStringCreateWithUTF8CString(module->id.c_str());
	auto retVal = JSValueMakeString(ctx, str);
	JSStringRelease(str);
	return retVal;
}

JSValueRef JSGetFilename(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS *)JSObjectGetPrivate(object);
	auto str = JSStringCreateWithUTF8CString(module->filename.c_str());
	auto retVal = JSValueMakeString(ctx, str);
	JSStringRelease(str);
	return retVal;
}

JSValueRef JSGetParent(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS*)JSObjectGetPrivate(object);
	if (module->parent != nullptr)
	{
		return HyperloopMakeJSObject(ctx, module->parent);
	}
	return JSValueMakeNull(ctx);
}

JSValueRef JSGetLoaded(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS*)JSObjectGetPrivate(object);
	return JSValueMakeBoolean(ctx, module->loaded);
}

JSValueRef JSGetDirname(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS *)JSObjectGetPrivate(object);
	auto path = module->filename;
	auto dir = "./" + stringByDeletingLastPathComponent(path);
	if (dir.find_last_of('/') != dir.length())
	{
		dir += '/';
	}
	dir = stringByStandardizingPath(dir);
	auto str = JSStringCreateWithUTF8CString(dir.c_str());
	auto retVal = JSValueMakeString(ctx, str);
	JSStringRelease(str);
	return retVal;
}

JSValueRef JSRequire(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS *)JSObjectGetPrivate(object);

	if (argumentCount != 1)
	{
		return HyperloopMakeException(ctx, "path must be a string", exception);
	}

	auto path = HyperloopToString(ctx, arguments[0]);
	HyperloopJS *js = HyperloopLoadJS(ctx, module, hyperloop::getSStr(path), module->prefix);

	if (js == nullptr)
	{
		HyperloopMakeException(ctx, hyperloop::getSStr("cannot find module '" + path + "'").c_str(), exception);
		JSStringRef codeProperty = JSStringCreateWithUTF8CString("code");
		JSStringRef msgProperty = JSStringCreateWithUTF8CString("MODULE_NOT_FOUND");
		JSObjectRef exceptionObject = JSValueToObject(ctx, *exception, 0);
		JSObjectSetProperty(ctx, exceptionObject, codeProperty, JSValueMakeString(ctx, msgProperty), 0, 0);
		CHECK_EXCEPTION(ctx, *exception);
		JSStringRelease(codeProperty);
		JSStringRelease(msgProperty);
		return JSValueMakeUndefined(ctx);
	}

	return js->exports;
}

/**
  *called to do an async dispatch on the main thread
 */
JSValueRef JSDispatchAsync(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef *exception)
{
	HyperloopJS *module = (HyperloopJS*)JSObjectGetPrivate(object);

	if (argumentCount != 1)
	{
		return HyperloopMakeException(ctx, "function takes a callback as function to invoke on main thread", exception);
	}

	JSObjectRef callback = JSValueToObject(ctx, arguments[0], exception);
	if (!JSObjectIsFunction(ctx, callback))
	{
		return HyperloopMakeException(ctx, "callback must be a function", exception);
	}
	CHECK_EXCEPTION(ctx, *exception);

	JSObjectCallAsFunction(ctx, callback, object, 0, NULL, NULL);

	return JSValueMakeUndefined(ctx);
}

/**
 * called when a new JS object is created for this class
 */
void JSInitialize(JSContextRef ctx, JSObjectRef object)
{
	HyperloopJS *module = (HyperloopJS*)JSObjectGetPrivate(object);
	JSValueProtect(module->context, module->exports);
}

/**
 * called when the JS object is ready to be garbage collected
 */
void JSFinalize(JSObjectRef object)
{
	HyperloopJS *module = (HyperloopJS*)JSObjectGetPrivate(object);
	if (module != nullptr)
	{
		JSValueUnprotect(module->context, module->exports);
	}
}

static JSStaticValue StaticValueArrayForJS [] = {
	{ "id", JSGetId, 0, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontEnum },
	{ "filename", JSGetFilename, 0, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontEnum },
	{ "parent", JSGetParent, 0, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontEnum },
	{ "loaded", JSGetLoaded, 0, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontEnum },
	{ "__dirname", JSGetDirname, 0, kJSPropertyAttributeReadOnly },
	{ "__filename", JSGetFilename, 0, kJSPropertyAttributeReadOnly },
	{ 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJS [] = {
	{ "require", JSRequire, kJSPropertyAttributeReadOnly },
	{ "dispatch_async", JSDispatchAsync, kJSPropertyAttributeReadOnly },
	{ 0, 0, 0 }
};

std::string HyperloopPathToSource(std::string path, std::string prefix)
{
	return GeneratedApp::sources[stringByDeletingPathExtension(path.substr(1))];
}

static JSClassDefinition classDef;
static JSClassRef classRef;

JSObjectRef HyperloopMakeJSObject(JSContextRef ctx, HyperloopJS *module)
{
	static bool init;
	if (!init)
	{
		init = true;
		JSClassDefinition classDef = kJSClassDefinitionEmpty;
		classDef.staticFunctions = StaticFunctionArrayForJS;
		classDef.staticValues = StaticValueArrayForJS;
		classDef.finalize = JSFinalize;
		classDef.initialize = JSInitialize;
		classRef = JSClassCreate(&classDef);
	}

	return JSObjectMake(ctx, classRef, (void *)module);
}

HyperloopJS *HyperloopLoadJSWithLogger(JSContextRef ctx, HyperloopJS *parent, string path, string prefix, JSObjectRef logger)
{
	// For the logic, we follow node.js logic here: http://nodejs.org/api/modules.html#modules_module_filename
	string jscode;
	string filepath = path;
	HyperloopJS *module = nullptr;
	string modulekey;

	if (hasPrefix(path, "./") || hasPrefix(path, "/") || hasPrefix(path, "../"))
	{
		if (parent != nullptr)
		{
			auto parentDir = stringByDeletingLastPathComponent(parent->filename);
			if (hasPrefix(filepath, "./")) {
				if (!parentDir.empty()) {
					filepath = stringByAppendingPathComponent(stringByAppendingPathComponent(".", parentDir), filepath.substr(2));
				}
			}
			else if (hasPrefix(filepath, "../")) {
				if (!parentDir.empty()) {
					filepath = stringByAppendingPathComponent(stringByAppendingPathComponent(".", parentDir), filepath);
					filepath = resolveDotDotSlash(filepath);
				}
			}
			else if (hasPrefix(filepath, "/")) {
				filepath = "." + filepath;
			}
		}
		filepath = stringByStandardizingPath(filepath);

		module = modules[stringByDeletingPathExtension(filepath)];
		if (module)
		{
			return module;
		}
	}
	else if (parent == nullptr)
	{
		// not a specific path, must look at node_modules according to node spec (step 3)
		filepath = stringByAppendingPathComponent("./node_modules", filepath);
		module = modules[stringByDeletingPathExtension(filepath)];
		if (module)
		{
			return module;
		}
		return HyperloopLoadJSWithLogger(ctx, parent, filepath, prefix, nullptr);
	}

	jscode = HyperloopPathToSource(filepath, prefix);

	if (jscode.empty())
	{
		auto subpath = stringByAppendingPathComponent(filepath, "package.json");
		auto packagePath = subpath;
		auto fileData = HyperloopPathToSource(subpath, prefix);
		if (!fileData.empty())
		{
			auto json = ref new JsonObject();
			if (JsonObject::TryParse(hyperloop::getPlatformString(fileData), &json))
			{
				// look for main field in JSON
				auto main = json->GetNamedString("main");
				if (main != nullptr)
				{
					subpath = stringByAppendingPathComponent(filepath, hyperloop::getSStr(main));
					packagePath = stringByStandardizingPath(subpath);
					filepath = packagePath;
					module = modules[stringByDeletingPathExtension(filepath)];
					if (module)
					{
						return module;
					}
					jscode = HyperloopPathToSource(filepath, prefix);
				}
			}
		}
		if (jscode.empty())
		{
			// look for index.js
			subpath = stringByAppendingPathComponent(filepath, "index.js");
			packagePath = stringByStandardizingPath(subpath);
			filepath = packagePath;
			module = modules[stringByDeletingPathExtension(filepath)];
			if (module)
			{
				return module;
			}
			jscode = HyperloopPathToSource(filepath, prefix);
		}

		// if we're already inside node_modules, don't go into this block or you'll have infinite recursion
		if (jscode.empty() && filepath.find("node_modules/") == -1)
		{
			// check node modules, by walking up from the current directory to the top of the directory
			auto top = parent ? parent->filename : "";
			while (!top.empty())
			{
				top = stringByDeletingLastPathComponent(top);
				auto fp = stringByAppendingPathComponent(top, "node_modules/" + filepath);
				module = modules[stringByDeletingPathExtension(fp)];
				if (module)
				{
					return module;
				}
				module = HyperloopLoadJS(ctx, parent, fp, prefix);
				if (module != nullptr)
				{
					return module;
				}
			}
		}
		if (jscode.empty()) {
			return nullptr;
		}
	}

	module = new HyperloopJS();
	module->id = stringByDeletingPathExtension(hasPrefix(filepath, "./") ? filepath.substr(2) : filepath);
	module->filename = module->id + ".js";
	module->loaded = false;
	module->parent = parent;
	module->context = HyperloopGetGlobalContext(ctx);
	module->exports = JSObjectMake(ctx, 0, 0);
	module->prefix = prefix;

	modules[stringByDeletingPathExtension(filepath)] = module;

	JSObjectRef moduleObjectRef = HyperloopMakeJSObject(ctx, module);
	JSStringRef exportsProperty = JSStringCreateWithUTF8CString("exports");
	JSObjectSetProperty(ctx, moduleObjectRef, exportsProperty, module->exports, 0, 0);
	JSStringRelease(exportsProperty);

	// install our own logger
	if (logger != nullptr)
	{
		JSStringRef consoleProperty = JSStringCreateWithUTF8CString("console");
		JSObjectSetProperty(ctx, moduleObjectRef, consoleProperty, logger, 0, 0);
		JSStringRelease(consoleProperty);
	}

	// load up our properties that we want to expose
	JSPropertyNameArrayRef properties = JSObjectCopyPropertyNames(ctx, moduleObjectRef);
	std::string propertyNames("");
	size_t count = JSPropertyNameArrayGetCount(properties);

	JSStringRef parameterNames[1];
	JSValueRef arguments[1];

	parameterNames[0] = JSStringCreateWithUTF8CString("module");
	arguments[0] = moduleObjectRef;

	// loop through and put module related variables in a wrapper scope
	for (size_t c = 0; c < count; c++)
	{
		JSStringRef propertyName = JSPropertyNameArrayGetNameAtIndex(properties, c);
		auto sPropertyName = hyperloop::getSStr(hyperloop::getPlatformString(propertyName));
		JSValueRef paramObject = JSObjectGetProperty(ctx, moduleObjectRef, propertyName, 0);
		bool added = false;
		if (JSValueIsObject(ctx, paramObject))
		{
			JSStringRef script = JSStringCreateWithUTF8CString(("(typeof this." + sPropertyName + " === 'function')").c_str());
			JSValueRef result = JSEvaluateScript(ctx, script, moduleObjectRef, NULL, 0, 0);
			if (JSValueToBoolean(ctx, result))
			{
				// make sure that the right scope (this object) is set for the function
				propertyNames += ", " + sPropertyName + " = function " + sPropertyName + "() { return $self." + sPropertyName + ".apply($self, arguments); }";
				added = true;
			}
			JSStringRelease(script);
		}
		if (added == false)
		{
			propertyNames += ", " + sPropertyName + " = this." + sPropertyName;
		}
		JSStringRelease(propertyName);
	}

	auto wrapper = "var $self = this" + propertyNames + ";\r\n" + jscode + ";";

	JSStringRef fnName = JSStringCreateWithUTF8CString("require");
	JSStringRef body = JSStringCreateWithUTF8CString(wrapper.c_str());

	JSValueRef *exception = NULL;
	JSStringRef filename = JSStringCreateWithUTF8CString(filepath.c_str());
	JSObjectRef requireFn = JSObjectMakeFunction(ctx, fnName, 1, parameterNames, body, filename, 1, exception);
	JSStringRelease(filename);

	JSValueRef fnResult = JSObjectCallAsFunction(ctx, requireFn, moduleObjectRef, 1, arguments, exception);
	JSStringRef pathRef = JSStringCreateWithUTF8CString(filepath.c_str());
	JSStringRef prefixRef = JSStringCreateWithUTF8CString(prefix.c_str());

	JSStringRelease(pathRef);
	JSStringRelease(prefixRef);
	JSStringRelease(fnName);
	JSStringRelease(body);
	JSStringRelease(parameterNames[0]);

	module->loaded = true;

	// we need to pull the exports in case it got assigned (such as setting a Class to exports)
	JSStringRef exportsProp = JSStringCreateWithUTF8CString("exports");
	JSValueRef exportsValueRef = JSObjectGetProperty(ctx, moduleObjectRef, exportsProp, 0);
	if (JSValueIsObject(ctx, exportsValueRef))
	{
		module->exports = JSValueToObject(ctx, exportsValueRef, 0);
	}
	JSStringRelease(exportsProp);

	return module;
}

HyperloopJS *HyperloopLoadJS(JSContextRef ctx, HyperloopJS *parent, string path, string prefix)
{
	return HyperloopLoadJSWithLogger(ctx, parent, path, prefix, nullptr);
}
