package com.appcelerator.hyperloop;

import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;

public class HyperloopJNI {
    static {
        System.loadLibrary("HyperloopJNI");
    }
    public JSContextRef HyperloopCreateVM() {
        return new JSContextRef(NativeHyperloopCreateVM());
    }

    public void release() {

    }

    public native long NativeHyperloopCreateVM();
}
