package com.appcelerator.javascriptcore.java;

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
                jsc.JSObjectSetPrivate(jsObject, new HyperloopOnTouchListener(context, jsObject, onTouchFunc));
            }
            return jsObject;
        }
        return jsObject;
    }
    
    private class HyperloopOnTouchListener implements OnTouchListener {
        
        JSObjectRef thisObject;
        JSObjectRef onTouchFunc;
        JSValueRef onTouchException = JSValueRef.Null();
        JSContextRef currentContext = null;
        JSValueArrayRef argv = new JSValueArrayRef(2);
        JSObjectRef arg0;
        JSObjectRef arg1;
        
        public HyperloopOnTouchListener(JSContextRef context, JSObjectRef thisObject, JSObjectRef onTouchFunc) {
            // prepare argument objects
            arg0 = JS_android_view_View.createJSObject(context, null);
            arg1 = JS_android_view_MotionEvent.createJSObject(context, null);
            argv.set(0, arg0);
            argv.set(1, arg1);
            
            this.thisObject = thisObject;
            this.onTouchFunc = onTouchFunc;
        }
        
        @Override
        public boolean onTouch(View v, MotionEvent event) {
            // TODO need safer way to get global current context reference (Singleton etc)
            if (currentContext == null) {
                currentContext = ((JavaScriptActivity)v.getContext()).getJSContext();
            }

            jsc.JSObjectSetPrivate(arg0, v);
            jsc.JSObjectSetPrivate(arg1, event);

            return jsc.JSObjectCallAsFunction(currentContext, onTouchFunc, thisObject, argv, onTouchException).toBoolean();
        }
    }
}
