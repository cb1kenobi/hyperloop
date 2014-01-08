package com.appcelerator.javascriptcore.java;

import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.example.JavaScriptActivity;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;

public class JS_android_view_View_OnTouchListener extends JSClassDefinition implements JSObjectCallAsConstructorCallback {
    
    private static final String[] NAMESPACE = {"android", "view", "View"};
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
            JS_android_view_View_OnTouchListener definition = new JS_android_view_View_OnTouchListener();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.callAsConstructor = definition;
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, Object mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    public static String getJSClassName() {
        return "OnTouchListener";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }
    
    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {

        final JSObjectRef jsObject = jsc.JSObjectMake(context, jsClassRef);
        if (argumentCount > 0) {
            JSObjectRef param0 = arguments.get(context, 0).castToObject();
            final JSObjectRef onTouchFunc = jsc.JSObjectGetProperty(context, param0, "onTouch", null).castToObject();
            if (jsc.JSObjectIsFunction(context, onTouchFunc)) {
                OnTouchListener jobject = new OnTouchListener() {
                    @Override
                    public boolean onTouch(View v, MotionEvent event) {
                        try {
                            // TODO need safer way to get global current context reference (Singleton etc)
                            JavaScriptActivity main = (JavaScriptActivity)v.getContext();
                            JSContextRef currentContext = main.getJSContext();

                            JSValueRef exception = JSValueRef.Null();
                            JSValueArrayRef argv = new JSValueArrayRef(2);

                            argv.set(0, JS_android_view_View.createJSObject(currentContext, v));
                            argv.set(1, JS_android_view_MotionEvent.createJSObject(currentContext, event));

                            JSValueRef result = jsc.JSObjectCallAsFunction(currentContext, onTouchFunc, jsObject, argv, exception);
                            JSJavaObjectUtil.checkJSException(currentContext, exception);
                            
                            return result.toBoolean();
                        } catch (Exception e) {
                            Log.d("JavaScriptActivity", "Exception during onTouch", e);
                        }
                        return false;
                    }
                };
                jsc.JSObjectSetPrivate(jsObject, jobject);
            }
            return jsObject;
        }
        return jsObject;
    }
}
