package com.appcelerator.javascriptcore.java;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectConvertToTypeCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectHasInstanceCallback;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.enums.JSType;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticFunctions;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticValues;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;

public class JS_java_lang_Object extends JSClassDefinition
    implements JSObjectCallAsConstructorCallback, JSObjectConvertToTypeCallback, JSObjectHasInstanceCallback {

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
            JS_java_lang_Object definition = new JS_java_lang_Object();
            definition.callAsConstructor = definition;
            definition.convertToType = definition;
            definition.hasInstance   = definition;
            definition.staticValues    = definition.createStaticValues();
            definition.staticFunctions = definition.createStaticFunctions();
            definition.className = getJSClassName();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }

    public static String getJSClassName() {
        return "Object";
    }

    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        return jsc.JSObjectMake(context, jsClassRef, new Object());
    }

    @Override
    public boolean hasInstance(JSContextRef context, JSObjectRef constructor,
            JSValueRef possibleValue, Pointer exception) {
        try {
            Object objectA = constructor.getPrivateObject();
            Object objectB = possibleValue.castToObject().getPrivateObject();
            if (objectA != null && objectB != null) {
                return objectA.getClass().isInstance(objectB);
            } else {
                return false;
            }
        } catch (Exception e) {
            JSJavaObjectUtil.handleJSException(e, context, exception);
        }
        return false;
    }

    @Override
    public JSValueRef convertToType(JSContextRef context, JSObjectRef object,
            JSType type, Pointer exception) {
        Object jobject = object.getPrivateObject(); 
        try {
            switch (type) {
            case Number:
                return jsc.JSValueMakeNumber(context, Double.parseDouble(jobject.toString()));
            case String:
                return jsc.JSValueMakeString(context, jobject.toString());
            default:
                return jsc.JSValueMakeString(context, jobject.toString());
            }
        } catch (Exception e) {
            JSJavaObjectUtil.handleJSException(e, context, exception);
        }
        return null;
    }

    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();

        /*
         * toString()
         * Unlike Java API, toString() returns JavaScript String instead of Java String.
         */
        functions.add("toString", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                Object jobject = thisObject.getPrivateObject(); 
                if (jobject != null) {
                    return jsc.JSValueMakeString(context, jobject.toString());
                } else {
                    return jsc.JSValueMakeString(context, thisObject.toString());
                }
            }
        }, JSPropertyAttribute.DontDelete) ;

        /*
         * equals()
         * This method compares Java objects which does not use JavaScriptCore's JSValueIsEqual.
         */
        functions.add("equals", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                Object jobjectA = thisObject.getPrivateObject();
                if (jobjectA != null && argumentCount > 0) {
                    Object jobjectB = arguments.get(context, 0).castToObject().getPrivateObject();
                    return jsc.JSValueMakeBoolean(context, jobjectA.equals(jobjectB));
                }
                return jsc.JSValueMakeBoolean(context, false);
            }
        }, JSPropertyAttribute.DontDelete);

        return functions;
    }

    private JSStaticValues createStaticValues() {
        return null;
    }

    public static String[] getNamespace() {
        return NAMESPACE;
    }
}