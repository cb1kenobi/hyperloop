//
//  JS_java_lang_String.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/9/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_java_lang_String.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_java_lang_String;
JSClassDefinition ClassDefinitionConstructorForJava_java_lang_String;
JSClassRef ClassRefForJava_java_lang_String;
JSClassRef ClassRefConstructorForJava_java_lang_String;

JSValueRef equalsConstructorForJava_java_lang_String(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], NULL));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeBoolean(ctx, false);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "java/lang/String");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: java.lang.String", exception);

        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "equals", "(Ljava/lang/Object;)Z");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: java.lang.String#equals", exception);
        
        jboolean result = (*env)->CallBooleanMethod(env, p->object, methodId, arg0->object);
        CHECK_JAVAEXCEPTION
        JNI_ENV_EXIT
        return result == JNI_TRUE ? JSValueMakeBoolean(ctx, true) : JSValueMakeBoolean(ctx, false);
    }
    return JSValueMakeBoolean(ctx, false);
}
    
JSValueRef toStringConstructorForJava_java_lang_String(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "java/lang/String");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: java.lang.String", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "toString", "()Ljava/lang/String;");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: java.lang.String#toString", exception);
        
        jobject result = (*env)->CallObjectMethod(env, p->object, methodId);
        CHECK_JAVAEXCEPTION
        JSSTRINGREF_FROM_JSTRING(result, string);
        JSValueRef value = JSValueMakeString(ctx, string);
        JSSTRING_RELEASE(string);
        JNI_ENV_EXIT
        return value;
    }
    return NULL;
}

static JSStaticValue StaticValueArrayForJava_java_lang_String [] = {
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_java_lang_String [] = {
    { "equals", equalsConstructorForJava_java_lang_String, kJSPropertyAttributeNone },
    { "toString", toStringConstructorForJava_java_lang_String, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_java_lang_String [] = {
    { 0, 0, 0 }
};

void InitializerForJava_java_lang_String(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_java_lang_String(JSObjectRef object)
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

JSValueRef JSTypeConvertorForJava_java_lang_String(JSContextRef ctx, JSObjectRef object, JSType type, JSValueRef* exception)
{
    // TODO
    return NULL;
}

bool IsInstanceForJava_java_lang_String(JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, possibleInstance, NULL));
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "java/lang/String");
        jboolean result = (*env)->IsInstanceOf(env, p->object, javaClass);
        JNI_ENV_EXIT
        return result == JNI_TRUE ? true : false;
    }
    return false;
}

JSObjectRef MakeObjectConstructorForJava_java_lang_String(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_java_lang_String(), 0);
}

