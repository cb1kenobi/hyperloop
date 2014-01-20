package com.appcelerator.javascriptcore.java;

import android.os.Bundle;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;

public class JS_android_os_Bundle extends JSClassDefinition {
    private static final String[] NAMESPACE = {"android", "os"};
    private static final JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private static JSClassRef jsClassRef = null;
    
    public static JSClassRef getJSClass() {
        if (jsClassRef == null) {
            JS_android_os_Bundle definition = new JS_android_os_Bundle();
            definition.className   = getJSClassName();
            definition.parentClass = JS_java_lang_Object.getJSClass();
            jsClassRef = jsc.JSClassCreate(definition);
            jsc.JSClassRetain(jsClassRef);
        }
        return jsClassRef;
    }
    
    public static JSObjectRef createJSObject(JSContextRef context, Bundle mine) {
        return jsc.JSObjectMake(context, getJSClass(), mine);
    }
    
    @Override
    public void dispose() {
    	super.dispose();
    	jsClassRef = null;
    }
    
    public static String getJSClassName() {
        return "Bundle";
    }
    
    public static String[] getNamespace() {
        return NAMESPACE;
    }

}
