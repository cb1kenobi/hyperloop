package com.appcelerator.javascriptcore;

import com.appcelerator.javascriptcore.opaquetypes.*;
import com.appcelerator.javascriptcore.enums.*;
import com.appcelerator.javascriptcore.callbacks.*;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

public class JavaScriptCorePerformanceTestOption3 {

    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();

    private static final int CALLBACK_TEST_COUNT = 10000;
    private static final String CALLBACK_TEST_STRING = "Hello, World!";
    private String testCreateAndCallObjectMethodScript;

    static {
        System.loadLibrary("JavaScriptCorePerformanceTestOption3");
    }

    public native boolean NativeSetup(MethodInvoker invoker, boolean useMethodCache);
    public native void NativeTestCreateNewObjects(long context, long globalObject);
    public native void NativeTestCreateAndCallObjectMethod(long context, long globalObject, String script);

    @Before
    public void setUp() throws Exception {
        testCreateAndCallObjectMethodScript = String.format(
                "var i; for (i = 0; i < %d; i++) { var obj = new this['TestObject'+i]('%s'); var object = obj.toString(); }",
                CALLBACK_TEST_COUNT, CALLBACK_TEST_STRING);
        NativeSetup(new MethodInvoker(), true);
    }

    @After
    public void tearDown() throws Exception {
    }

    @Test
    public void testCreateNewObjects() {
        JSVirtualMachine vm = new JSVirtualMachine();
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);

        NativeTestCreateNewObjects(context.p(), globalObject.p());

        vm.release();
    }

    @Test
    public void testCreateAndCallObjectMethod() {
        JSVirtualMachine vm = new JSVirtualMachine();
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);

        NativeTestCreateAndCallObjectMethod(context.p(), globalObject.p(), testCreateAndCallObjectMethodScript);

        vm.release();
    }

}

class MethodInvoker {
    public Object CallObject0(int methodId) {
        switch (methodId) {
            default: throw new JavaScriptException(String.format("Failed to invoke: method does not found: id:%d", methodId));
        }
    }
    public Object CallObject1(int methodId, Object arg1) throws Exception {
        switch (methodId) {
            case -2147483648: return String.valueOf(arg1);
            default: throw new JavaScriptException(String.format("Failed to invoke: method does not found: id:%d", methodId));
        }
    }
    public Object CallObjectMethod0(int methodId, Object self) {
        switch (methodId) {
            case -2147483646: return self.toString();
            default: throw new JavaScriptException(String.format("Failed to invoke: method does not found: id:%d", methodId));
        }
    }
}