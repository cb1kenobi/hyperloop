package com.appcelerator.hyperloop;

import android.app.Activity;
import android.os.Bundle;

import com.appcelerator.javascriptcore.JavaScriptCoreLibrary;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSGlobalContextRef;

public class HyperloopJNI {
    static {
        System.loadLibrary("HyperloopJNI");
    }
    
    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private JSGlobalContextRef context = null;
    
    public boolean HyperloopCreateVM() {
        this.context = new JSGlobalContextRef(NativeHyperloopCreateVM());
        return !this.context.isNullPointer();
    }
    
    public JSContextRef getJSContext() {
        return this.context;
    }
    
    public void release() {
        if (context != null) {
            jsc.JSGlobalContextRelease(this.context);
        }
    }

    public native void HyperloopCallActivityOnCreate(long jsContextRef, Activity activity, Bundle savedInstanceState);
    public native long NativeHyperloopCreateVM();
}
