package com.appcelerator.javascriptcore.java;

import android.widget.FrameLayout.LayoutParams;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectGetPropertyCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectSetPropertyCallback;
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

public class JS_android_widget_FrameLayout_LayoutParams extends JSClassDefinition implements JSObjectCallAsConstructorCallback {
    
    private static final String[] NAMESPACE = {"android", "widget", "FrameLayout"};
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
            JS_android_widget_FrameLayout_LayoutParams definition = new JS_android_widget_FrameLayout_LayoutParams();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            definition.callAsConstructor = definition;
            definition.staticValues = definition.createStaticValues();
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
        return "LayoutParams";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }

    protected JSStaticValues createStaticValues() {
        JSStaticValues values = new JSStaticValues();
        /* LayoutParams.MATCH_PARENT */
        values.add("MATCH_PARENT", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
                return jsc.JSValueMakeNumber(ctx, LayoutParams.MATCH_PARENT);
            }
        }, null, JSPropertyAttribute.DontDelete);
        
        /* LayoutParams.topMargin */
        values.add("topMargin", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
                LayoutParams jobject = (LayoutParams)object.getPrivateObject();
                return jsc.JSValueMakeNumber(ctx, jobject.topMargin);
            }}, new JSObjectSetPropertyCallback() {
                @Override
                public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                    LayoutParams jobject = (LayoutParams)object.getPrivateObject();
                    if (value.isNumber()) {
                        jobject.topMargin = value.toInt();
                        return true;
                    }
                    return false;
                }
            }, JSPropertyAttribute.DontDelete);
        
        /* LayoutParams.leftMargin */
        values.add("leftMargin", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
                LayoutParams jobject = (LayoutParams)object.getPrivateObject();
                return jsc.JSValueMakeNumber(ctx, jobject.leftMargin);
            }}, new JSObjectSetPropertyCallback() {
                @Override
                public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                    LayoutParams jobject = (LayoutParams)object.getPrivateObject();
                    if (value.isNumber()) {
                        jobject.leftMargin = value.toInt();
                        return true;
                    }
                    return false;
                }
            }, JSPropertyAttribute.DontDelete);
        return values;
    }
    
    protected JSStaticFunctions createStaticFunctions() {
        JSStaticFunctions functions = new JSStaticFunctions();
        functions.add("setMargins", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                             JSObjectRef thisObject, int argumentCount,
                                             JSValueArrayRef arguments, Pointer exception) {
                LayoutParams jobject = (LayoutParams)thisObject.getPrivateObject();
                
                if (argumentCount >= 4) {
                    int param0 = arguments.get(context, 0).toInt();
                    int param1 = arguments.get(context, 1).toInt();
                    int param2 = arguments.get(context, 2).toInt();
                    int param3 = arguments.get(context, 3).toInt();
                    jobject.setMargins(param0, param1, param2, param3);
                }
                
                return jsc.JSValueMakeNull(context);
            }
        }, JSPropertyAttribute.DontDelete) ;

        return functions;
    }    
    @Override
    public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
            int argumentCount, JSValueArrayRef arguments, Pointer exception) {
        LayoutParams jobject = null;
        if (argumentCount >= 3) {
            int param0 = arguments.get(context, 0).toInt();
            int param1 = arguments.get(context, 1).toInt();
            int param2 = arguments.get(context, 2).toInt();
            
            jobject = new LayoutParams(param0, param1, param2);
        }
        return jsc.JSObjectMake(context, jsClassRef, jobject);
    }
}
