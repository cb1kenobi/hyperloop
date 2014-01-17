package com.appcelerator.javascriptcore.java;

import android.util.Log;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticFunctions;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticValues;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;

public class JS_android_util_Log extends JSClassDefinition {

    private static final String[] NAMESPACE = {"android", "util"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    private static JSValueRef nullObject;

    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
    	nullObject = jsc.JSValueMakeNull(context);
    	jsc.JSValueProtect(context, nullObject);
    	
        JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }

    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_util_Log definition = new JS_android_util_Log();
            definition.staticValues    = definition.createStaticValues();
            definition.staticFunctions = definition.createStaticFunctions();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }

    public static String getJSClassName() {
        return "Log";
    }

    private JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("d", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount >= 2) {
                    return jsc.JSValueMakeNumber(context,
                            Log.d(arguments.get(context, 0).toString(),
                                  arguments.get(context, 1).toString()));
                } else {
                    JSJavaObjectUtil.handleJSException(new IllegalArgumentException("Log.d needs 2 params at least"), context, exception);
                }
                return nullObject;
            }
        }, JSPropertyAttribute.DontDelete) ;

        return functions;
    }

    private JSStaticValues createStaticValues() {
        return null;
    }

    public static String[] getNamespace() {
        return NAMESPACE;
    }
}