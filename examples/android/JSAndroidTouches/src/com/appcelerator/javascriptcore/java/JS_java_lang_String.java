package com.appcelerator.javascriptcore.java;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;
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

public class JS_java_lang_String extends JSClassDefinition implements JSObjectCallAsConstructorCallback {

    private static final String[] NAMESPACE = {"java", "lang"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;

    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
        JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }

    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_java_lang_String definition = new JS_java_lang_String();
            definition.callAsConstructor = definition;
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
        return "String";
    }
    
    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        String string = null;
        if (argumentCount > 0) {
            JSValueRef arg1 = arguments.get(context, 0);
            string = arg1.toString();
        } else {
            string = "";
        }

        return jsc.JSObjectMake(context, jsClassRef, string);
    }

    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("format", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                String string = "";
                if (argumentCount == 1) {
                    string = arguments.get(context, 0).toString();
                } else if (argumentCount > 1) {
                    String format = arguments.get(context, 0).toString();
                    Object[] args = new Object[argumentCount - 1];
                    for (int i = 1; i < argumentCount; i++) {
                        args[i-1] = arguments.get(context, i).toString();
                    }
                    string = String.format(format, args);
                }
                return jsc.JSObjectMake(context, jsClassRef, string);
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