JSObjectRef MakeObjectForJava_java_lang_String(JSContextRef ctx, jstring javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_java_lang_String(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_java_lang_String(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "java/lang/String");
    if (javaClass == NULL) return JSValueToObject(ctx, HyperloopMakeException(ctx, "Class not found: java.lang.String", exception), exception);

    jmethodID initMethodId = NULL;
    jobject javaObject = NULL;
    
    if (argumentCount == 0) {
        initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "()V");
        if (initMethodId == NULL) {
            return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.String#<init>()V", exception), exception);
        }
        javaObject = (*env)->NewObject(env, javaClass, initMethodId);
    } else if (argumentCount == 1) {
        /* new String from JavaScript String */
        if (JSValueIsString(ctx, arguments[0])) {
            JSStringRef arg0 = JSValueToStringCopy(ctx, arguments[0], NULL);
            JSTRING_FROM_JSSTRINGREF(arg0, arg0C, arg0Obj);
            JSSTRING_RELEASE(arg0);
            initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Ljava/lang/String;)V");
            
            if (initMethodId == NULL) {
                return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.String#<init>(Ljava/lang/String;)V", exception), exception);
            }
            javaObject = (*env)->NewObject(env, javaClass, initMethodId, arg0Obj);
        } else {
            JSObjectRef arg0 = JSValueToObject(ctx, arguments[0], NULL);
            JSPrivateObject* arg0Obj = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arg0, NULL));
            
            if (arg0Obj && arg0Obj->object) {
                /* new String from Java String */
                if ((*env)->IsInstanceOf(env, arg0Obj->object, javaClass)) {
                    initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Ljava/lang/String;)V");
                    if (initMethodId == NULL) {
                        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.String#<init>(Ljava/lang/String;)V", exception), exception);
                    }
                }
                /* new String from Java StringBuffer */
                else if ((*env)->IsInstanceOf(env, arg0Obj->object, (*env)->FindClass(env, "java/lang/StringBuffer"))) {
                    initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Ljava/lang/StringBuffer;)V");
                    if (initMethodId == NULL) {
                        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.String#<init>(Ljava/lang/StringBuffer;)V", exception), exception);
                    }
                }
                /* new String from Java StringBuilder */
                else if ((*env)->IsInstanceOf(env, arg0Obj->object, (*env)->FindClass(env, "java/lang/StringBuilder"))) {
                    initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Ljava/lang/StringBuilder;)V");
                    if (initMethodId == NULL) {
                        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: java.lang.String#<init>(Ljava/lang/StringBuilder;)V", exception), exception);
                    }
                }
                javaObject = (*env)->NewObject(env, javaClass, initMethodId, arg0Obj->object);
            }
        }
    }
    (*env)->DeleteLocalRef(env, javaClass);

    JSObjectRef object = NULL;
    CHECK_JAVAEXCEPTION
    if (JAVA_EXCEPTION_OCCURED) {
        object = JSValueToObject(ctx, JSValueMakeUndefined(ctx), NULL);
    } else {
        JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
        p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
        (*env)->DeleteLocalRef(env, javaObject);
        object = JSObjectMake(ctx, CreateClassForJava_java_lang_String(), (void*)p);
    }
    
    JNI_ENV_EXIT

    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_java_lang_String(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_java_lang_String(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_java_lang_String()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_java_lang_String = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_java_lang_String.staticValues = StaticValueArrayForJava_java_lang_String;
        ClassDefinitionForJava_java_lang_String.staticFunctions = StaticFunctionArrayForJava_java_lang_String;
        ClassDefinitionForJava_java_lang_String.initialize = InitializerForJava_java_lang_String;
        ClassDefinitionForJava_java_lang_String.finalize = FinalizerForJava_java_lang_String;
        ClassDefinitionForJava_java_lang_String.convertToType = JSTypeConvertorForJava_java_lang_String;
        ClassDefinitionForJava_java_lang_String.className = "String";
        ClassDefinitionForJava_java_lang_String.hasInstance = IsInstanceForJava_java_lang_String;
        
        ClassDefinitionForJava_java_lang_String.parentClass = CreateClassForJava_java_lang_Object();
        ClassRefForJava_java_lang_String = JSClassCreate(&ClassDefinitionForJava_java_lang_String);
        
        JSClassRetain(ClassRefForJava_java_lang_String);
    }
    return ClassRefForJava_java_lang_String;
}

JSClassRef CreateClassConstructorForJava_java_lang_String ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_java_lang_String = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_java_lang_String.className = "String";
        ClassDefinitionConstructorForJava_java_lang_String.callAsConstructor = MakeInstanceForJava_java_lang_String;
        ClassDefinitionConstructorForJava_java_lang_String.callAsFunction = MakeInstanceFromFunctionForJava_java_lang_String;
        ClassDefinitionConstructorForJava_java_lang_String.staticFunctions = StaticFunctionArrayConstructorForJava_java_lang_String;
        ClassDefinitionConstructorForJava_java_lang_String.hasInstance = IsInstanceForJava_java_lang_String;
        
        ClassDefinitionConstructorForJava_java_lang_String.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_java_lang_String = JSClassCreate(&ClassDefinitionConstructorForJava_java_lang_String);
        
        JSClassRetain(ClassRefConstructorForJava_java_lang_String);
    }
    return ClassRefConstructorForJava_java_lang_String;
}

#ifdef __cplusplus
}
#endif
