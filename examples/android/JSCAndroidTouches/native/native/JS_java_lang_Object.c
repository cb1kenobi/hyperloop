//
//  JS_java_lang_Object.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/9/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_java_lang_Object;
JSClassDefinition ClassDefinitionConstructorForJava_java_lang_Object;
JSClassRef ClassRefForJava_java_lang_Object;
JSClassRef ClassRefConstructorForJava_java_lang_Object;

JSValueRef equalsConstructorForJava_java_lang_Object(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], NULL));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeBoolean(ctx, false);
        JNI_ENV_ENTER
        
        jclass  javaClass = (*env)->FindClass(env, "java/lang/Object");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: java.lang.Object", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "equals", "(Ljava/lang/Object;)Z");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: java.lang.Object#equals", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        
        jboolean result = (*env)->CallBooleanMethod(env, p->object, methodId, arg0->object);
        
        CHECK_JAVAEXCEPTION
        JNI_ENV_EXIT
        return result == JNI_TRUE ? JSValueMakeBoolean(ctx, true) : JSValueMakeBoolean(ctx, false);
    }
    return JSValueMakeBoolean(ctx, false);
}

/*
 * Unlike Java API, this toString() returns JavaScript String, not Java String.
 */
JSValueRef toStringConstructorForJava_java_lang_Object(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "java/lang/Object");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: java.lang.Object", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "toString", "()Ljava/lang/String;");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: java.lang.Object#toString", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        jobject result = (*env)->CallObjectMethod(env, p->object, methodId);
        CHECK_JAVAEXCEPTION
        
        JSSTRINGREF_FROM_JSTRING(result, string);
        JSValueRef value = JSValueMakeString(ctx, string);
        JSSTRING_RELEASE(string);
        (*env)->DeleteLocalRef(env, result);
        JNI_ENV_EXIT
        return value;
    }
    return NULL;
}

static JSStaticValue StaticValueArrayForJava_java_lang_Object [] = {
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_java_lang_Object [] = {
    { "equals", equalsConstructorForJava_java_lang_Object, kJSPropertyAttributeNone },
    { "toString", toStringConstructorForJava_java_lang_Object, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_java_lang_Object [] = {
    { 0, 0, 0 }
};

void InitializerForJava_java_lang_Object(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_java_lang_Object(JSObjectRef object)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        (*env)->DeleteGlobalRef(env, p->object); // release Java Object
        free(p);
    }
    JSObjectSetPrivate(object, NULL);
    JNI_ENV_EXIT
}

JSValueRef JSTypeConvertorForJava_java_lang_Object(JSContextRef ctx, JSObjectRef object, JSType type, JSValueRef* exception)
{
    // TODO
    return NULL;
}

bool IsInstanceForJava_java_lang_Object(JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, possibleInstance, NULL));
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "java/lang/Object");
        jboolean result = (*env)->IsInstanceOf(env, p->object, javaClass);
        (*env)->DeleteLocalRef(env, javaClass);
        JNI_ENV_EXIT
        return result == JNI_TRUE ? true : false;
    }
    return false;
}

JSObjectRef MakeObjectConstructorForJava_java_lang_Object(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_java_lang_Object(), 0);
}

JSObjectRef MakeObjectForJava_java_lang_Object(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_java_lang_Object(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_java_lang_Object(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "java/lang/Object");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: java.lang.Object", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "()V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.Object#<init>()V", exception), exception);
    }
    
    jobject javaObject = (*env)->NewObject(env, javaClass, initMethodId);
    (*env)->DeleteLocalRef(env, javaClass);
    JSObjectRef object = NULL;
    
    CHECK_JAVAEXCEPTION
    if  (JAVA_EXCEPTION_OCCURED) {
        object = JSValueToObject(ctx, JSValueMakeUndefined(ctx), NULL);
    } else {
        JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
        p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
        (*env)->DeleteLocalRef(env, javaObject);
        object = JSObjectMake(ctx, CreateClassForJava_java_lang_Object(), (void*)p);
    }
    
    JNI_ENV_EXIT
    
    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_java_lang_Object(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_java_lang_Object(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_java_lang_Object()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_java_lang_Object = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_java_lang_Object.staticValues = StaticValueArrayForJava_java_lang_Object;
        ClassDefinitionForJava_java_lang_Object.staticFunctions = StaticFunctionArrayForJava_java_lang_Object;
        ClassDefinitionForJava_java_lang_Object.initialize = InitializerForJava_java_lang_Object;
        ClassDefinitionForJava_java_lang_Object.finalize = FinalizerForJava_java_lang_Object;
        ClassDefinitionForJava_java_lang_Object.convertToType = JSTypeConvertorForJava_java_lang_Object;
        ClassDefinitionForJava_java_lang_Object.className = "Object";
        ClassDefinitionForJava_java_lang_Object.hasInstance = IsInstanceForJava_java_lang_Object;
        
        ClassDefinitionForJava_java_lang_Object.parentClass = NULL;
        ClassRefForJava_java_lang_Object = JSClassCreate(&ClassDefinitionForJava_java_lang_Object);
        
        JSClassRetain(ClassRefForJava_java_lang_Object);
    }
    return ClassRefForJava_java_lang_Object;
}

JSClassRef CreateClassConstructorForJava_java_lang_Object ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_java_lang_Object = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_java_lang_Object.className = "Object";
        ClassDefinitionConstructorForJava_java_lang_Object.callAsConstructor = MakeInstanceForJava_java_lang_Object;
        ClassDefinitionConstructorForJava_java_lang_Object.callAsFunction = MakeInstanceFromFunctionForJava_java_lang_Object;
        ClassDefinitionConstructorForJava_java_lang_Object.staticFunctions = StaticFunctionArrayConstructorForJava_java_lang_Object;
        ClassDefinitionConstructorForJava_java_lang_Object.hasInstance = IsInstanceForJava_java_lang_Object;
        
        ClassDefinitionConstructorForJava_java_lang_Object.parentClass = NULL;
        ClassRefConstructorForJava_java_lang_Object = JSClassCreate(&ClassDefinitionConstructorForJava_java_lang_Object);
        
        JSClassRetain(ClassRefConstructorForJava_java_lang_Object);
    }
    return ClassRefConstructorForJava_java_lang_Object;
}

#ifdef __cplusplus
}
#endif
