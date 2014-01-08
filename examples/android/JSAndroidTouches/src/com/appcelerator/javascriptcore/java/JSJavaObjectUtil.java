package com.appcelerator.javascriptcore.java;

import java.io.PrintWriter;
import java.io.StringWriter;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.JavaScriptException;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;

public class JSJavaObjectUtil {
    private static JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();

    public static JSObjectRef registerJSNamespace(JSContextRef context, JSObjectRef globalObject, String[] namespace) {
        JSObjectRef parentObject = globalObject;
        JSObjectRef namespaceObject = null;
        JSValueRef exception = JSValueRef.Null();
        for (int i = 0; i < namespace.length; i++) {
            JSValueRef value = jsc.JSObjectGetProperty(context, parentObject, namespace[i], exception);
            checkJSException(context, exception);
            if (!value.isObject()) {
                namespaceObject = jsc.JSObjectMake(context, null, exception);
                jsc.JSObjectSetProperty(context, parentObject, namespace[i], namespaceObject, JSPropertyAttribute.DontDelete, exception);
                checkJSException(context, exception);
            } else {
                namespaceObject = value.toObject();
            }
            parentObject = namespaceObject;
        }

        return namespaceObject;
    }

    public static void checkJSException(JSContextRef context, JSValueRef exception) {
        if (!jsc.JSValueIsNull(context, exception)) {
            throw new JavaScriptException(exception.toString());
        }
    }
    
    public static void handleJSException(Throwable th, JSContextRef context, Pointer exception) {
        StringWriter errors = new StringWriter();
        th.printStackTrace(new PrintWriter(errors));
        JSObjectRef exception_detail = jsc.JSObjectMake(context, null);
        JSValueRef javaStackTrace = jsc.JSValueMakeString(context, errors.toString());
        JSValueRef javaScriptStackTrace = jsc.JSValueMakeString(context, jsc.JSContextCreateBacktrace(context, 10));
        jsc.JSObjectSetProperty(context, exception_detail, "nativeStack", javaStackTrace, JSPropertyAttribute.DontDelete, null);
        jsc.JSObjectSetProperty(context, exception_detail, "stack", javaScriptStackTrace, JSPropertyAttribute.DontDelete, null);
        exception.update(exception_detail);        
    }

}