package com.appcelerator.hyperloop;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.PrintWriter;

import com.appcelerator.javascriptcore.*;
import com.appcelerator.javascriptcore.opaquetypes.*;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

public class HyperloopTest {

    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private HyperloopJNI hyperloop;
    private JSContextRef context;

    @Before
    public void setUp() throws Exception {
        hyperloop = new HyperloopJNI();
        context   = hyperloop.HyperloopCreateVM();
    }

    @After
    public void tearDown() throws Exception {
        hyperloop.release();
    }

    @Test
    public void testHyperloopCreateVM() {
        assertTrue(context != null);
        assertTrue(!context.isNullPointer());
    }

    @Test
    public void testJava_java_lang_Object() {
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        JSValueRef exception = JSValueRef.Null();
        JSValueRef result = context.evaluateScript("new java.lang.Object();", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isObject());

        exception = JSValueRef.Null();
        result = context.evaluateScript("var object = new java.lang.Object(); object.equals(object);", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean());

        exception = JSValueRef.Null();
        result = context.evaluateScript("object.toString();", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isString());

        exception = JSValueRef.Null();
        result = context.evaluateScript("(object instanceof java.lang.Object)", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean());

        exception = JSValueRef.Null();
        result = context.evaluateScript("(object instanceof java.lang.String)", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertFalse(result.toBoolean()); /* Object is not a instance of String */
    }

    @Test
    public void testJava_java_lang_String() {
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        JSValueRef exception = JSValueRef.Null();
        JSValueRef result = context.evaluateScript("new java.lang.String();", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isObject());

        exception = JSValueRef.Null();
        result = context.evaluateScript("var string = new java.lang.String('Hello, World'); string.equals(string);", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean());

        exception = JSValueRef.Null();
        result = context.evaluateScript("string.equals(new java.lang.String('Hello, World'));", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean());

        exception = JSValueRef.Null();
        result = context.evaluateScript("(string instanceof java.lang.String)", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean());

        exception = JSValueRef.Null();
        result = context.evaluateScript("(string instanceof java.lang.Object)", globalObject, exception);
        checkJSException(context, exception);
        assertTrue(result.isBoolean());
        assertTrue(result.toBoolean()); /* String is a instance of Object */
    }

    public void checkJSException(JSContextRef context, JSValueRef exception) {
        if (!jsc.JSValueIsNull(context, exception)) {
            throw new JavaScriptException(exception.toString());
        }
    }
}
