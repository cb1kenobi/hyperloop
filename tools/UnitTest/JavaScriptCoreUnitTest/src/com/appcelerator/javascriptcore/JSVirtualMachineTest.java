package com.appcelerator.javascriptcore;

import com.appcelerator.javascriptcore.opaquetypes.JSContextGroupRef;
import com.appcelerator.javascriptcore.opaquetypes.JSContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSGlobalContextRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueRef;
import com.appcelerator.javascriptcore.opaquetypes.JSValueArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSObjectRef;
import com.appcelerator.javascriptcore.opaquetypes.JSClassRef;
import com.appcelerator.javascriptcore.opaquetypes.JSClassDefinition;
import com.appcelerator.javascriptcore.opaquetypes.JSPropertyNameArrayRef;
import com.appcelerator.javascriptcore.opaquetypes.JSPropertyNameAccumulatorRef;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticValues;
import com.appcelerator.javascriptcore.opaquetypes.JSStaticFunctions;
import com.appcelerator.javascriptcore.opaquetypes.Pointer;

import com.appcelerator.javascriptcore.enums.JSPropertyAttribute;
import com.appcelerator.javascriptcore.enums.JSType;

import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsConstructorCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectCallAsFunctionCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectConvertToTypeCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectDeletePropertyCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectFinalizeCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectGetPropertyCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectGetPropertyNamesCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectHasInstanceCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectHasPropertyCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectInitializeCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectSetPropertyCallback;
import com.appcelerator.javascriptcore.callbacks.JSObjectGetPropertyCallback;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

public class JSVirtualMachineTest {

    private JavaScriptCoreLibrary jsc = JavaScriptCoreLibrary.getInstance();
    private JSVirtualMachine vm;

    @Before
    public void setUp() throws Exception {
        vm = new JSVirtualMachine();
    }

    @After
    public void tearDown() throws Exception {
        vm.release();
    }

    @Test
    public void testContextGroupRefNotNull() {
        assertTrue(vm.getContextGroupRef() != null);
        assertTrue(vm.getContextGroupRef().getPointer() != Pointer.NULL);
    }

    @Test
    public void testJSContextGetGroup() {
        JSGlobalContextRef context  = vm.getDefaultContext();
        JSContextGroupRef group = jsc.JSContextGetGroup(context);
        assertTrue(vm.getContextGroupRef().equals(group));
    }

    @Test
    public void testCreateContext() {
        JSGlobalContextRef context = vm.createContext();
        assertTrue(context != null);
        assertTrue(context.getPointer() != Pointer.NULL);
        vm.releaseContext(context);
    }

    @Test
    public void testReleaseContext() {
        int count = vm.getContextCount();
        JSGlobalContextRef context = vm.createContext();
        vm.releaseContext(context);
        assertTrue(vm.getContextCount() == count);
    }

    @Test
    public void testRetainReleaseContext() {
        JSGlobalContextRef context1 = vm.createContext();
        JSGlobalContextRef context2 = jsc.JSGlobalContextRetain(context1);
        assertTrue(context1.equals(context2));
        jsc.JSGlobalContextRelease(context2);
        vm.releaseContext(context1);
    }

    @Test
    public void testRetainReleaseContextGroup() {
        JSContextGroupRef group1 = vm.getContextGroupRef();
        JSContextGroupRef group2 = jsc.JSContextGroupRetain(group1);
        assertTrue(group1.equals(group2));
        jsc.JSContextGroupRelease(group2);
    }

