package com.appcelerator.javascriptcore.java;

import android.content.Context;
import android.view.View;
import android.view.View.OnTouchListener;
import android.view.ViewGroup.MarginLayoutParams;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticFunctions;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;

public class JS_android_view_View extends JSClassDefinition implements JSObjectCallAsConstructorCallback {
    
    private static final String[] NAMESPACE = {"android", "view"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    private static JSValueRef nullObject;

    public static boolean registerClass(JSContextRef context, JSObjectRef parentObject) {
    	nullObject = jsc.JSValueMakeNull(context);
    	jsc.JSValueProtect(context, nullObject);
    	
    	JSValueRef exception = JSValueRef.Null();
        JSObjectRef object = jsc.JSObjectMake(context, getJSClass());
        
        /* View.OnTouchListener */
        JS_android_view_View_OnTouchListener.registerClass(context, object);
        
        jsc.JSObjectSetProperty(context, parentObject, getJSClassName(), object, JSPropertyAttribute.DontDelete, exception);

        return jsc.JSValueIsNull(context, exception);
    }

    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_view_View definition = new JS_android_view_View();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.callAsConstructor = definition;
            definition.staticFunctions = definition.createStaticFunctions();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, View mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    public static String getJSClassName() {
        return "View";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }

    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        
        functions.add("getWidth", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                View jobject = (View)thisObject.getPrivateObject();
                return jsc.JSValueMakeNumber(context, jobject.getWidth());
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        functions.add("getHeight", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                View jobject = (View)thisObject.getPrivateObject();
                return jsc.JSValueMakeNumber(context, jobject.getHeight());
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        functions.add("setLayoutParams", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    View jobject = (View)thisObject.getPrivateObject();
                    Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
                    if (param0 instanceof MarginLayoutParams) {
                        MarginLayoutParams  params = (MarginLayoutParams)param0;
                        jobject.setLayoutParams(params);
                    }
                }
                return nullObject;
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        functions.add("getLayoutParams", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                View jobject = (View)thisObject.getPrivateObject();
                return JS_android_widget_FrameLayout_LayoutParams.createJSObject(context, jobject.getLayoutParams());
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        functions.add("setBackgroundColor", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    View jobject = (View)thisObject.getPrivateObject();
                    JSValueRef param0 = arguments.get(context, 0);
                    if (param0.isNumber()) {
                        jobject.setBackgroundColor(param0.toInt());
                    } else {
                        JSJavaObjectUtil.handleJSException(new IllegalArgumentException("setBackgroundColor needs int parameter"), context, exception);
                    }
                }
                return nullObject;
            }
        }, JSPropertyAttribute.DontDelete) ;

        functions.add("setOnTouchListener", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                if (argumentCount > 0) {
                    View jobject = (View)thisObject.getPrivateObject();
                    Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
                    if (param0 instanceof OnTouchListener) {
                        OnTouchListener  params = (OnTouchListener)param0;
                        jobject.setOnTouchListener(params);
                    }
                }
                return nullObject;
            }
        }, JSPropertyAttribute.DontDelete) ;
        
        return functions;
    }
    
    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        View jobject = null;
        if (argumentCount > 0) {
            Object param0 = arguments.get(context, 0).castToObject().getPrivateObject();
            if (param0 instanceof Context) {
                jobject = new View((Context)param0);
            }
        }
        return jsc.JSObjectMake(context, jsClassRef, jobject);
    }

}
