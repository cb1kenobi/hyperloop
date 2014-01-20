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

public class JS_EmptyObject extends JSClassDefinition
    implements JSObjectCallAsConstructorCallback, JSObjectConvertToTypeCallback, JSObjectHasInstanceCallback {

    private static final String[] NAMESPACE = {};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    private static JSValueRef nullObject = null;

    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
        JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }

    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_EmptyObject definition = new JS_EmptyObject();
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
    
    @Override
    public void dispose() {
    	super.dispose();
    	jsClassRef = null;
    	nullObject = null;
    }
    
    public static String getJSClassName() {
        return "EmptyObject";
    }

    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        return jsc.JSObjectMake(context, jsClassRef, null);
    }

    @Override
    public boolean hasInstance(JSContextRef context, JSObjectRef constructor,
            JSValueRef possibleValue, Pointer exception) {
        return false;
    }

    @Override
    public JSValueRef convertToType(JSContextRef context, JSObjectRef object,
            JSType type, Pointer exception) {
        return jsc.JSValueMakeNull(context);
    }

    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();

        functions.add("toString", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (nullObject == null) {
                    nullObject = jsc.JSValueMakeNull(context);
                	jsc.JSValueProtect(context, nullObject);
                }
                return nullObject;
            }
        }, JSPropertyAttribute.DontDelete) ;

        functions.add("equals", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
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