package com.appcelerator.javascriptcore;

import com.appcelerator.javascriptcore.opaquetypes.*;
import com.appcelerator.javascriptcore.callbacks.*;
import com.appcelerator.javascriptcore.enums.*;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

/*
 * Java port of webkit/Source/JavaScriptCore/API/tests/testapi.c
 */
public class  TestAPI {
    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    
    private JSValueRef jsGlobalValue; // non-stack value for testing JSValueProtect
    private JSGlobalContextRef context;
    private JSValueRef jsNumberValue;
    private JSObjectRef aHeapRef;
    
    private JSClassDefinition MyObject_definition;
    private JSClassDefinition MyObject_convertToTypeWrapperDefinition;
    private JSClassDefinition MyObject_nullWrapperDefinition;
    private JSClassDefinition PropertyCatchalls_definition;
    private JSClassDefinition EvilExceptionObject_definition;
    private JSClassDefinition EmptyObject_definition;
    private JSClassDefinition globalObjectClassDefinition;
    
    private boolean TestInitializeFinalize;
    private boolean Base_didFinalize = false;
    
    private JSObjectCallAsFunctionCallback print_callAsFunction;
    private JSObjectCallAsConstructorCallback myConstructor_callAsConstructor;
    private JSObjectCallAsConstructorCallback myBadConstructor_callAsConstructor;
    
    private static JSClassRef jsMyObjectClassRef;
    private static JSClassRef jsPropertyCatchallsClassRef;
    private static JSClassRef jsEvilExceptionObjectClassRef;
    private static JSClassRef jsEmptyObjectClassRef;
    private static JSClassRef jsBaseObjectClassRef;
    private static JSClassRef jsDerivedObjectClassRef;
    private static JSClassRef jsDerived2ObjectClassRef;

