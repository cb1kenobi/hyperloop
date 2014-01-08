package com.appcelerator.javascriptcore.java;
import android.app.Activity;
import android.view.View;
import android.widget.FrameLayout;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticFunctions;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;

public class JS_android_widget_FrameLayout extends JSClassDefinition implements JSObjectCallAsConstructorCallback {
    private static final String[] NAMESPACE = {"android", "widget"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    
    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
        JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        
        /* FrameLayout.LayoutParams */
        JS_android_widget_FrameLayout_LayoutParams.registerClass(context, object);
        
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }
    
    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_widget_FrameLayout definition = new JS_android_widget_FrameLayout();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.callAsConstructor = definition;
            definition.staticFunctions = definition.createStaticFunctions();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, Object mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    public static String getJSClassName() {
        return "FrameLayout";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }
    
    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("setLayoutParams", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    FrameLayout jobject = (FrameLayout)thisObject.getPrivateObject();
                    Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
                    if (param0 instanceof FrameLayout.LayoutParams) {
                        FrameLayout.LayoutParams params = (FrameLayout.LayoutParams)param0;
                        jobject.setLayoutParams(params);
                    }
                }
                return jsc.JSValueMakeNull(context);
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        functions.add("addView", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    FrameLayout jobject = (FrameLayout)thisObject.getPrivateObject();
                    Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
                    if (param0 instanceof View) {
                        View params = (View)param0;
                        jobject.addView(params);
                    }
                }
                return jsc.JSValueMakeNull(context);
            }
        }, JSPropertyAttribute.DontDelete) ;

        return functions;
    }

    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        FrameLayout jobject = null;
        if (argumentCount > 0) {
            Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
            if (param0 instanceof Activity) {
                jobject = new FrameLayout((Activity)param0);
            }
        }
        return jsc.JSObjectMake(context, jsClassRef, jobject);
    }
}
