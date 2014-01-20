package com.appcelerator.javascriptcore.java;

import android.view.MotionEvent;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectGetPropertyCallback;
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

public class JS_android_view_MotionEvent extends JSClassDefinition {
    
    private static final String[] NAMESPACE = {"android", "view"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    private static JSValueRef ACTION_MOVE = null;
    private static JSValueRef ACTION_UP = null;
    
    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
        JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }

    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_view_MotionEvent definition = new JS_android_view_MotionEvent();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.staticFunctions = definition.createStaticFunctions();
            definition.staticValues = definition.createStaticValues();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    @Override
    public void dispose() {
    	super.dispose();
    	jsClassRef = null;
    	ACTION_UP = null;
    	ACTION_MOVE = null;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, MotionEvent mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    public static String getJSClassName() {
        return "MotionEvent";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }

    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("getAction", new JSObjectCallAsFunctionCallback() {
            @Override
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                    JSObjectRef thisObject, int argumentCount,
                    JSValueArrayRef arguments, Pointer exception) {
                MotionEvent jobject = (MotionEvent)thisObject.getPrivateObject();
                return jsc.JSValueMakeNumber(context, jobject.getAction());
            }
        }, JSPropertyAttribute.DontDelete);
        
        functions.add("getRawX", new JSObjectCallAsFunctionCallback() {
            @Override
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                    JSObjectRef thisObject, int argumentCount,
                    JSValueArrayRef arguments, Pointer exception) {
                MotionEvent jobject = (MotionEvent)thisObject.getPrivateObject();
                return jsc.JSValueMakeNumber(context, jobject.getRawX());
            }
        }, JSPropertyAttribute.DontDelete);
        
        functions.add("getRawY", new JSObjectCallAsFunctionCallback() {
            @Override
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                    JSObjectRef thisObject, int argumentCount,
                    JSValueArrayRef arguments, Pointer exception) {
                MotionEvent jobject = (MotionEvent)thisObject.getPrivateObject();
                return jsc.JSValueMakeNumber(context, jobject.getRawY());
            }
        }, JSPropertyAttribute.DontDelete);
        
        return functions;
    }
    
    protected JSStaticValues createStaticValues() {
        JSStaticValues values = new JSStaticValues();
        /* MotionEvent.ACTION_MOVE */
        values.add("ACTION_MOVE", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
            	if (ACTION_MOVE == null) {
                	ACTION_MOVE = jsc.JSValueMakeNumber(ctx, MotionEvent.ACTION_MOVE);
                	jsc.JSValueProtect(ctx, ACTION_MOVE);
            	}
                return ACTION_MOVE;
            }
        }, null, JSPropertyAttribute.DontDelete);
        
        /* MotionEvent.ACTION_UP */
        values.add("ACTION_UP", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
            	if (ACTION_UP == null) {
            		ACTION_UP = jsc.JSValueMakeNumber(ctx, MotionEvent.ACTION_UP);
                	jsc.JSValueProtect(ctx, ACTION_UP);
            	}
                return ACTION_UP;
            }
        }, null, JSPropertyAttribute.DontDelete);
        
        return values;
    }
}