    @Before
    public void setUp() throws Exception {
    	/* Static values */
    	JSStaticValues evilStaticValues = new JSStaticValues();
    	evilStaticValues.add("nullGetSet", null, null, JSPropertyAttribute.None.getValue());    	
    	evilStaticValues.add("nullGetForwardSet", null, new JSObjectSetPropertyCallback() {
			@Override
			public boolean setProperty(JSContextRef context, JSObjectRef object,
					String propertyName, JSValueRef value, Pointer exception) {
			    return false; // Forward to parent class.
			}
    	}, JSPropertyAttribute.None.getValue());
    	
    	/* Static functions */
    	JSStaticFunctions evilStaticFunctions = new JSStaticFunctions();
    	evilStaticFunctions.add("nullCall", null, JSPropertyAttribute.None.getValue());
    	
    	/* Class definitions */
    	MyObject_definition = new MyObjectDefinition();
    	MyObject_definition.staticValues = evilStaticValues;
    	MyObject_definition.staticFunctions = evilStaticFunctions;
    	
    	MyObject_convertToTypeWrapperDefinition = new MyObject_convertToTypeWrapperDefinition();
    	
    	MyObject_nullWrapperDefinition = new JSClassDefinition();
    	MyObject_nullWrapperDefinition.version = 0;
    	MyObject_nullWrapperDefinition.attributes = JSClassAttribute.None.getValue();
    	MyObject_nullWrapperDefinition.className = "MyObject";
    	
    	PropertyCatchalls_definition   = new PropertyCatchallsDefinition();
    	EvilExceptionObject_definition = new EvilExceptionObjectDefinition();
    	EmptyObject_definition = new JSClassDefinition();
    	
    	print_callAsFunction = new JSObjectCallAsFunctionCallback() {
			@Override
			public JSValueRef callAsFunction(JSContextRef context,
					JSObjectRef function, JSObjectRef object, int argumentCount,
					JSValueArrayRef arguments, Pointer exception) {
			    if (argumentCount > 0) {
			    	System.out.println(arguments.get(context, 0).toString());
			    }
			    return jsc.JSValueMakeUndefined(context);
			}
    	};
    	myConstructor_callAsConstructor = new JSObjectCallAsConstructorCallback() {
			@Override
			public JSObjectRef callAsConstructor(JSContextRef context,
					JSObjectRef constructor, int argumentCount, JSValueArrayRef arguments,
					Pointer exception) {
			    JSObjectRef result = jsc.JSObjectMake(context, null);
			    if (argumentCount > 0) {
			        jsc.JSObjectSetProperty(context, result, "value", arguments.get(context, 0), JSPropertyAttribute.None.getValue(), null);
			    }
			    
			    return result;
			}
    	};
    	myBadConstructor_callAsConstructor = new JSObjectCallAsConstructorCallback() {
			@Override
			public JSObjectRef callAsConstructor(JSContextRef context,
					JSObjectRef constructor, int argumentCount, JSValueArrayRef arguments,
					Pointer exception) {
				return null;
			}
    	};

        globalObjectClassDefinition = new JSClassDefinition();
        globalObjectClassDefinition.initialize = new JSObjectInitializeCallback() {
            public void initialize(JSContextRef context, JSObjectRef object) {
                // Ensure that an execution context is passed in
                assertTrue(context.p() != 0);

                // Ensure that the global object is set to the object that we were passed
                JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
                assertTrue(globalObject.p() != 0);
                assertTrue(object.equals(globalObject));

                // Ensure that the standard global properties have been set on the global object
                JSObjectRef arrayConstructor = jsc.JSValueToObject(context, jsc.JSObjectGetProperty(context, globalObject, "Array", null), null);
                assertTrue(arrayConstructor.p() != 0);
            }
        };
        JSStaticValues    globalObject_staticValues    = new JSStaticValues();
        JSStaticFunctions globalObject_staticFunctions = new JSStaticFunctions();

        globalObject_staticValues.add("globalStaticValue", 
            new JSObjectGetPropertyCallback() {
                public JSValueRef getProperty(JSContextRef context, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                    return jsc.JSValueMakeNumber(context, 3);
                }
            },
            new JSObjectSetPropertyCallback() {
                public boolean setProperty(JSContextRef context, JSObjectRef object,
                                String propertyName, JSValueRef value, Pointer exception) {
                    // *exception = jsc.JSValueMakeNumber(context, 3);
                    exception.update(jsc.JSValueMakeNumber(context, 3));
                    return true;
                }
            }, JSPropertyAttribute.None.getValue());

        globalObject_staticFunctions.add("globalStaticFunction", 
            new JSObjectCallAsFunctionCallback() {
                public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                                 JSObjectRef thisObject, int argumentCount,
                                                 JSValueArrayRef arguments, Pointer exception) {
                    return jsc.JSValueMakeNumber(context, 3);
                }
            }, JSPropertyAttribute.None.getValue()) ;
        globalObject_staticFunctions.add("gc", 
            new JSObjectCallAsFunctionCallback() {
                public JSValueRef callAsFunction(JSContextRef context, JSObjectRef function,
                                                 JSObjectRef thisObject, int argumentCount,
                                                 JSValueArrayRef arguments, Pointer exception) {
                    jsc.JSGarbageCollect(context);
                    return jsc.JSValueMakeUndefined(context);
                }
            }, JSPropertyAttribute.None.getValue()) ;
        globalObjectClassDefinition.staticValues = globalObject_staticValues;
        globalObjectClassDefinition.staticFunctions = globalObject_staticFunctions;
        globalObjectClassDefinition.attributes = JSClassAttribute.NoAutomaticPrototype.getValue();
    }

    @After
    public void tearDown() throws Exception {
    	
    }
    
    @Test
    public void testMain() {
        // Test garbage collection with a fresh context
        context = jsc.JSGlobalContextCreateInGroup(null, null);
        TestInitializeFinalize = true;

        JSObjectRef o = jsc.JSObjectMake(context, Derived_class(context), 1);
        assertTrue(jsc.JSObjectGetPrivate(o).equals(3));

        jsc.JSGlobalContextRelease(context);
        TestInitializeFinalize = false;

        assertTrue(Base_didFinalize);
    
        JSClassRef globalObjectClass = jsc.JSClassCreate(globalObjectClassDefinition);
        context = jsc.JSGlobalContextCreateInGroup(null, globalObjectClass);
        JSContextGroupRef contextGroup = jsc.JSContextGetGroup(context);
        jsc.JSGlobalContextRetain(context);
        jsc.JSGlobalContextRelease(context);
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        assertTrue(jsc.JSValueIsObject(context, globalObject));

        JSValueRef jsUndefined = jsc.JSValueMakeUndefined(context);
        JSValueRef jsNull = jsc.JSValueMakeNull(context);
        JSValueRef jsTrue = jsc.JSValueMakeBoolean(context, true);
        JSValueRef jsFalse = jsc.JSValueMakeBoolean(context, false);
        JSValueRef jsZero = jsc.JSValueMakeNumber(context, 0);
        JSValueRef jsOne = jsc.JSValueMakeNumber(context, 1);
        JSValueRef jsOneThird = jsc.JSValueMakeNumber(context, 1.0 / 3.0);
        JSValueRef jsEmptyString = jsc.JSValueMakeString(context, "");
        JSValueRef jsOneString = jsc.JSValueMakeString(context, "1");
        JSObjectRef jsObjectNoProto = jsc.JSObjectMake(context, null);
        jsc.JSObjectSetPrototype(context, jsObjectNoProto, jsc.JSValueMakeNull(context));        

        assertTrue(jsc.JSValueGetType(context, null) == JSType.Null);
        assertTrue(jsc.JSValueGetType(context, jsUndefined) == JSType.Undefined);
        assertTrue(jsc.JSValueGetType(context, jsNull) == JSType.Null);
        assertTrue(jsc.JSValueGetType(context, jsTrue) == JSType.Boolean);
        assertTrue(jsc.JSValueGetType(context, jsFalse) == JSType.Boolean);
        assertTrue(jsc.JSValueGetType(context, jsZero) == JSType.Number);
        assertTrue(jsc.JSValueGetType(context, jsOne) == JSType.Number);
        assertTrue(jsc.JSValueGetType(context, jsOneThird) == JSType.Number);
        assertTrue(jsc.JSValueGetType(context, jsOneString) == JSType.String);
        assertTrue(jsc.JSValueGetType(context, jsEmptyString) == JSType.String);

        assertTrue(!jsc.JSValueIsBoolean(context, null));
        assertTrue(!jsc.JSValueIsObject(context, null));
        assertTrue(!jsc.JSValueIsString(context, null));
        assertTrue(!jsc.JSValueIsNumber(context, null));
        assertTrue(!jsc.JSValueIsUndefined(context, null));
        assertTrue(jsc.JSValueIsNull(context, null));
        assertTrue(jsc.JSObjectCallAsFunction(context, null, null, null, null).isNullPointer());
        assertTrue(jsc.JSObjectCallAsConstructor(context, null, null, null).isNullPointer());
        assertTrue(!jsc.JSObjectIsConstructor(context, null));
        assertTrue(!jsc.JSObjectIsFunction(context, null));        

        JSObjectRef propertyCatchalls = jsc.JSObjectMake(context, PropertyCatchalls_class(context));
        jsc.JSObjectSetProperty(context, globalObject, "PropertyCatchalls", propertyCatchalls, JSPropertyAttribute.None.getValue(), null);

        JSObjectRef myObject = jsc.JSObjectMake(context, MyObject_class(context));
        jsc.JSObjectSetProperty(context, globalObject, "MyObject", myObject, JSPropertyAttribute.None.getValue(), null);

        JSObjectRef EvilExceptionObject = jsc.JSObjectMake(context, EvilExceptionObject_class(context));
        jsc.JSObjectSetProperty(context, globalObject, "EvilExceptionObject", EvilExceptionObject, JSPropertyAttribute.None.getValue(), null);

        JSObjectRef EmptyObject = jsc.JSObjectMake(context, EmptyObject_class(context));
        jsc.JSObjectSetProperty(context, globalObject, "EmptyObject", EmptyObject, JSPropertyAttribute.None.getValue(), null);

        JSObjectRef aStackRef = jsc.JSObjectMakeArray(context, null, null);
        aHeapRef = aStackRef;
        jsc.JSObjectSetProperty(context, aHeapRef, "length", jsc.JSValueMakeNumber(context, 10), JSPropertyAttribute.None.getValue(), null);
        jsc.JSGarbageCollect(context);

        JSValueRef nullJSONObject = jsc.JSValueMakeFromJSONString(context, null);
        assertTrue(nullJSONObject.isNullPointer());

        JSValueRef jsonObject = jsc.JSValueMakeFromJSONString(context, "{\"aProperty\":true}");
        assertTrue(jsc.JSValueIsObject(context, jsonObject));
        assertTrue(jsc.JSObjectGetProperty(context, jsc.JSValueToObject(context, jsonObject, null), "aProperty", null).toBoolean());

        assertTrue(jsc.JSValueIsNull(context, jsc.JSValueMakeFromJSONString(context, "fail!")));

        String str = jsc.JSValueCreateJSONString(context, jsonObject, 0, null);
        assertTrue(str.equals("{\"aProperty\":true}"));

        str = jsc.JSValueCreateJSONString(context, jsonObject, 4, null);
        assertTrue(str.equals("{\n    \"aProperty\": true\n}"));

        JSValueRef exception = JSValueRef.Null();
        JSValueRef unstringifiableObj = jsc.JSEvaluateScript(context, "({get a(){ throw '';}})", null);
        str = jsc.JSValueCreateJSONString(context, unstringifiableObj, 4, exception);
        assertTrue(!jsc.JSValueIsNull(context, exception));
        assertTrue(str == null);

        // Conversions that throw exceptions
        exception = JSValueRef.Null();
        assertTrue(jsc.JSValueIsNull(context, jsc.JSValueToObject(context, jsNull, exception)));
        assertTrue(!jsc.JSValueIsNull(context, exception));

        exception = JSValueRef.Null();
        jsc.JSValueToNumber(context, jsObjectNoProto, exception);
        assertTrue(!jsc.JSValueIsNull(context, exception));

        exception = JSValueRef.Null();
        jsc.JSValueToStringCopy(context, jsObjectNoProto, exception);
        assertTrue(!jsc.JSValueIsNull(context, exception));

        assertTrue(jsc.JSValueToBoolean(context, myObject));

        exception = JSValueRef.Null();
        jsc.JSValueIsEqual(context, jsObjectNoProto, jsc.JSValueMakeNumber(context, 1), exception);
        assertTrue(!jsc.JSValueIsNull(context, exception));

        exception = JSValueRef.Null();
        jsc.JSObjectGetPropertyAtIndex(context, myObject, 0, exception);
        assertTrue(1 == (int)jsc.JSValueToNumber(context, exception, null));

        assertTrue(jsUndefined.toBoolean() == false);
        assertTrue(jsNull.toBoolean() == false);
        assertTrue(jsTrue.toBoolean() == true);
        assertTrue(jsFalse.toBoolean() == false);
        assertTrue(jsZero.toBoolean() == false);
        assertTrue(jsOne.toBoolean() == true);
        assertTrue(jsOneThird.toBoolean() == true);
        assertTrue(jsOneString.toBoolean() == true);
        assertTrue(jsEmptyString.toBoolean() == false);
    
        assertTrue(Double.isNaN(jsUndefined.toNumber()));
        assertTrue(jsNull.toNumber() == 0);
        assertTrue(jsTrue.toNumber() == 1);
        assertTrue(jsFalse.toNumber() == 0);
        assertTrue(jsZero.toNumber() == 0);
        assertTrue(jsOne.toNumber() == 1);
        assertTrue(jsOneThird.toNumber() == (1.0 / 3.0));
        assertTrue(jsOneString.toNumber() == 1);
        assertTrue(jsEmptyString.toNumber() == 0);
    
        assertTrue(jsUndefined.toString().equals("undefined"));
        assertTrue(jsNull.toString().equals("null"));
        assertTrue(jsTrue.toString().equals("true"));
        assertTrue(jsFalse.toString().equals("false"));
        assertTrue(jsZero.toString().equals("0"));
        assertTrue(jsOne.toString().equals("1"));
        assertTrue(jsOneThird.toString().equals("0.3333333333333333"));
        assertTrue(jsOneString.toString().equals("1"));
        assertTrue(jsEmptyString.toString().equals(""));
    
        assertTrue(jsc.JSValueIsStrictEqual(context, jsTrue, jsTrue));
        assertTrue(!jsc.JSValueIsStrictEqual(context, jsOne, jsOneString));

        assertTrue(jsc.JSValueIsEqual(context, jsOne, jsOneString, null));
        assertTrue(!jsc.JSValueIsEqual(context, jsTrue, jsFalse, null));

        jsGlobalValue = jsc.JSObjectMake(context, null, null);
        makeGlobalNumberValue(context);
        jsc.JSValueProtect(context, jsGlobalValue);
        jsc.JSGarbageCollect(context);
        assertTrue(jsc.JSValueIsObject(context, jsGlobalValue));
        jsc.JSValueUnprotect(context, jsGlobalValue);
        jsc.JSValueUnprotect(context, jsNumberValue);

        String goodSyntax = "x = 1;";
        String badSyntax  = "x := 1;";
        assertTrue(jsc.JSCheckScriptSyntax(context, goodSyntax, null));
        assertTrue(!jsc.JSCheckScriptSyntax(context, badSyntax, null));

        JSValueRef result;
        JSValueRef v;

        result = jsc.JSEvaluateScript(context, goodSyntax, null, null, 1, null);
        assertTrue(!jsc.JSValueIsNull(context, result));
        assertTrue(jsc.JSValueIsEqual(context, result, jsOne, null));

        exception = JSValueRef.Null();
        result = jsc.JSEvaluateScript(context, badSyntax, null, null, 1, exception);
        assertTrue(jsc.JSValueIsNull(context, result));
        assertTrue(jsc.JSValueIsObject(context, exception));
        
        JSObjectRef arrayConstructor = jsc.JSValueToObject(context, jsc.JSObjectGetProperty(context, globalObject, "Array", null), null);
        result = jsc.JSObjectCallAsConstructor(context, arrayConstructor, JSValueArrayRef.noArg(), null);
        assertTrue(!jsc.JSValueIsNull(context, result));
        assertTrue(jsc.JSValueIsObject(context, result));
        assertTrue(jsc.JSValueIsInstanceOfConstructor(context, result, arrayConstructor, null));
        assertTrue(!jsc.JSValueIsInstanceOfConstructor(context, jsc.JSValueMakeNull(context), arrayConstructor, null));

        o = jsc.JSValueToObject(context, result, null);
        exception = JSValueRef.Null();
        assertTrue(jsc.JSValueIsUndefined(context, jsc.JSObjectGetPropertyAtIndex(context, o, 0, exception)));
        assertTrue(jsc.JSValueIsNull(context, exception));
        
        jsc.JSObjectSetPropertyAtIndex(context, o, 0, jsc.JSValueMakeNumber(context, 1), exception);
        assertTrue(jsc.JSValueIsNull(context, exception));
        
        exception = JSValueRef.Null();
        assertTrue(1 == jsc.JSValueToNumber(context, jsc.JSObjectGetPropertyAtIndex(context, o, 0, exception), exception));
        assertTrue(jsc.JSValueIsNull(context, exception));
            
        JSObjectRef function;
        
        exception = JSValueRef.Null();
        String functionBody = "rreturn Array;";
        String line = "line";
        assertTrue(jsc.JSValueIsNull(context, jsc.JSObjectMakeFunction(context, null, 0, null, functionBody, null, 1, exception)));
        assertTrue(jsc.JSValueIsObject(context, exception));
        v = jsc.JSObjectGetProperty(context, jsc.JSValueToObject(context, exception, null), line, null);
        assertTrue(v.toNumber() == 1);

        exception = JSValueRef.Null();
        functionBody = "return Array;";
        function = jsc.JSObjectMakeFunction(context, null, 0, null, functionBody, null, 1, exception);
        assertTrue(jsc.JSValueIsNull(context, exception));
        assertTrue(jsc.JSObjectIsFunction(context, function));
        v = jsc.JSObjectCallAsFunction(context, function, null, JSValueArrayRef.noArg(), null);
        assertTrue(!jsc.JSValueIsNull(context, v));
        assertTrue(jsc.JSValueIsEqual(context, v, arrayConstructor, null));
        
        exception = JSValueRef.Null();
        function = jsc.JSObjectMakeFunction(context, null, 0, null, "", null, 0, exception);
        assertTrue(jsc.JSValueIsNull(context, exception));
        v = jsc.JSObjectCallAsFunction(context, function, null, JSValueArrayRef.noArg(), exception);
        assertTrue(!jsc.JSValueIsNull(context, v) && jsc.JSValueIsNull(context, exception));
        assertTrue(jsc.JSValueIsUndefined(context, v));
      
        exception = JSValueRef.Null();
        v = null;
        String argumentNames[] = { "foo" };
        functionBody = "return foo;";
        function = jsc.JSObjectMakeFunction(context, "foo", 1, argumentNames, functionBody, null, 1, exception);
        assertTrue(!jsc.JSValueIsNull(context, function) && jsc.JSValueIsNull(context, exception));
        JSValueArrayRef arguments = new JSValueArrayRef(1);
        arguments.set(0, jsc.JSValueMakeNumber(context, 2));
        jsc.JSObjectCallAsFunction(context, function, null, arguments, exception);
        
        String string = jsc.JSValueToStringCopy(context, function, null);
        assertTrue(jsc.JSValueMakeString(context, string).toString().equals("function foo(foo) { return foo;\n}"));

        JSObjectRef printFunction = jsc.JSObjectMakeFunctionWithCallback(context, "print", print_callAsFunction);
        jsc.JSObjectSetProperty(context, globalObject, "print", printFunction, JSPropertyAttribute.None.getValue(), null); 
        
        // Unlike C API, Java API provides access to set/get private object on function object
        assertTrue(jsc.JSObjectSetPrivate(printFunction, 1));
        assertTrue(jsc.JSObjectGetPrivate(printFunction) != null);

        JSObjectRef myConstructor = jsc.JSObjectMakeConstructor(context, null, myConstructor_callAsConstructor);
        jsc.JSObjectSetProperty(context, globalObject, "MyConstructor", myConstructor, JSPropertyAttribute.None.getValue(), null);
        
        JSObjectRef myBadConstructor = jsc.JSObjectMakeConstructor(context, null, myBadConstructor_callAsConstructor);
        jsc.JSObjectSetProperty(context, globalObject, "MyBadConstructor", myBadConstructor, JSPropertyAttribute.None.getValue(), null);
        
        assertTrue(!jsc.JSObjectSetPrivate(myConstructor, 1));
        assertTrue(jsc.JSObjectGetPrivate(myConstructor) == null);
        
        string = "Base";
        JSObjectRef baseConstructor = jsc.JSObjectMakeConstructor(context, Base_class(context), null);
        jsc.JSObjectSetProperty(context, globalObject, string, baseConstructor, JSPropertyAttribute.None.getValue(), null);
        
        string = "Derived";
        JSObjectRef derivedConstructor = jsc.JSObjectMakeConstructor(context, Derived_class(context), null);
        jsc.JSObjectSetProperty(context, globalObject, string, derivedConstructor, JSPropertyAttribute.None.getValue(), null);
        
        string = "Derived2";
        JSObjectRef derived2Constructor = jsc.JSObjectMakeConstructor(context, Derived2_class(context), null);
        jsc.JSObjectSetProperty(context, globalObject, string, derived2Constructor, JSPropertyAttribute.None.getValue(), null);

        o = jsc.JSObjectMake(context, null, null);
        jsc.JSObjectSetProperty(context, o, "1", jsc.JSValueMakeNumber(context, 1), JSPropertyAttribute.None.getValue(), null);
        jsc.JSObjectSetProperty(context, o, "A", jsc.JSValueMakeNumber(context, 1), JSPropertyAttribute.DontEnum.getValue(), null);
        JSPropertyNameArrayRef nameArray = jsc.JSObjectCopyPropertyNames(context, o);
        int expectedCount = jsc.JSPropertyNameArrayGetCount(nameArray);
        int count;
        for (count = 0; count < expectedCount; ++count)
            jsc.JSPropertyNameArrayGetNameAtIndex(nameArray, count);
        jsc.JSPropertyNameArrayRelease(nameArray);
        assertTrue(count == 1); // property with DontEnum should not be enumerated

        JSValueArrayRef argumentsArrayValues = new JSValueArrayRef(2);
        argumentsArrayValues.set(0, jsc.JSValueMakeNumber(context, 10));
        argumentsArrayValues.set(1, jsc.JSValueMakeNumber(context, 20));
        o = jsc.JSObjectMakeArray(context, argumentsArrayValues, null);
        string = "length";
        v = jsc.JSObjectGetProperty(context, o, string, null);
        assertTrue(v.toNumber() == 2);
        v = jsc.JSObjectGetPropertyAtIndex(context, o, 0, null);
        assertTrue(v.toNumber() == 10);
        v = jsc.JSObjectGetPropertyAtIndex(context, o, 1, null);
        assertTrue(v.toNumber() == 20);

        o = jsc.JSObjectMakeArray(context, null, null);
        v = jsc.JSObjectGetProperty(context, o, string, null);
        assertTrue(v.toNumber() == 0);

        JSValueArrayRef argumentsDateValues = new JSValueArrayRef(1);
        argumentsDateValues.set(0, jsc.JSValueMakeNumber(context, 0));
        o = jsc.JSObjectMakeDate(context, argumentsDateValues, null);
        assertTrue(o.toString().contains("00:00"));

        string = "an error message";
        JSValueArrayRef argumentsErrorValues = new JSValueArrayRef(1);
        argumentsErrorValues.set(0, jsc.JSValueMakeString(context, string));
        o = jsc.JSObjectMakeError(context, argumentsErrorValues, null);
        assertTrue(o.toString().equals("Error: an error message"));

        string = "foo";
        String string2 = "gi";
        JSValueArrayRef argumentsRegExpValues = new JSValueArrayRef(2);
        argumentsRegExpValues.set(0, jsc.JSValueMakeString(context, string));
        argumentsRegExpValues.set(1, jsc.JSValueMakeString(context, string2));
        o = jsc.JSObjectMakeRegExp(context, argumentsRegExpValues, null);
        assertTrue(o.toString().equals("/foo/gi"));

        JSClassDefinition nullDefinition = new JSClassDefinition();
        nullDefinition.attributes = JSClassAttribute.NoAutomaticPrototype.getValue();
        JSClassRef nullClass = jsc.JSClassCreate(nullDefinition);
        jsc.JSClassRelease(nullClass);
        
        nullDefinition = new JSClassDefinition();
        nullClass = jsc.JSClassCreate(nullDefinition);
        jsc.JSClassRelease(nullClass);

        functionBody = "return this;";
        function = jsc.JSObjectMakeFunction(context, null, 0, null, functionBody, null, 1, null);
        v = jsc.JSObjectCallAsFunction(context, function, null, JSValueArrayRef.noArg(), null);
        assertTrue(jsc.JSValueIsEqual(context, v, globalObject, null));
        v = jsc.JSObjectCallAsFunction(context, function, o, JSValueArrayRef.noArg(), null);
        assertTrue(jsc.JSValueIsEqual(context, v, o, null));

        functionBody = "return eval(\"this\");";
        function = jsc.JSObjectMakeFunction(context, null, 0, null, functionBody, null, 1, null);
        v = jsc.JSObjectCallAsFunction(context, function, null, JSValueArrayRef.noArg(), null);
        assertTrue(jsc.JSValueIsEqual(context, v, globalObject, null));
        v = jsc.JSObjectCallAsFunction(context, function, o, JSValueArrayRef.noArg(), null);
        assertTrue(jsc.JSValueIsEqual(context, v, o, null));

        String script = "this;";
        v = jsc.JSEvaluateScript(context, script, null, null, 1, null);
        assertTrue(jsc.JSValueIsEqual(context, v, globalObject, null));
        v = jsc.JSEvaluateScript(context, script, o, null, 1, null);
        assertTrue(jsc.JSValueIsEqual(context, v, o, null));

        script = "eval(this);";
        v = jsc.JSEvaluateScript(context, script, null, null, 1, null);
        assertTrue(jsc.JSValueIsEqual(context, v, globalObject, null));
        v = jsc.JSEvaluateScript(context, script, o, null, 1, null);
        assertTrue(jsc.JSValueIsEqual(context, v, o, null));

        // Verify that creating a constructor for a class with no static functions does not trigger
        // an assert inside putDirect or lead to a crash during GC. <https://bugs.webkit.org/show_bug.cgi?id=25785>
        nullDefinition = new JSClassDefinition();
        nullClass = jsc.JSClassCreate(nullDefinition);
        jsc.JSObjectMakeConstructor(context, nullClass, null);
        jsc.JSClassRelease(nullClass);

        String scriptUTF8 = createStringWithContentsOfFile("/com/appcelerator/javascriptcore/testapi.js");
        exception = JSValueRef.Null();
        result = jsc.JSEvaluateScript(context, scriptUTF8, globalObject, null, 1, exception);
        assertTrue(jsc.JSValueIsUndefined(context, result));

        // Clear out local variables pointing at JSObjectRefs to allow their values to be collected
        function = null;
        v = null;
        o = null;
        globalObject = null;
        myConstructor = null;

        jsc.JSGlobalContextRelease(context);
        jsc.JSClassRelease(globalObjectClass);


        // Test for an infinite prototype chain that used to be created. This test
        // passes if the call to JSObjectHasProperty() does not hang.

        JSClassDefinition prototypeLoopClassDefinition = new JSClassDefinition();
        prototypeLoopClassDefinition.staticFunctions = globalObjectClassDefinition.staticFunctions;
        JSClassRef prototypeLoopClass = jsc.JSClassCreate(prototypeLoopClassDefinition);
        JSGlobalContextRef prototypeLoopContext = jsc.JSGlobalContextCreateInGroup(null, prototypeLoopClass);

        jsc.JSObjectHasProperty(prototypeLoopContext, jsc.JSContextGetGlobalObject(prototypeLoopContext), "name");

        jsc.JSGlobalContextRelease(prototypeLoopContext);
        jsc.JSClassRelease(prototypeLoopClass);

        System.out.println("PASS: Infinite prototype chain does not occur.");

    }

    private String createStringWithContentsOfFile(String fileName) {
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

    private void makeGlobalNumberValue(JSContextRef context) {
        JSValueRef v = jsc.JSValueMakeNumber(context, 420);
        jsc.JSValueProtect(context, v);
        jsNumberValue = v;
        v = null;
    }


    private JSClassRef MyObject_class(JSContextRef context) {
        if (jsMyObjectClassRef == null) {
            JSClassRef baseClass = jsc.JSClassCreate(MyObject_definition);
            MyObject_convertToTypeWrapperDefinition.parentClass = baseClass;
            JSClassRef wrapperClass = jsc.JSClassCreate(MyObject_convertToTypeWrapperDefinition);
            MyObject_nullWrapperDefinition.parentClass = wrapperClass;
            jsMyObjectClassRef = jsc.JSClassCreate(MyObject_nullWrapperDefinition);
        }
        return jsMyObjectClassRef;    	
    }
    
    private JSClassRef PropertyCatchalls_class(JSContextRef context) {
        if (jsPropertyCatchallsClassRef == null)
        	jsPropertyCatchallsClassRef = jsc.JSClassCreate(PropertyCatchalls_definition);
        
        return jsPropertyCatchallsClassRef;
    }
    
    private JSClassRef EvilExceptionObject_class(JSContextRef context) {
    	if (jsEvilExceptionObjectClassRef == null) {
    		jsEvilExceptionObjectClassRef = jsc.JSClassCreate(EvilExceptionObject_definition);
    	}
    	return jsEvilExceptionObjectClassRef;
    }
    
    private JSClassRef EmptyObject_class(JSContextRef context) {
    	if (jsEmptyObjectClassRef == null) {
    		jsEmptyObjectClassRef = jsc.JSClassCreate(EmptyObject_definition);
    	}
    	return jsEmptyObjectClassRef;
    }
    
    private JSClassRef Base_class(JSContextRef context) {
    	if (jsBaseObjectClassRef == null) {
            JSStaticFunctions Base_staticFunctions = new JSStaticFunctions();
            Base_staticFunctions.add("baseProtoDup", null, JSPropertyAttribute.None.getValue());
            Base_staticFunctions.add("baseProto", new JSObjectCallAsFunctionCallback() {
                @Override
                public JSValueRef callAsFunction(JSContextRef context,
                        JSObjectRef function, JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                    return jsc.JSValueMakeNumber(context, 1); // distinguish base call from derived call
                }
            }, JSPropertyAttribute.None.getValue());
            Base_staticFunctions.add("baseHardNull", new JSObjectCallAsFunctionCallback() {
                @Override
                public JSValueRef callAsFunction(JSContextRef context,
                        JSObjectRef function, JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                    return null; // should convert to undefined!
                }
            }, JSPropertyAttribute.None.getValue());
            
            JSObjectGetPropertyCallback Base_get = new JSObjectGetPropertyCallback() {
                @Override
                public JSValueRef getProperty(JSContextRef context, JSObjectRef object,
                                                String propertyName, Pointer exception) {
                    return jsc.JSValueMakeNumber(context, 1); // distinguish base get form derived get
                }
            };
            JSObjectSetPropertyCallback Base_set = new JSObjectSetPropertyCallback() {
                @Override
                public boolean setProperty(JSContextRef context, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                    // *exception = JSValueMakeNumber(context, 1);
                    exception.update(jsc.JSValueMakeNumber(context, 1)); // distinguish base set from derived set
                    return true;
                }
            };
            JSStaticValues Base_staticValues = new JSStaticValues();
            Base_staticValues.add("baseDup",  Base_get, Base_set, JSPropertyAttribute.None.getValue());
            Base_staticValues.add("baseOnly", Base_get, Base_set, JSPropertyAttribute.None.getValue());
            
            JSClassDefinition definition = new JSClassDefinition();
            definition.staticValues = Base_staticValues;
            definition.staticFunctions = Base_staticFunctions;
            definition.initialize = new JSObjectInitializeCallback() {
				@Override
				public void initialize(JSContextRef context, JSObjectRef object) {
					if (TestInitializeFinalize) {
						assertTrue(jsc.JSObjectGetPrivate(object).equals(1));
						jsc.JSObjectSetPrivate(object, 2);
					}
				}
            };
            definition.finalize = new JSObjectFinalizeCallback() {
				@Override
				public void finalize(JSObjectRef object) {
					if (TestInitializeFinalize) {
						assertTrue(jsc.JSObjectGetPrivate(object).equals(4));
						Base_didFinalize = true;
					}
				}
            };
            jsBaseObjectClassRef = jsc.JSClassCreate(definition);
    	}
    	return jsBaseObjectClassRef;
    }
    

    private JSClassRef Derived2_class(JSContextRef context) {
        if (jsDerived2ObjectClassRef == null) {
            JSClassDefinition definition = new JSClassDefinition();
            definition.parentClass = Derived_class(context);
            jsDerived2ObjectClassRef = jsc.JSClassCreate(definition);
        }
        return jsDerived2ObjectClassRef;
    }

    private JSClassRef Derived_class(JSContextRef context) {
    	if (jsDerivedObjectClassRef == null) {
    		JSObjectCallAsFunctionCallback Derived_callAsFunction = new JSObjectCallAsFunctionCallback() {
				@Override
				public JSValueRef callAsFunction(JSContextRef context,
						JSObjectRef function, JSObjectRef thisObject, int argumentCount,
						JSValueArrayRef arguments, Pointer exception) {
				    return jsc.JSValueMakeNumber(context, 2); // distinguish base call from derived call
				}
    		};
    		
            JSObjectGetPropertyCallback Derived_get = new JSObjectGetPropertyCallback() {
                @Override
                public JSValueRef getProperty(JSContextRef context, JSObjectRef object,
                                                String propertyName, Pointer exception) {
                    return jsc.JSValueMakeNumber(context, 2); // distinguish base get form derived get
                }
            };
            JSObjectSetPropertyCallback Derived_set = new JSObjectSetPropertyCallback() {
                @Override
                public boolean setProperty(JSContextRef context, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                    // *exception = JSValueMakeNumber(context, 2);
                    exception.update(jsc.JSValueMakeNumber(context, 2)); // distinguish base set from derived set
                    return true;
                }
            };
            JSStaticFunctions Derived_staticFunctions = new JSStaticFunctions();
            Derived_staticFunctions.add("protoOnly", Derived_callAsFunction, JSPropertyAttribute.None.getValue());
            Derived_staticFunctions.add("protoDup", null, JSPropertyAttribute.None.getValue());
            Derived_staticFunctions.add("baseProtoDup", Derived_callAsFunction, JSPropertyAttribute.None.getValue());
            
            JSStaticValues Derived_staticValues = new JSStaticValues();
            Derived_staticValues.add("derivedOnly",  Derived_get, Derived_set, JSPropertyAttribute.None.getValue());
            Derived_staticValues.add("protoDup", Derived_get, Derived_set, JSPropertyAttribute.None.getValue());
            Derived_staticValues.add("baseDup", Derived_get, Derived_set, JSPropertyAttribute.None.getValue());
            
            JSClassDefinition definition = new JSClassDefinition();
            definition.parentClass = Base_class(context);
            definition.staticValues = Derived_staticValues;
            definition.staticFunctions = Derived_staticFunctions;
            definition.initialize = new JSObjectInitializeCallback() {
				@Override
				public void initialize(JSContextRef context, JSObjectRef object) {
					if (TestInitializeFinalize) {
						assertTrue(jsc.JSObjectGetPrivate(object).equals(2));
						jsc.JSObjectSetPrivate(object, 3);
					}
				}
            };
            definition.finalize = new JSObjectFinalizeCallback() {
				@Override
				public void finalize(JSObjectRef object) {
					if (TestInitializeFinalize) {
						assertTrue(jsc.JSObjectGetPrivate(object).equals(3));
						jsc.JSObjectSetPrivate(object, 4);
					}
				}
            };
            jsDerivedObjectClassRef = jsc.JSClassCreate(definition);
    	}
    	return jsDerivedObjectClassRef;
    }
    private JSClassRef Derived_class2(JSContextRef context) {
        if (jsDerived2ObjectClassRef == null) {
            JSClassDefinition definition = new JSClassDefinition();
            definition.parentClass = Derived_class(context);
            jsDerived2ObjectClassRef = jsc.JSClassCreate(definition);
        }
        return jsDerived2ObjectClassRef;
    }
}
class EvilExceptionObjectDefinition extends JSClassDefinition implements JSObjectHasInstanceCallback, JSObjectConvertToTypeCallback {
    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
	public EvilExceptionObjectDefinition() {
    	this.version = 0;
    	this.attributes = JSClassAttribute.None.getValue();
		this.className = "EvilExceptionObject";
		this.hasInstance = this;
		this.convertToType = this;
	}
	@Override
	public JSValueRef convertToType(JSContextRef context, JSObjectRef object,
			JSType type, Pointer exception) {
	    String funcName;
	    switch (type) {
	    case Number:
	        funcName = "toNumber";
	        break;
	    case String:
	        funcName = "toStringExplicit";
	        break;
	    default:
	        return jsc.JSValueMakeNull(context);
	    }
	    
        JSValueRef new_exception = JSValueRef.Null();
	    JSValueRef func = jsc.JSObjectGetProperty(context, object, funcName, new_exception);
	    JSObjectRef function = jsc.JSValueToObject(context, func, new_exception);
        exception.update(new_exception);
	    if (function.isNull())
	        return jsc.JSValueMakeNull(context);
	    JSValueRef value = jsc.JSObjectCallAsFunction(context, function, object, JSValueArrayRef.noArg(), new_exception);
        exception.update(new_exception);
	    if (value.isNull()) {
	        return jsc.JSValueMakeString(context, "convertToType failed");
	    }
	    return value;
	}

