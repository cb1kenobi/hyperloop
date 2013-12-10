package com.appcelerator.javascriptcore;

import com.appcelerator.javascriptcore.opaquetypes.*;
import com.appcelerator.javascriptcore.enums.*;
import com.appcelerator.javascriptcore.callbacks.*;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

public class JavaScriptCorePerformanceTestOption1 {

    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();

    private static final int CALLBACK_TEST_COUNT = 10000;
    private static final String CALLBACK_TEST_STRING = "Hello, World!";
    private String testCreateAndCallObjectMethodScript;

    @Before
    public void setUp() throws Exception {
        testCreateAndCallObjectMethodScript = String.format(
                "var i; for (i = 0; i < %d; i++) { var obj = new this['TestObject'+i]('%s'); var object = obj.toString(); }",
                CALLBACK_TEST_COUNT, CALLBACK_TEST_STRING);
    }

    @After
    public void tearDown() throws Exception {
    }

    private JSClassRef createNewClass(JSContextRef context) {
        // Note that JSClassDefinition object can be cached.
        // We didn't cache it here because we want to simulate a different object initialization
        JavaTestObjectCallback callback = new JavaTestObjectCallback();
        JSClassDefinition definition = new JSClassDefinition();
        definition.initialize        = callback;
        definition.callAsConstructor = callback;
        definition.staticFunctions   = callback.staticFunctions;
        definition.finalize          = callback;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        callback.setJSClass(jsClass);

        return jsClass;
    }

    private JSObjectRef registerNewJSClass(JSContextRef context, JSObjectRef parentObject, String name) {
        JSClassRef jsClass = createNewClass(context);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);

        // Register new object with different name
        jsc.JSObjectSetProperty(context, parentObject, name, jsObj, JSPropertyAttribute.None.getValue());

        return jsObj;
    }

    /*
     * Create JavaScript objects that retain Java String
     */
    @Test
    public void testCreateNewObjects() {
        JSVirtualMachine vm = new JSVirtualMachine();
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);

        for (int i = 0; i < CALLBACK_TEST_COUNT; i++) {
            // Register new object with different name
            JSObjectRef jsClassObject = registerNewJSClass(context, globalObject, String.format("TestObject%d", i));
        }

        vm.release();
    }

    /*
     * Create JavaScript objects that retain Java String and call 'toString' method for each objects
     */
    @Test
    public void testCreateAndCallObjectMethod() {
        JSVirtualMachine vm = new JSVirtualMachine();
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);

        for (int i = 0; i < CALLBACK_TEST_COUNT; i++) {
            // Register new object with different name
            JSObjectRef jsClassObject = registerNewJSClass(context, globalObject, String.format("TestObject%d", i));
        }

        // Initialize the objects and call 'toString' method
        context.evaluateScript(testCreateAndCallObjectMethodScript);

        vm.release();
    }
}

class JavaTestObjectGetStringCallback extends JSStaticFunction implements JSObjectCallAsFunctionCallback {

    JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();

    JavaTestObjectGetStringCallback() {
        name = "toString";
        attributes = 0;
        callAsFunction = this;
    }

    public JSValueRef apply(JSContextRef ctx, JSObjectRef function,
            JSObjectRef thisObject, int argumentCount,
            JSValueRef[] arguments, JSValueRef exception) {
        Object object = jsc.JSObjectGetPrivate(thisObject);
        //assertTrue(JavaScriptCorePerformanceTest.CALLBACK_TEST_STRING.equals(object.toString()));
        return jsc.JSValueMakeString(ctx, object.toString());
    }
}

class JavaTestObjectCallback implements JSObjectInitializeCallback, JSObjectFinalizeCallback, JSObjectCallAsConstructorCallback {
    JSClassRef jsClass;
    JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();

    // It's safe to cache callback object as static because it doesn't have any state
    public static JSStaticFunction[] staticFunctions = {
        new JavaTestObjectGetStringCallback()
    };

    public void setJSClass(JSClassRef jsClass) {
        this.jsClass = jsClass;
    }

    /* 
     * CallAsConstructor
     * Store String object into JS object
     */
    public JSObjectRef apply(JSContextRef ctx, JSObjectRef constructor,
            int argumentCount, JSValueRef[] arguments,
            JSValueRef exception) {
        String string = "";
        if (argumentCount > 0) {
            string = arguments[0].toString();
        }
        jsc.JSObjectMake(ctx, jsClass, string);
        return constructor;
    }

    /*
     * Initialize
     */
    public void apply(JSContextRef ctx, JSObjectRef object) {

    }

    /*
     * Finalize
     */
    public void apply(JSObjectRef object) {
        jsClass = null;
        jsc = null;
    }
}
