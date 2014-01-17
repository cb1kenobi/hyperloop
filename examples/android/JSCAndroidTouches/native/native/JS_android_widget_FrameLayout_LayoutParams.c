//
//  JS_android_widget_FrameLayout_LayoutParams.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_widget_FrameLayout_LayoutParams.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams;
JSClassDefinition ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams;
JSClassRef ClassRefForJava_android_widget_FrameLayout_LayoutParams;
JSClassRef ClassRefConstructorForJava_android_widget_FrameLayout_LayoutParams;

JSValueRef setMarginsForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount >= 4) {
        int arg0 = JSValueToNumber(ctx, arguments[0], exception);
        int arg1 = JSValueToNumber(ctx, arguments[1], exception);
        int arg2 = JSValueToNumber(ctx, arguments[2], exception);
        int arg3 = JSValueToNumber(ctx, arguments[3], exception);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout$LayoutParams", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setMargins", "(IIII)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.widget.FrameLayout$LayoutParams#setMargins", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->CallVoidMethod(env, p->object, methodId, arg0, arg1, arg2, arg3);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

/*
 * Note: Dalvik VM can not find static constant FrameLayout.LayoutParams.MATCH_PARENT
 *       that is declared in super-class ViewGroup.LayoutParams
 *
 *    otherwise we get:
 *
 *    JNI WARNING: static fieldID 0x4190dec8 not valid for class
 *    Landroid/widget/FrameLayout$LayoutParams; (GetStaticIntField)
 *    base=0x419d4eb8 count=0
 *
 *    So we need to search field in superclass (the class which actually defines the constant) instead.
 */
JSValueRef GetMATCH_PARENTForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    /*** 
    // following code should cause runtime error at GetStaticIntField. We should look into superclass instead.
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
     ***/
    jclass  javaClass = (*env)->FindClass(env, "android/view/ViewGroup$LayoutParams");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.ViewGroup.LayoutParams", exception);
    
    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "MATCH_PARENT", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.widget.FrameLayout$LayoutParams.MATCH_PARENT", exception);
    
    jint MATCH_PARENT = (*env)->GetStaticIntField(env, javaClass, fieldId);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)MATCH_PARENT);
}

JSValueRef GettopMarginForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout$LayoutParams", exception);
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        jfieldID fieldId = (*env)->GetFieldID(env, javaClass, "topMargin", "I");
        if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.widget.FrameLayout$LayoutParams.topMargin", exception);
    
        (*env)->DeleteLocalRef(env, javaClass);
        jint topMargin = (*env)->GetIntField(env, p->object, fieldId);
        JNI_ENV_EXIT
        return JSValueMakeNumber(ctx, (int)topMargin);
    }
    JNI_ENV_EXIT
    return JSValueMakeUndefined(ctx);
}

bool SettopMarginForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName,   JSValueRef value, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout$LayoutParams", exception);
    
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        jfieldID fieldId = (*env)->GetFieldID(env, javaClass, "topMargin", "I");
        if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.widget.FrameLayout$LayoutParams.topMargin", exception);
    
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->SetIntField(env,  p->object, fieldId, (int)JSValueToNumber(ctx, value, NULL));
    }
    JNI_ENV_EXIT
    
    return true;
}

JSValueRef GetleftMarginForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout$LayoutParams", exception);
    
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        jfieldID fieldId = (*env)->GetFieldID(env, javaClass, "leftMargin", "I");
        if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.widget.FrameLayout$LayoutParams.leftMargin", exception);
    
        (*env)->DeleteLocalRef(env, javaClass);
        jint leftMargin = (*env)->GetIntField(env, p->object, fieldId);
        
        JNI_ENV_EXIT
        return JSValueMakeNumber(ctx, (int)leftMargin);
    }
    JNI_ENV_EXIT
    return JSValueMakeUndefined(ctx);
}

bool SetleftMarginForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef value, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout$LayoutParams", exception);
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        jfieldID fieldId = (*env)->GetFieldID(env, javaClass, "leftMargin", "I");
        if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.widget.FrameLayout$LayoutParams.leftMargin", exception);
    
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->SetIntField(env, p->object, fieldId, (int)JSValueToNumber(ctx, value, NULL));
    }
    JNI_ENV_EXIT
    
    return true;
}

static JSStaticValue StaticValueArrayForJava_android_widget_FrameLayout_LayoutParams [] = {
    { "topMargin", GettopMarginForJava_android_widget_FrameLayout_LayoutParams, SettopMarginForJava_android_widget_FrameLayout_LayoutParams, kJSPropertyAttributeNone },
    { "leftMargin", GetleftMarginForJava_android_widget_FrameLayout_LayoutParams, SetleftMarginForJava_android_widget_FrameLayout_LayoutParams, kJSPropertyAttributeNone },
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_android_widget_FrameLayout_LayoutParams [] = {
    { "setMargins", setMarginsForJava_android_widget_FrameLayout_LayoutParams, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_android_widget_FrameLayout_LayoutParams [] = {
    { 0, 0, 0 }
};

static JSStaticValue StaticValueArrayConstructorForJava_android_widget_FrameLayout_LayoutParams [] = {
    { "MATCH_PARENT", GetMATCH_PARENTForJava_android_widget_FrameLayout_LayoutParams, 0, kJSPropertyAttributeReadOnly },
    { 0, 0, 0, 0 }
};

void InitializerForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_android_widget_FrameLayout_LayoutParams(JSObjectRef object)
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

JSObjectRef MakeObjectConstructorForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx)
{
    JNI_ENV_ENTER
    JSObjectRef object = JSObjectMake(ctx, CreateClassConstructorForJava_android_widget_FrameLayout_LayoutParams(), 0);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeObjectForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_widget_FrameLayout_LayoutParams(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout$LayoutParams");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: android.widget.FrameLayout$LayoutParams", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(III)V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: android.widget.FrameLayout$LayoutParams#<init>(III)V", exception), exception);
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
            object = JSObjectMake(ctx, CreateClassForJava_android_widget_FrameLayout_LayoutParams(), (void*)p);
        }
    }
    JNI_ENV_EXIT
    
    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_android_widget_FrameLayout_LayoutParams(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_android_widget_FrameLayout_LayoutParams(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_android_widget_FrameLayout_LayoutParams()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.staticValues = StaticValueArrayForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.staticFunctions = StaticFunctionArrayForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.initialize = InitializerForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.finalize = FinalizerForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.className = "LayoutParams";
        
        ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_widget_FrameLayout_LayoutParams = JSClassCreate(&ClassDefinitionForJava_android_widget_FrameLayout_LayoutParams);
        
        JSClassRetain(ClassRefForJava_android_widget_FrameLayout_LayoutParams);
    }
    return ClassRefForJava_android_widget_FrameLayout_LayoutParams;
}

JSClassRef CreateClassConstructorForJava_android_widget_FrameLayout_LayoutParams ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.className = "LayoutParams";
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.callAsConstructor = MakeInstanceForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.callAsFunction = MakeInstanceFromFunctionForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.staticFunctions = StaticFunctionArrayConstructorForJava_android_widget_FrameLayout_LayoutParams;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.staticValues = StaticValueArrayConstructorForJava_android_widget_FrameLayout_LayoutParams;
        
        ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_widget_FrameLayout_LayoutParams = JSClassCreate(&ClassDefinitionConstructorForJava_android_widget_FrameLayout_LayoutParams);
        
        JSClassRetain(ClassRefConstructorForJava_android_widget_FrameLayout_LayoutParams);
    }
    return ClassRefConstructorForJava_android_widget_FrameLayout_LayoutParams;
}

#ifdef __cplusplus
}
#endif