	@Override
	public boolean hasInstance(JSContextRef context, JSObjectRef constructor,
			JSValueRef possibleValue, Pointer exception) {
	    JSValueRef hasInstance = jsc.JSObjectGetProperty(context, constructor, "hasInstance", null);
	    if (hasInstance.isNull())
	        return false;
	    JSObjectRef function = jsc.JSValueToObject(context, hasInstance, null);
        JSValueArrayRef argv = new JSValueArrayRef(1);
        argv.set(0, possibleValue);
	    JSValueRef result = jsc.JSObjectCallAsFunction(context, function, constructor, argv, null);
	    return !result.isNull() && jsc.JSValueToBoolean(context, result);
	}
	
}
class PropertyCatchallsDefinition extends JSClassDefinition implements JSObjectGetPropertyCallback, JSObjectSetPropertyCallback, JSObjectGetPropertyNamesCallback {
    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    
    private static int xCount = 0;
    private static int yCount = 0;
    private static int zCount = 0;
    private static int xSetCount = 0;
    private static int propertyNamesCount = 0;
    
	public PropertyCatchallsDefinition() {
    	this.version = 0;
    	this.attributes = JSClassAttribute.None.getValue();
    	this.className = "PropertyCatchalls";
		this.getProperty = this;
		this.setProperty = this;
		this.getPropertyNames = this;
	}

