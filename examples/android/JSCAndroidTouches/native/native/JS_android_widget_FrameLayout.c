//
//  JS_android_widget_FrameLayout.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_widget_FrameLayout.h"
#include "JS_android_widget_FrameLayout_LayoutParams.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_widget_FrameLayout;
JSClassDefinition ClassDefinitionConstructorForJava_android_widget_FrameLayout;
JSClassRef ClassRefForJava_android_widget_FrameLayout;
JSClassRef ClassRefConstructorForJava_android_widget_FrameLayout;

static bool JS_registerObject(JSContextRef context, JSObjectRef parentObject,
                      const char* className, JSObjectRef classObject)
{
    JSStringRef js_className = JSStringCreateWithUTF8CString(className);
    JSObjectSetProperty(context, parentObject,
                        js_className, classObject,
                        kJSPropertyAttributeNone, NULL);
    JSStringRelease(js_className);
    return true;
}

JSValueRef addViewForJava_android_widget_FrameLayout(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeUndefined(ctx);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "addView", "(Landroid/view/View;)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.widget.FrameLayout#addView", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        
        (*env)->CallVoidMethod(env, p->object, methodId, arg0->object);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef setLayoutParamsForJava_android_widget_FrameLayout(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeUndefined(ctx);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.widget.FrameLayout", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setLayoutParams", "(Landroid/view/ViewGroup$LayoutParams;)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.widget.FrameLayout#setLayoutParams", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->CallVoidMethod(env, p->object, methodId, arg0->object);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

static JSStaticValue StaticValueArrayForJava_android_widget_FrameLayout [] = {
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_android_widget_FrameLayout [] = {
    { "setLayoutParams", setLayoutParamsForJava_android_widget_FrameLayout, kJSPropertyAttributeNone },
    { "addView", addViewForJava_android_widget_FrameLayout, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_android_widget_FrameLayout [] = {
    { 0, 0, 0 }
};

void InitializerForJava_android_widget_FrameLayout(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_android_widget_FrameLayout(JSObjectRef object)
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

JSObjectRef MakeObjectConstructorForJava_android_widget_FrameLayout(JSContextRef ctx)
{
    JSObjectRef object = JSObjectMake(ctx, CreateClassConstructorForJava_android_widget_FrameLayout(), 0);
    JS_registerObject(ctx, object, "LayoutParams", MakeObjectConstructorForJava_android_widget_FrameLayout_LayoutParams(ctx)); /* android.widget.FrameLayout.LayoutParams */
    return object;
}

JSObjectRef MakeObjectForJava_android_widget_FrameLayout(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_widget_FrameLayout(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_android_widget_FrameLayout(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/widget/FrameLayout");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: android.widget.FrameLayout", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Landroid/content/Context;)V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: android.widget.FrameLayout#<init>(Landroid/content/Context;)V", exception), exception);
    }

    JSObjectRef object = NULL;
    if (argumentCount > 0 && JSValueIsObject(ctx, arguments[0])) {
        JSPrivateObject* arg0Obj = JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        jobject javaObject = (*env)->NewObject(env, javaClass, initMethodId, arg0Obj->object);
    
        JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
        p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    
        (*env)->DeleteLocalRef(env, javaObject);
        (*env)->DeleteLocalRef(env, javaClass);
        
        object = JSObjectMake(ctx, CreateClassForJava_android_widget_FrameLayout(), (void*)p);
    }
    JNI_ENV_EXIT
    
    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_android_widget_FrameLayout(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_android_widget_FrameLayout(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_android_widget_FrameLayout()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_widget_FrameLayout = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_widget_FrameLayout.staticValues = StaticValueArrayForJava_android_widget_FrameLayout;
        ClassDefinitionForJava_android_widget_FrameLayout.staticFunctions = StaticFunctionArrayForJava_android_widget_FrameLayout;
        ClassDefinitionForJava_android_widget_FrameLayout.initialize = InitializerForJava_android_widget_FrameLayout;
        ClassDefinitionForJava_android_widget_FrameLayout.finalize = FinalizerForJava_android_widget_FrameLayout;
        ClassDefinitionForJava_android_widget_FrameLayout.className = "FrameLayout";
        
        ClassDefinitionForJava_android_widget_FrameLayout.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_widget_FrameLayout = JSClassCreate(&ClassDefinitionForJava_android_widget_FrameLayout);
        
        JSClassRetain(ClassRefForJava_android_widget_FrameLayout);
    }
    return ClassRefForJava_android_widget_FrameLayout;
}

JSClassRef CreateClassConstructorForJava_android_widget_FrameLayout ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_widget_FrameLayout = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout.className = "FrameLayout";
        ClassDefinitionConstructorForJava_android_widget_FrameLayout.callAsConstructor = MakeInstanceForJava_android_widget_FrameLayout;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout.callAsFunction = MakeInstanceFromFunctionForJava_android_widget_FrameLayout;
        ClassDefinitionConstructorForJava_android_widget_FrameLayout.staticFunctions = StaticFunctionArrayConstructorForJava_android_widget_FrameLayout;
        
        ClassDefinitionConstructorForJava_android_widget_FrameLayout.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_widget_FrameLayout = JSClassCreate(&ClassDefinitionConstructorForJava_android_widget_FrameLayout);
        
        JSClassRetain(ClassRefConstructorForJava_android_widget_FrameLayout);
    }
    return ClassRefConstructorForJava_android_widget_FrameLayout;
}

#ifdef __cplusplus
}
#endif