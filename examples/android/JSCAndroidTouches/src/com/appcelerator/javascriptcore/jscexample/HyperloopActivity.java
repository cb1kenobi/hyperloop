package com.appcelerator.javascriptcore.jscexample;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import com.appcelerator.hyperloop.HyperloopJNI;
import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;

public abstract class HyperloopActivity extends Activity {
    protected JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    protected HyperloopJNI hyperloop = new HyperloopJNI();
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        long benchmarkStart = System.currentTimeMillis();
        try {
            hyperloop.HyperloopCreateVM();
            
            JSContextRef jsContext = hyperloop.getJSContext();
            
            JSObjectRef globalObject = jsc.JSContextGetGlobalObject(jsContext);
            JSValueRef exception = JSValueRef.Null();
            jsContext.evaluateScript(getScript(), globalObject, exception);
            JSJavaObjectUtil.checkJSException(jsContext, exception);
            
            hyperloop.HyperloopCallActivityOnCreate(jsContext.p(), this, savedInstanceState);
            
        } catch (Exception e) {
            new AlertDialog.Builder(this).setTitle("OnCreate Error").setMessage(e.getMessage()).setNeutralButton("Close", null).show();
        }
        android.util.Log.d("JavaScriptCore", String.format("onCreate is done by %d msec", (System.currentTimeMillis() - benchmarkStart)));
    }
    
    public JSContextRef getJSContext() {
        return hyperloop.getJSContext();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        hyperloop.release();
        hyperloop = null;
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
    
    protected abstract String getScript();
}
