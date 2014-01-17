//
//  JS_android_view_MotionEvent.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_view_MotionEvent.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_view_MotionEvent;
JSClassDefinition ClassDefinitionConstructorForJava_android_view_MotionEvent;
JSClassRef ClassRefForJava_android_view_MotionEvent;
JSClassRef ClassRefConstructorForJava_android_view_MotionEvent;

JSValueRef getActionForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.MotionEvent", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getAction", "()I");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.MotionEvent#getAction", exception);
        (*env)->DeleteLocalRef(env, javaClass);
        
        jint result = (*env)->CallIntMethod(env, p->object, methodId);
        CHECK_JAVAEXCEPTION
        JNI_ENV_EXIT
        
        return JSValueMakeNumber(ctx, (int)result);
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef getRawXForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.MotionEvent", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getRawX", "()F");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.MotionEvent#getRawX", exception);
        (*env)->DeleteLocalRef(env, javaClass);
        
        jfloat result = (*env)->CallFloatMethod(env, p->object, methodId);
        CHECK_JAVAEXCEPTION
        JNI_ENV_EXIT
        
        return JSValueMakeNumber(ctx, (float)result);
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef getRawYForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.MotionEvent", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getRawY", "()F");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.MotionEvent#getRawY", exception);
        (*env)->DeleteLocalRef(env, javaClass);
        
        jfloat result = (*env)->CallFloatMethod(env, p->object, methodId);
        CHECK_JAVAEXCEPTION
        JNI_ENV_EXIT
        
        return JSValueMakeNumber(ctx, (float)result);
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef GetACTION_MOVEForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.MotionEvent", exception);
    
    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "ACTION_MOVE", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.view.MotionEvent.ACTION_MOVE", exception);
    
    jint MATCH_PARENT = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)MATCH_PARENT);
}

JSValueRef GetACTION_UPForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.MotionEvent", exception);
    
    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "ACTION_UP", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.view.MotionEvent.ACTION_UP", exception);
    
    jint MATCH_PARENT = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)MATCH_PARENT);
}

static JSStaticValue StaticValueArrayForJava_android_view_MotionEvent [] = {
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_android_view_MotionEvent [] = {
    { "getAction", getActionForJava_android_view_MotionEvent, kJSPropertyAttributeNone },
    { "getRawX", getRawXForJava_android_view_MotionEvent, kJSPropertyAttributeNone },
    { "getRawY", getRawYForJava_android_view_MotionEvent, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_android_view_MotionEvent [] = {
    { 0, 0, 0 }
};

static JSStaticValue StaticValueArrayConstructorForJava_android_view_MotionEvent [] = {
    { "ACTION_MOVE", GetACTION_MOVEForJava_android_view_MotionEvent, 0, kJSPropertyAttributeReadOnly },
    { "ACTION_UP", GetACTION_UPForJava_android_view_MotionEvent, 0, kJSPropertyAttributeReadOnly },
    { 0, 0, 0, 0 }
};

void InitializerForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_android_view_MotionEvent(JSObjectRef object)
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

JSObjectRef MakeObjectConstructorForJava_android_view_MotionEvent(JSContextRef ctx)
{
    JNI_ENV_ENTER
    JSObjectRef object = JSObjectMake(ctx, CreateClassConstructorForJava_android_view_MotionEvent(), 0);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeObjectForJava_android_view_MotionEvent(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_view_MotionEvent(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/view/MotionEvent");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: android.view.MotionEvent", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(III)V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: android.view.MotionEvent#<init>(III)V", exception), exception);
    }

    JSObjectRef object = NULL;
    if (argumentCount >= 3) {
        int arg0 = JSValueToNumber(ctx, arguments[0], exception);
        int arg1 = JSValueToNumber(ctx, arguments[1], exception);
        int arg2 = JSValueToNumber(ctx, arguments[2], exception);
        jobject javaObject = (*env)->NewObject(env, javaClass, initMethodId, arg0, arg1, arg2);
        (*env)->DeleteLocalRef(env, javaClass);
        
        CHECK_JAVAEXCEPTION
        
        if (JAVA_EXCEPTION_OCCURED) {
            object = JSValueToObject(ctx, JSValueMakeUndefined(ctx), NULL);
        } else {
            JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
            p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
            (*env)->DeleteLocalRef(env, javaObject);
            object = JSObjectMake(ctx, CreateClassForJava_android_view_MotionEvent(), (void*)p);
        }
    }
    JNI_ENV_EXIT
    
    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_android_view_MotionEvent(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_android_view_MotionEvent(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_android_view_MotionEvent()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_view_MotionEvent = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_view_MotionEvent.staticValues = StaticValueArrayForJava_android_view_MotionEvent;
        ClassDefinitionForJava_android_view_MotionEvent.staticFunctions = StaticFunctionArrayForJava_android_view_MotionEvent;
        ClassDefinitionForJava_android_view_MotionEvent.initialize = InitializerForJava_android_view_MotionEvent;
        ClassDefinitionForJava_android_view_MotionEvent.finalize = FinalizerForJava_android_view_MotionEvent;
        ClassDefinitionForJava_android_view_MotionEvent.className = "MotionEvent";
        
        ClassDefinitionForJava_android_view_MotionEvent.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_view_MotionEvent = JSClassCreate(&ClassDefinitionForJava_android_view_MotionEvent);
        
        JSClassRetain(ClassRefForJava_android_view_MotionEvent);
    }
    return ClassRefForJava_android_view_MotionEvent;
}

JSClassRef CreateClassConstructorForJava_android_view_MotionEvent ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_view_MotionEvent = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_view_MotionEvent.className = "MotionEvent";
        ClassDefinitionConstructorForJava_android_view_MotionEvent.callAsConstructor = MakeInstanceForJava_android_view_MotionEvent;
        ClassDefinitionConstructorForJava_android_view_MotionEvent.callAsFunction = MakeInstanceFromFunctionForJava_android_view_MotionEvent;
        ClassDefinitionConstructorForJava_android_view_MotionEvent.staticFunctions = StaticFunctionArrayConstructorForJava_android_view_MotionEvent;
        ClassDefinitionConstructorForJava_android_view_MotionEvent.staticValues = StaticValueArrayConstructorForJava_android_view_MotionEvent;
        
        ClassDefinitionConstructorForJava_android_view_MotionEvent.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_view_MotionEvent = JSClassCreate(&ClassDefinitionConstructorForJava_android_view_MotionEvent);
        
        JSClassRetain(ClassRefConstructorForJava_android_view_MotionEvent);
    }
    return ClassRefConstructorForJava_android_view_MotionEvent;
}

#ifdef __cplusplus
}
#endif