    @Test
    public void testEvaluateScriptForUndefined() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("undefined");
        assertTrue(value.isUndefined());
    }

    @Test
    public void testEvaluateScriptForNull() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("null");
        assertTrue(value.isNull());
    }

    @Test
    public void testEvaluateScriptForNumber() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("5+5");
        assertTrue(value.isNumber());
        assertTrue(value.toDouble() == 10.0);
        assertTrue(value.toInt() == 10);
    }

    @Test
    public void testEvaluateScriptForDouble() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("1.1");
        assertTrue(value.isNumber());
        assertTrue(value.toDouble() == 1.1);
    }

    @Test
    public void testEvaluateScriptForString() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("'Hello'+'World'");
        assertTrue(value.isString());
        assertTrue("HelloWorld".equals(value.toString()));
    }

    @Test
    public void testEvaluateScriptForObject() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("new Date();");
        assertTrue(value.isObject());
        assertTrue(value.toObject() instanceof JSObjectRef);
    }

    @Test
    public void testEvaluateInvalidScriptSyntax() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef exception = JSValueRef.Null();
        context.evaluateScript("{#@%){", null, exception);
        assertTrue(!jsc.JSValueIsNull(context, exception));
    }

    @Test
    public void testJSCheckScriptSyntax() {
        JSGlobalContextRef context = vm.getDefaultContext();
        assertTrue(context.checkScriptSyntax("var a = 0;"));
    }

    @Test
    public void testJSCheckInvalidScriptSyntax() {
        JSGlobalContextRef context = vm.getDefaultContext();
        assertFalse(context.checkScriptSyntax("{#@%){"));
    }

    @Test
    public void testJSValueToJSON() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("[1,2,3]");
        assertTrue("[1,2,3]".equals(value.toJSON(0)));
    }

    @Test
    public void testJSValueToBoolean() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("false");
        assertFalse(value.toBoolean());
    }

    @Test
    public void testJSValueIsEqual() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef valueA = context.evaluateScript("3");
        JSValueRef valueB = context.evaluateScript("'3'");
        assertTrue(valueA.isEqual(valueB));
    }

    @Test
    public void testJSValueIsStrictEqual() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef valueA = context.evaluateScript("3");
        JSValueRef valueB = context.evaluateScript("'3'");
        assertFalse(valueA.isStrictEqual(valueB));
    }

    @Test
    public void testJSValueProtectCall() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("new Date();");
        value.protect();
        value.unprotect();
        // Can't test it actually.
        // at least it assures it doesn't throw error
        assertTrue(value.isObject());
    }

    @Test
    public void testJSValueGCCall() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = context.evaluateScript("new Date();");
        context.garbageCollect();
        // Can't test it actually.
        // at least it assures it doesn't throw error
        assertTrue(value.isObject());
    }

    @Test
    public void testJSValueMakeBoolean() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeBoolean(context, false);
        assertTrue(value.isBoolean());
        assertFalse(value.toBoolean());
    }

    @Test
    public void testJSValueMakeNull() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeNull(context);
        assertTrue(value.isNull());
    }

    @Test
    public void testJSValueMakeUndefined() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeUndefined(context);
        assertTrue(value.isUndefined());
    }

    @Test
    public void testJSValueMakeNumber() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeNumber(context, 10);
        assertTrue(value.isNumber());
        assertTrue(value.toNumber() == 10.0);
    }

    @Test
    public void testJSValueMakeString() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeString(context, "Lorem ipsum dolor sit amet");
        assertTrue(value.isString());
        assertTrue("Lorem ipsum dolor sit amet".equals(value.toString()));
    }

    @Test
    public void testJSValueMakeFromJSONString() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueRef value = jsc.JSValueMakeFromJSONString(context, "{\"string\":\"Lorem ipsum dolor sit amet\"}");
        assertTrue(value.isObject());
        assertTrue("{\"string\":\"Lorem ipsum dolor sit amet\"}".equals(value.toJSON()));
    }

    @Test
    public void testJSClassCreate() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        assertTrue(jsClass.pointer() != 0);
    }

    @Test
    public void testJSObjectMake() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        assertTrue(jsObj.pointer() != 0);
    }

    @Test
    public void testJSObjectMakeInitializeCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        definition.initialize = new JSObjectInitializeCallback() {
            public void initialize(JSContextRef ctx, JSObjectRef object) {
                assertTrue(ctx.pointer() != 0);
                assertTrue(object.pointer() != 0);
            }
        };
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        assertTrue(jsObj.pointer() != 0);
    }

    @Test
    public void testJSObjectMakeFinalizeCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        definition.finalize = new JSObjectFinalizeCallback() {
            public void finalize(JSObjectRef object) {
                assertTrue(object.pointer() != 0);
            }
        };
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        assertTrue(jsObj.pointer() != 0);
    }

    @Test
    public void testJSObjectCallAsConstructorCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueArrayRef argv = new JSValueArrayRef(3);
        argv.set(0, jsc.JSValueMakeNumber(context, 1));
        argv.set(1, jsc.JSValueMakeNumber(context, 2));
        argv.set(2, jsc.JSValueMakeNumber(context, 3));

        JSClassDefinition definition = new JSClassDefinition();
        definition.callAsConstructor = new JSObjectCallAsConstructorCallback() {
            public JSObjectRef callAsConstructor(JSContextRef ctx, JSObjectRef constructor,
                                    int argumentCount, JSValueArrayRef arguments, 
                                    Pointer exception) {
                assertTrue(ctx.p() != 0);
                assertTrue(constructor.p() != 0);
                assertTrue(argumentCount == 3);
                assertTrue(arguments.get(ctx, 0).toInt() == 1);
                assertTrue(arguments.get(ctx, 1).toInt() == 2);
                assertTrue(arguments.get(ctx, 2).toInt() == 3);

                return constructor;
            }
        };
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        JSObjectRef value = jsc.JSObjectCallAsConstructor(context, jsObj, argv, null);
        assertTrue(value.p() != 0);
        assertTrue(value.p() == jsObj.p());
        argv.dispose();
    }

    @Test
    public void testJSObjectCallAsFunctionCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSValueArrayRef argv = new JSValueArrayRef(3);
        argv.set(0, jsc.JSValueMakeNumber(context, 1));
        argv.set(1, jsc.JSValueMakeNumber(context, 2));
        argv.set(2, jsc.JSValueMakeNumber(context, 3));
        JSClassDefinition definition = new JSClassDefinition();
        definition.callAsFunction = new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef ctx, JSObjectRef function,
                        JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                assertTrue(ctx.p() != 0);
                assertTrue(function.p() != 0);
                assertTrue(argumentCount == 3);
                assertTrue(arguments.get(ctx, 0).toNumber() == 1);
                assertTrue(arguments.get(ctx, 1).toNumber() == 2);
                assertTrue(arguments.get(ctx, 2).toNumber() == 3);
                return jsc.JSValueMakeNumber(ctx, 111);
            }
        };
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        JSValueRef value = jsc.JSObjectCallAsFunction(context, jsObj, jsObj, argv, null);
        assertTrue(value.p() != 0);
        assertTrue(value.toInt() == 111);
        argv.dispose();
    }

    @Test
    public void testJSObjectGetProperty() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSStaticValues staticValues = new JSStaticValues();
        staticValues.add("property1", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
                assertTrue(ctx.p() != 0);
                assertTrue(object.p() != 0);
                assertTrue("property1".equals(propertyName));
                return jsc.JSValueMakeNumber(ctx, 123);
            }
        }, null, JSPropertyAttribute.None.getValue());
        definition.staticValues = staticValues;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        JSValueRef value = jsc.JSObjectGetProperty(context, jsObj, "property1", null);
        assert(value.toInt() == 123);
    }

    @Test
    public void testJSObjectSetProperty() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSStaticValues staticValues = new JSStaticValues();
        staticValues.add("property1", null, new JSObjectSetPropertyCallback() {
            public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                assertTrue(ctx.p() != 0);
                assertTrue(object.p() != 0);
                assertTrue(value.p() != 0);
                assertTrue("property1".equals(propertyName));
                assertTrue(value.toInt() == 100);
                return true;
            }
        }, JSPropertyAttribute.None.getValue());
        definition.staticValues = staticValues;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);
        jsc.JSObjectSetProperty(context, jsObj, "property1",
                        jsc.JSValueMakeNumber(context, 100),
                        JSPropertyAttribute.None.getValue() | JSPropertyAttribute.DontDelete.getValue(), null);
    }

    @Test
    public void testJSObjectGetPrivate() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsobj = jsc.JSObjectMake(context, jsClass);
        Object obj = jsc.JSObjectGetPrivate(jsobj);
        assertTrue(obj == null);
    }

    @Test
    public void testJSObjectSetPrivateObject() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsobj = jsc.JSObjectMake(context, jsClass);
        Object obj = jsc.JSObjectGetPrivate(jsobj);
        assertTrue(obj == null);
        Object pObj = new Object();
        assertTrue(jsc.JSObjectSetPrivate(jsobj, pObj));
        Object tObj = jsc.JSObjectGetPrivate(jsobj);
        assertTrue(tObj != null);
        assertTrue(tObj.equals(pObj));
    }

    @Test
    public void testJSObjectSetPrivateString() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsobj = jsc.JSObjectMake(context, jsClass);
        Object obj = jsc.JSObjectGetPrivate(jsobj);
        assertTrue(obj == null);
        String pObj = "This is String Object";
        assertTrue(jsc.JSObjectSetPrivate(jsobj, pObj));
        Object tObj = jsc.JSObjectGetPrivate(jsobj);
        assertTrue(tObj != null);
        assertTrue(tObj.equals(pObj));
    }

    @Test
    public void testJSObjectMakeGlobalObject() {
        JSClassDefinition globalObjectDef = new JSClassDefinition();
        globalObjectDef.initialize = new JSObjectInitializeCallback() {
            public void initialize(JSContextRef ctx, JSObjectRef object) {
                assertTrue(object.equals(jsc.JSContextGetGlobalObject(ctx)));
            }
        };
        JSStaticValues staticValues = new JSStaticValues();
        staticValues.add("globalStaticValue", new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                    String propertyName, Pointer exception) {
                assertTrue("globalStaticValue".equals(propertyName));
                return jsc.JSValueMakeNumber(ctx, 123);
            }
        }, null, JSPropertyAttribute.None.getValue());
        globalObjectDef.staticValues = staticValues;
        JSClassRef globalObjectClass = jsc.JSGlobalClassCreate(globalObjectDef);
        JSGlobalContextRef context = jsc.JSGlobalContextCreate(globalObjectClass); 
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        JSValueRef value = context.evaluateScript("globalStaticValue;", globalObject, null);
        assertTrue(value.toInt() == 123);
        jsc.JSGlobalContextRelease(context);
    }

    @Test
    public void testJSObjectMakeFunctionWithCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        JSObjectRef println = jsc.JSObjectMakeFunctionWithCallback(context,
                                "println", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef ctx, JSObjectRef function,
                        JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                assertTrue(function.p() != 0);
                assertTrue(argumentCount == 1);
                assertTrue("Hello, World".equals(arguments.get(ctx, 0).toString()));
                return jsc.JSValueMakeNumber(ctx, 1234);
            }
        });
        assertTrue(println.p() != 0);
        jsc.JSObjectSetProperty(context, globalObject, "println", println, JSPropertyAttribute.None.getValue(), null);
        JSValueRef value = context.evaluateScript("println('Hello, World');");
        assertTrue(value.p() != 0);
        assertTrue(value.toInt() == 1234);
    }

    @Test
    public void testJSObjectMakeConstructor() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef globalObject = jsc.JSContextGetGlobalObject(context);
        JSObjectRef constructor = jsc.JSObjectMakeConstructor(context, null, new JSObjectCallAsConstructorCallback() {
            public JSObjectRef callAsConstructor(JSContextRef ctx, JSObjectRef constructor,
                                    int argumentCount, JSValueArrayRef arguments, Pointer exception) {
                assertTrue(constructor.p() != 0);
                assertTrue(argumentCount == 1);
                assertTrue("Hello, World".equals(arguments.get(ctx, 0).toString()));
                return jsc.JSObjectMakeArray(ctx, arguments, null);
            }
        });
        assertTrue(constructor.p() != 0);
        assertTrue(jsc.JSObjectIsConstructor(context, constructor));
        jsc.JSObjectSetProperty(context, globalObject, "TestObject", constructor, JSPropertyAttribute.None.getValue(), null);
        JSValueRef exception = JSValueRef.Null();
        JSValueRef value = context.evaluateScript("new TestObject('Hello, World');", globalObject, exception);
        assertTrue("[\"Hello, World\"]".equals(value.toJSON()));
    }

    @Test
    public void testJSObjectMakeArray() {
        JSGlobalContextRef context = vm.getDefaultContext();

        JSValueArrayRef properties = new JSValueArrayRef(2);
        properties.set(0, jsc.JSValueMakeNumber(context, 123));
        properties.set(1, jsc.JSValueMakeNumber(context, 456));

        JSObjectRef array = jsc.JSObjectMakeArray(context, properties, null);
        String json = jsc.JSValueCreateJSONString(context, array, 0, null);
        assertTrue("[123,456]".equals(json));
        assertTrue(123 == jsc.JSObjectGetPropertyAtIndex(context, array, 0, null).toInt());
        assertTrue(456 == jsc.JSObjectGetPropertyAtIndex(context, array, 1, null).toInt());
        properties.dispose();
    }

    @Test
    public void testJSObjectCopyPropertyNames() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSObjectRef array = jsc.JSObjectMakeArray(context, JSValueArrayRef.EMPTY, null);
        JSPropertyNameArrayRef names = jsc.JSObjectCopyPropertyNames(context, array);
        int count = jsc.JSPropertyNameArrayGetCount(names);
        assertTrue(names.pointer() != 0);
        assertTrue(count == 0);
        jsc.JSPropertyNameArrayRelease(names);
    }

    @Test
    public void testJSPropertyNameArrayGetCount() {
        JSGlobalContextRef context = vm.getDefaultContext();

        JSValueArrayRef properties = new JSValueArrayRef(1);
        properties.set(0, jsc.JSValueMakeString(context, "value1"));

        JSObjectRef array = jsc.JSObjectMakeArray(context, properties, null);
        JSPropertyNameArrayRef names = jsc.JSObjectCopyPropertyNames(context, array);
        int count = jsc.JSPropertyNameArrayGetCount(names);
        assertTrue(properties.length() == count);
        jsc.JSPropertyNameArrayRelease(names);

        properties.dispose();
    }

    @Test
    public void testJSObjectStaticFunctionsCallback0() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSStaticFunctions staticFunctions = new JSStaticFunctions();
        staticFunctions.add("print_number", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef ctx, JSObjectRef function,
                        JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                assertTrue(function.p() != 0);
                assertTrue(argumentCount == 0);
                return jsc.JSValueMakeNumber(ctx, 8765);
            }
        }, JSPropertyAttribute.None.getValue());
        definition.staticFunctions = staticFunctions;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);

        JSValueRef funcVal = jsc.JSObjectGetProperty(context, jsObj, "print_number", null);
        assertTrue(!funcVal.isUndefined());
        JSObjectRef funcObj = jsc.JSValueToObject(context, funcVal, null);
        assertTrue(funcObj.p() != 0);

        JSValueRef value = jsc.JSObjectCallAsFunction(context, funcObj, jsObj, JSValueArrayRef.EMPTY, null);
        assertTrue(value.p() != 0);
        assertTrue(value.toInt() == 8765);
    }

    @Test
    public void testJSObjectStaticFunctionsCallback1() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition definition = new JSClassDefinition();
        JSStaticFunctions staticFunctions = new JSStaticFunctions();
        staticFunctions.add("print_number", new JSObjectCallAsFunctionCallback() {
            public JSValueRef callAsFunction(JSContextRef ctx, JSObjectRef function,
                        JSObjectRef thisObject, int argumentCount,
                        JSValueArrayRef arguments, Pointer exception) {
                assertTrue(function.p() != 0);
                assertTrue(argumentCount == 1);
                assertTrue("Hello, World".equals(arguments.get(ctx, 0).toString()));
                return jsc.JSValueMakeNumber(ctx, 1234);
            }
        }, JSPropertyAttribute.None.getValue());
        definition.staticFunctions = staticFunctions;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);

        JSValueArrayRef argv = new JSValueArrayRef(1);
        argv.set(0, jsc.JSValueMakeString(context, "Hello, World"));

        JSValueRef funcVal = jsc.JSObjectGetProperty(context, jsObj, "print_number", null);
        assertTrue(!funcVal.isUndefined());
        JSObjectRef funcObj = jsc.JSValueToObject(context, funcVal, null);
        assertTrue(funcObj.p() != 0);

        JSValueRef value = jsc.JSObjectCallAsFunction(context, funcObj, jsObj, argv, null);
        assertTrue(value.p() != 0);
        assertTrue(value.toInt() == 1234);
        argv.dispose();
    }

    @Test
    public void testDerivedObjectHasPropertyCallback() {
        JSGlobalContextRef context = vm.getDefaultContext();
        JSClassDefinition grandParentDefinition = new JSClassDefinition();
        grandParentDefinition.className = "GrandParent";
        grandParentDefinition.hasProperty = new JSObjectHasPropertyCallback() {
            public boolean hasProperty(JSContextRef ctx, JSObjectRef object, String propertyName) {
                return true;
            }
        };
        grandParentDefinition.hasInstance = new JSObjectHasInstanceCallback() {
            public boolean hasInstance(JSContextRef ctx, JSObjectRef constructor,
                                JSValueRef possibleInstance, Pointer exception) {
                return false;
            }
        };
        grandParentDefinition.getPropertyNames = new JSObjectGetPropertyNamesCallback() {
            public void getPropertyNames(JSContextRef ctx, JSObjectRef object,
                                            JSPropertyNameAccumulatorRef propertyNames) {
            }
        };
        grandParentDefinition.getProperty = new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                if (propertyName.equals("unknown_property1")) {
                    return jsc.JSValueMakeNumber(ctx, 1);
                } else if (propertyName.equals("unknown_property2")) {
                    return jsc.JSValueMakeNumber(ctx, 2);
                }
                return null;
            }
        };
        grandParentDefinition.setProperty = new JSObjectSetPropertyCallback() {
            public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                return true;
            }
        };
        grandParentDefinition.deleteProperty = new JSObjectDeletePropertyCallback() {
            public boolean deleteProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                return true;
            }
        };
        grandParentDefinition.convertToType = new JSObjectConvertToTypeCallback() {
            public JSValueRef convertToType(JSContextRef ctx, JSObjectRef object, JSType type,
                                        Pointer exception) {
                return jsc.JSValueMakeBoolean(ctx, true);
            }
        } ;
        JSClassRef grandParentClass = jsc.JSClassCreate(grandParentDefinition);
        JSObjectRef grandParent = jsc.JSObjectMake(context, grandParentClass);

        JSClassDefinition parentDefinition = new JSClassDefinition();
        parentDefinition.className = "Parent";
        parentDefinition.parentClass = grandParentClass;
        parentDefinition.hasProperty = new JSObjectHasPropertyCallback() {
            public boolean hasProperty(JSContextRef ctx, JSObjectRef object, String propertyName) {
                return false;
            }
        };
        parentDefinition.hasInstance = new JSObjectHasInstanceCallback() {
            public boolean hasInstance(JSContextRef ctx, JSObjectRef constructor,
                                JSValueRef possibleInstance, Pointer exception) {
                return false;
            }
        };
        parentDefinition.getPropertyNames = new JSObjectGetPropertyNamesCallback() {
            public void getPropertyNames(JSContextRef ctx, JSObjectRef object,
                                            JSPropertyNameAccumulatorRef propertyNames) {
            }
        };
        parentDefinition.getProperty = new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                return null;
            }
        };
        parentDefinition.setProperty = new JSObjectSetPropertyCallback() {
            public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                return false;
            }
        };
        parentDefinition.deleteProperty = new JSObjectDeletePropertyCallback() {
            public boolean deleteProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                return false;
            }
        };
        parentDefinition.convertToType = new JSObjectConvertToTypeCallback() {
            public JSValueRef convertToType(JSContextRef ctx, JSObjectRef object, JSType type,
                                        Pointer exception) {
                return JSValueRef.Null();
            }
        } ;
        JSClassRef parentClass = jsc.JSClassCreate(parentDefinition);
        JSObjectRef parent = jsc.JSObjectMake(context, parentClass);

        JSClassDefinition definition = new JSClassDefinition();
        definition.className = "child";
        definition.parentClass = parentClass;
        definition.hasProperty = new JSObjectHasPropertyCallback() {
            public boolean hasProperty(JSContextRef ctx, JSObjectRef object, String propertyName) {
                return false;
            }
        };
        definition.hasInstance = new JSObjectHasInstanceCallback() {
            public boolean hasInstance(JSContextRef ctx, JSObjectRef constructor,
                                JSValueRef possibleInstance, Pointer exception) {
                return false;
            }
        };
        definition.getPropertyNames = new JSObjectGetPropertyNamesCallback() {
            public void getPropertyNames(JSContextRef ctx, JSObjectRef object,
                                            JSPropertyNameAccumulatorRef propertyNames) {
            }
        };
        definition.getProperty = new JSObjectGetPropertyCallback() {
            public JSValueRef getProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                return null;
            }
        };
        definition.setProperty = new JSObjectSetPropertyCallback() {
            public boolean setProperty(JSContextRef ctx, JSObjectRef object,
                        String propertyName, JSValueRef value, Pointer exception) {
                return false;
            }
        };
        definition.deleteProperty = new JSObjectDeletePropertyCallback() {
            public boolean deleteProperty(JSContextRef ctx, JSObjectRef object,
                                        String propertyName, Pointer exception) {
                return false;
            }
        };
        definition.convertToType = new JSObjectConvertToTypeCallback() {
            public JSValueRef convertToType(JSContextRef ctx, JSObjectRef object, JSType type,
                                        Pointer exception) {
                return JSValueRef.Null();
            }
        } ;

        JSClassRef jsClass = jsc.JSClassCreate(definition);
        JSObjectRef jsObj = jsc.JSObjectMake(context, jsClass);

        JSValueRef value1 = jsc.JSObjectGetProperty(context, jsObj, "unknown_property1", null);
        assertTrue(value1.isNumber() && value1.toInt() == 1);
/*

        jsc.JSObjectSetProperty(context, jsObj, "unknown_property2", jsc.JSValueMakeNumber(context, 2), 0);
        JSValueRef value2 = jsc.JSObjectGetProperty(context, jsObj, "unknown_property2");
        assertTrue(value2.isNumber() && value2.toInt() == 2);

        JSValueRef value2 = jsc.JSObjectGetProperty(context, jsObj, "unknown_property2");
        assertTrue(value2.isUndefined());

        jsc.JSValueIsInstanceOfConstructor(context, jsObj, jsObj);
        jsc.JSObjectCopyPropertyNames(context, jsObj);
        jsc.JSObjectDeleteProperty(context, jsObj, "unknown_property1");
        jsc.JSValueToNumber(context, jsObj);
        jsc.JSObjectCallAsFunction(context, jsObj, jsObj, new JSValueArrayRef(0));
        jsc.JSObjectCallAsConstructor(context, jsObj, new JSValueArrayRef(0), null);
*/
    }
}