	@Override
	public void getPropertyNames(JSContextRef context, JSObjectRef object, JSPropertyNameAccumulatorRef propertyNames) {
	    String numbers[] = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };
	    
	    // Provide a property of a different name every time.
	    String propertyName = numbers[propertyNamesCount++ % 10];
	    jsc.JSPropertyNameAccumulatorAddName(propertyNames, propertyName);
	}

	@Override
	public boolean setProperty(JSContextRef context, JSObjectRef object,
			String propertyName, JSValueRef value, Pointer exception) {
	    if (propertyName.equals("x")) {
	        if (xSetCount++ < 5)
	            return false;

	        // Swallow all .x sets after 4.
	        return true;
	    }

	    if (propertyName.equals("make_throw") || propertyName.equals("0")) {
            // *exception = JSValueMakeNumber(context, 5);
            exception.update(jsc.JSValueMakeNumber(context, 5));
            return true;
	    }

	    return false;
	}

	@Override
	public JSValueRef getProperty(JSContextRef context, JSObjectRef object,
			String propertyName, Pointer exception) {

	    if (propertyName.equals("x")) {
	        if (xCount++ < 5)
	            return null;

	        // Swallow all .x gets after 5, returning null.
	        return jsc.JSValueMakeNull(context);
	    }

	    if (propertyName.equals("y")) {
	        if (yCount++ < 5)
	            return null;

	        // Swallow all .y gets after 5, returning null.
	        return jsc.JSValueMakeNull(context);
	    }
	    
	    if (propertyName.equals("z")) {
	        if (zCount++ < 5)
	            return null;

	        // Swallow all .y gets after 5, returning null.
	        return jsc.JSValueMakeNull(context);
	    }

	    return null;
	}
	
}
class MyObjectDefinition extends JSClassDefinition implements JSObjectHasPropertyCallback, JSObjectGetPropertyCallback,
						  JSObjectSetPropertyCallback, JSObjectGetPropertyNamesCallback, 
						  JSObjectDeletePropertyCallback, JSObjectCallAsFunctionCallback,
						  JSObjectCallAsConstructorCallback, JSObjectHasInstanceCallback,
						  JSObjectConvertToTypeCallback {
	
    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
	
	public MyObjectDefinition() {
        this.version = 0;
        this.attributes = JSClassAttribute.None.getValue();
        this.className = "MyObject";
		this.hasProperty = this;
		this.getProperty = this;
		this.setProperty = this;
		this.getPropertyNames = this;
		this.deleteProperty = this;
		this.callAsFunction = this;
		this.callAsConstructor = this;
		this.hasInstance = this;
		this.convertToType = this;
	}

	@Override
	public void getPropertyNames(JSContextRef context, JSObjectRef object,
			JSPropertyNameAccumulatorRef propertyNames) {
	    jsc.JSPropertyNameAccumulatorAddName(propertyNames, "alwaysOne");
	    jsc.JSPropertyNameAccumulatorAddName(propertyNames, "myPropertyName");
	}

	@Override
	public boolean setProperty(JSContextRef context, JSObjectRef object,
			String propertyName, JSValueRef value, Pointer exception) {
	    if (propertyName.equals("cantSet"))
	        return true; // pretend we set the property in order to swallow it
	    
	    if (propertyName.equals("throwOnSet")) {
            JSValueRef exception_new = JSValueRef.Null();
	        jsc.JSEvaluateScript(context, "throw 'an exception'", object, "test script", 1, exception_new);
            exception.update(exception_new);
	    }
	    return false;
	}

	@Override
	public JSValueRef getProperty(JSContextRef context, JSObjectRef object,
			String propertyName, Pointer exception) {
	    if (propertyName.equals("alwaysOne")) {
	        return jsc.JSValueMakeNumber(context, 1);
	    }
	    
	    if (propertyName.equals("myPropertyName")) {
	        return jsc.JSValueMakeNumber(context, 1);
	    }

	    if (propertyName.equals("cantFind")) {
	        return jsc.JSValueMakeUndefined(context);
	    }
	    
	    if (propertyName.equals("hasPropertyLie")) {
	        return null;
	    }

	    if (propertyName.equals("throwOnGet")) {
            JSValueRef exception_new = JSValueRef.Null();
	        JSValueRef value = jsc.JSEvaluateScript(context,"throw 'an exception'", object, "test script", 1, exception_new);
            exception.update(exception_new);
            return value;
	    }

	    if (propertyName.equals("0")) {
	    	// *exception = JSValueMakeNumber(context, 1);
            exception.update(jsc.JSValueMakeNumber(context, 1));
            return jsc.JSValueMakeNumber(context, 1);
	    }
	    return jsc.JSValueMakeNull(context);
	}

	@Override
	public boolean hasProperty(JSContextRef context, JSObjectRef object, String propertyName) {
	    if (propertyName.equals("alwaysOne")
	            || propertyName.equals("cantFind")
	            || propertyName.equals("throwOnGet")
	            || propertyName.equals("myPropertyName")
	            || propertyName.equals("hasPropertyLie")
	            || propertyName.equals("0")) {
	            return true;
	    }
	    return false;
	}

	@Override
	public JSValueRef convertToType(JSContextRef context, JSObjectRef object, JSType type, Pointer exception) {
	    
	    switch (type) {
	    case Number:
	        return jsc.JSValueMakeNumber(context, 1);
	    case String:
	        {
	            return jsc.JSValueMakeString(context, "MyObjectAsString");
	        }
	    default:
	        break;
	    }

	    // string conversion -- forward to default object class
	    return jsc.JSValueMakeNull(context);
	}

	@Override
	public boolean hasInstance(JSContextRef context, JSObjectRef constructor,
									JSValueRef possibleValue, Pointer exception) {
	    if (possibleValue.isString() && possibleValue.toString().equals("throwOnHasInstance")) {
            JSValueRef exception_new = JSValueRef.Null();
	        jsc.JSEvaluateScript(context, "throw 'an exception'", constructor, "test script", 1, exception_new);
            exception.update(exception_new);
	        return false;
	    }

	    JSObjectRef numberConstructor = jsc.JSValueToObject(context, jsc.JSObjectGetProperty(context, jsc.JSContextGetGlobalObject(context), "Number", null), null);
	    return jsc.JSValueIsInstanceOfConstructor(context, possibleValue, numberConstructor, null);
	}

	@Override
	public JSObjectRef callAsConstructor(JSContextRef context, JSObjectRef object,
			int argumentCount, JSValueArrayRef arguments, Pointer exception) {
	    if (argumentCount > 0 && arguments.get(context, 0).isString() && arguments.get(context, 0).toString().equals("throwOnConstruct")) {
            JSValueRef exception_new = JSValueRef.Null();
	        jsc.JSEvaluateScript(context, "throw 'an exception'", object, "test script", 1, exception_new);
            exception.update(exception_new);
	        return object;
	    }

	    if (argumentCount > 0 && arguments.get(context, 0).isStrictEqual(jsc.JSValueMakeNumber(context, 0)))
	        return jsc.JSValueToObject(context, jsc.JSValueMakeNumber(context, 1), null);
	    return jsc.JSValueToObject(context, jsc.JSValueMakeNumber(context, 0), null);
	}

	@Override
	public JSValueRef callAsFunction(JSContextRef context, JSObjectRef object,
			JSObjectRef thisObject, int argumentCount, JSValueArrayRef arguments, Pointer exception) {

	    if (argumentCount > 0 && arguments.get(context, 0).isString() && arguments.get(context, 0).toString().equals("throwOnCall")) {
            JSValueRef exception_new = JSValueRef.Null();
	        jsc.JSEvaluateScript(context, "throw 'an exception'", object, "test script", 1, exception_new);
            exception.update(exception_new);
	        return jsc.JSValueMakeUndefined(context);
	    }

	    if (argumentCount > 0 && arguments.get(context, 0).isStrictEqual(jsc.JSValueMakeNumber(context, 0)))
	        return jsc.JSValueMakeNumber(context, 1);
	    
	    return jsc.JSValueMakeUndefined(context);
	}

	@Override
	public boolean deleteProperty(JSContextRef context, JSObjectRef object,
			String propertyName, Pointer exception) {
	    if (propertyName.equals("cantDelete"))
	        return true;
	    
	    if (propertyName.equals("throwOnDelete")) {
            JSValueRef exception_new = JSValueRef.Null();
	        jsc.JSEvaluateScript(context, "throw 'an exception'", object, "test script", 1, exception_new);
            exception.update(exception_new);
	        return false;
	    }
	    return false;
	}
	
}
class MyObject_convertToTypeWrapperDefinition extends JSClassDefinition implements JSObjectConvertToTypeCallback {
	public MyObject_convertToTypeWrapperDefinition() {
		super();
        this.version = 0;
        this.attributes = JSClassAttribute.None.getValue();
        this.className = "MyObject";
		this.convertToType = this;
	}

	@Override
	public JSValueRef convertToType(JSContextRef context, JSObjectRef object,
			JSType type, Pointer exception) {
	    // Forward to default object class
	    return null;
	}
}