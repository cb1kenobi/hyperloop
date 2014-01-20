package com.appcelerator.example.jscandroidbenchmark;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import com.appcelerator.javascriptcore.JSVirtualMachine;
import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.java.JSJavaObjectUtil;
import com.appcelerator.javascriptcore.java.JS_EmptyObject;
import com.appcelerator.javascriptcore.java.JS_android_app_Activity;
import com.appcelerator.javascriptcore.java.JS_android_os_Bundle;
import com.appcelerator.javascriptcore.java.JS_android_util_Log;
import com.appcelerator.javascriptcore.java.JS_java_lang_Object;
import com.appcelerator.javascriptcore.java.JS_java_lang_String;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;

public class JavaScriptCoreJavaActivity extends Activity {
    protected JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    protected JSVirtualMachine vm = new JSVirtualMachine();
    
    public JSContextRef getJSContext() {
        return vm.getDefaultContext();
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        long benchmarkStart = System.currentTimeMillis();
        
        try {
            JSContextRef context = vm.getDefaultContext();
            JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);

            registerJS_java_lang(context, globalObject); /* java.lang */
            registerJS_android_util(context, globalObject); /* android.util */
            JS_EmptyObject.registerClass(context, globalObject); /* EmptyObject which holds nothing */

            JSValueRef exception = JSValueRef.Null();
            context.evaluateScript(getScript(), globalObject, exception);
            JSJavaObjectUtil.checkJSException(context, exception);

            /* save current Activity */
            JSObjectRef thisObject = JS_android_app_Activity.createJSObject(context, this);

            JSObjectRef onCreateFunc = jsc.JSObjectGetProperty(context, globalObject, "onCreate", exception).toObject();

            /* save current savedInstanceState */
            JSValueArrayRef args = new JSValueArrayRef(1);
            args.set(0, JS_android_os_Bundle.createJSObject(context, savedInstanceState));

            if (jsc.JSObjectIsFunction(context, onCreateFunc)) {
                exception = JSValueRef.Null();
                jsc.JSObjectCallAsFunction(context, onCreateFunc, thisObject, args, exception);
                JSJavaObjectUtil.checkJSException(context, exception);
            }
        } catch (Exception e) {
            new AlertDialog.Builder(this).setTitle("OnCreate Error").setMessage(e.getMessage()).setNeutralButton("Close", null).show();
        }
        
        android.util.Log.d("JavaScriptCore", String.format("onCreate is done by %d msec", (System.currentTimeMillis() - benchmarkStart)));
    }
    
    private void registerJS_java_lang(JSContextRef context, JSObjectRef globalObject) {
        String[] namespace = {"java", "lang"};
        JSObjectRef parentObject = JSJavaObjectUtil.registerJSNamespace(context, globalObject, namespace);
        JS_java_lang_Object.registerClass(context, parentObject);
        JS_java_lang_String.registerClass(context, parentObject);
    }
    
    private void registerJS_android_util(JSContextRef context, JSObjectRef globalObject) {
        String[] namespace = {"android", "util"};
        JSObjectRef parentObject = JSJavaObjectUtil.registerJSNamespace(context, globalObject, namespace);
        JS_android_util_Log.registerClass(context, parentObject);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        /*
         * JSVirtualMachine should be released *before* unloading JS class definition.
         * This releases global JavaScript context which also invokes finalize callback for the JS objects.
         */
        vm.release();
        vm = null;
        
        /* 
         * Cleanup class definitions: this is needed to release native memory otherwise memory leaks.
         * TODO: Need simpler way to do this (manager class or something like that) 
         */
        JS_java_lang_Object.getJSClass().getDefinition().dispose();
        JS_java_lang_String.getJSClass().getDefinition().dispose();
        JS_android_util_Log.getJSClass().getDefinition().dispose();
        JS_EmptyObject.getJSClass().getDefinition().dispose();
        
    }

    protected String createStringWithContentsOfFile(String fileName) {
        String newline = System.getProperty("line.separator");
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(this.getClass().getResourceAsStream(fileName), "UTF-8"));
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append(newline);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {if (reader != null) reader.close(); } catch (IOException e) {}
        }
        return sb.toString();
    }
    
    protected String getScript() {
        return createStringWithContentsOfFile("/com/appcelerator/javascriptcore/java/EmptyObjectTest.js");
    }
}
