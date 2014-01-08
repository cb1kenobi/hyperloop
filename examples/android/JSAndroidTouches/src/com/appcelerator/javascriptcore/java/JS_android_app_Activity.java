package com.appcelerator.javascriptcore.java;

import android.app.Activity;
import android.widget.FrameLayout;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
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

public class JS_android_app_Activity extends JSClassDefinition {
    
    private static final String[] NAMESPACE = {"android", "app"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    
    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_app_Activity definition = new JS_android_app_Activity();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.staticFunctions = definition.createStaticFunctions();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, Activity mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    public static String getJSClassName() {
        return "Activity";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }
    
    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("setContentView", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    Activity jobject = (Activity)thisObject.getPrivateObject();
                    Object paramObj = arguments.get(context, 0).castToObject().getPrivateObject();
                    if (paramObj instanceof FrameLayout) {
                        FrameLayout params = (FrameLayout)paramObj;
                        jobject.setContentView(params);
                    }
                }
                return jsc.JSValueMakeNull(context);
            }
        }, JSPropertyAttribute.DontDelete) ;

        return functions;
    }
}
