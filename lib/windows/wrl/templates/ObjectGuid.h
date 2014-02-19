#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
#include <JavaScriptCore/JavaScript.h>
#include "JSPrivateObject.h"
#include "JSModule.h"

<% [ [ 'Object', '^', true ], [ 'Guid', '', false ] ].forEach(function(args) {
	var type = args[0], pointer = args[1], isRefType = args[2]; %>
JSObjectRef MakeObjectFor<%- type %>(JSContextRef ctx, <%- type + pointer %> instance);
JSClassRef CreateClassFor<%- type %>();
JSClassRef CreateClassFor<%- type %>Constructor();
JSValueRef Hyperloop<%- type %>ToJSValueRef(JSContextRef ctx, <%- type + pointer %> instance);
<%- type + pointer %> HyperloopJSValueRefTo<%- type %>(JSContextRef ctx, JSValueRef instance);
<%- type + pointer %> HyperloopJSValueRefTo<%- type.toLowerCase() %>(JSContextRef ctx, JSValueRef instance, JSValueRef *exception, bool *cleanup);
JSValueRef Hyperloop<%- type.toLowerCase() %>ToJSValueRef(JSContextRef ctx, <%- type + pointer %> instance);
<% }); %>