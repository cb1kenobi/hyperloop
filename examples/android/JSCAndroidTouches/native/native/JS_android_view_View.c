//
//  JS_android_view_View.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_view_View.h"
#include "JS_android_view_View_OnTouchListener.h"
#include "JS_android_widget_FrameLayout_LayoutParams.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_view_View;
JSClassDefinition ClassDefinitionConstructorForJava_android_view_View;
JSClassRef ClassRefForJava_android_view_View;
JSClassRef ClassRefConstructorForJava_android_view_View;

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

JSValueRef setBackgroundColorForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        
        int arg0 = JSValueToNumber(ctx, arguments[0], exception);
        
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setBackgroundColor", "(I)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#setBackgroundColor", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->CallVoidMethod(env, p->object, methodId, arg0);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef setLayoutParamsForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeUndefined(ctx);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setLayoutParams", "(Landroid/view/ViewGroup$LayoutParams;)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#setLayoutParams", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->CallVoidMethod(env, p->object, methodId, arg0->object);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef getLayoutParamsForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getLayoutParams", "()Landroid/view/ViewGroup$LayoutParams;");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#getLayoutParams", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        jobject result = (*env)->CallObjectMethod(env, p->object, methodId);
        JNI_ENV_EXIT
        
        return MakeObjectForJava_android_widget_FrameLayout_LayoutParams(ctx, result);
    }
    
    return JSValueMakeUndefined(ctx);
}

JSValueRef getWidthForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getWidth", "()I");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#getWidth", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        jint result = (*env)->CallIntMethod(env, p->object, methodId);

        JNI_ENV_EXIT
        
        return JSValueMakeNumber(ctx, (int)result);
    }
    return JSValueMakeUndefined(ctx);
}

JSValueRef getHeightForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "getHeight", "()I");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#getHeight", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        jint result = (*env)->CallIntMethod(env, p->object, methodId);

        JNI_ENV_EXIT
        
        return JSValueMakeNumber(ctx, (int)result);
    }
    return JSValueMakeUndefined(ctx);
}

JSValueRef setOnTouchListenerForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0) {
        JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        if (arg0 == NULL || arg0->object == NULL) return JSValueMakeUndefined(ctx);
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/view/View");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.View", exception);
        
        jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setOnTouchListener", "(Landroid/view/View$OnTouchListener;)V");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.view.View#setOnTouchListener", exception);
        
        (*env)->DeleteLocalRef(env, javaClass);
        (*env)->CallVoidMethod(env, p->object, methodId, arg0->object);
        JNI_ENV_EXIT
    }
    
    return JSValueMakeUndefined(ctx);
}

static JSStaticValue StaticValueArrayForJava_android_view_View [] = {
    { 0, 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayForJava_android_view_View [] = {
    { "setOnTouchListener", setOnTouchListenerForJava_android_view_View, kJSPropertyAttributeNone },
    { "setLayoutParams", setLayoutParamsForJava_android_view_View, kJSPropertyAttributeNone },
    { "getLayoutParams", getLayoutParamsForJava_android_view_View, kJSPropertyAttributeNone },
    { "setBackgroundColor", setBackgroundColorForJava_android_view_View, kJSPropertyAttributeNone },
    { "getWidth", getWidthForJava_android_view_View, kJSPropertyAttributeNone },
    { "getHeight", getHeightForJava_android_view_View, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

static JSStaticFunction StaticFunctionArrayConstructorForJava_android_view_View [] = {
    { 0, 0, 0 }
};

void InitializerForJava_android_view_View(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_android_view_View(JSObjectRef object)
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

JSObjectRef MakeObjectConstructorForJava_android_view_View(JSContextRef ctx)
{
    JNI_ENV_ENTER
    JSObjectRef object = JSObjectMake(ctx, CreateClassConstructorForJava_android_view_View(), 0);
    /* android.view.View.OnTouchListener */
    JS_registerObject(ctx, object, "OnTouchListener", MakeObjectConstructorForJava_android_view_View_OnTouchListener(ctx));
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeObjectForJava_android_view_View(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_view_View(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_android_view_View(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/view/View");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: android.view.View", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(Landroid/content/Context;)V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: android.view.View#<init>(Landroid/content/Context;)V", exception), exception);
    }

    JSObjectRef object = NULL;
    if (argumentCount > 0 && JSValueIsObject(ctx, arguments[0])) {
        JSPrivateObject* arg0Obj = JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], exception));
        jobject javaObject = (*env)->NewObject(env, javaClass, initMethodId, arg0Obj->object);
    
        JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
        p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
        
        (*env)->DeleteLocalRef(env, javaObject);
        (*env)->DeleteLocalRef(env, javaClass);

        object = JSObjectMake(ctx, CreateClassForJava_android_view_View(), (void*)p);
    }
    JNI_ENV_EXIT
    
    return object;
}

JSValueRef MakeInstanceFromFunctionForJava_android_view_View(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_android_view_View(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_android_view_View()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_view_View = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_view_View.staticValues = StaticValueArrayForJava_android_view_View;
        ClassDefinitionForJava_android_view_View.staticFunctions = StaticFunctionArrayForJava_android_view_View;
        ClassDefinitionForJava_android_view_View.initialize = InitializerForJava_android_view_View;
        ClassDefinitionForJava_android_view_View.finalize = FinalizerForJava_android_view_View;
        ClassDefinitionForJava_android_view_View.className = "View";
        
        ClassDefinitionForJava_android_view_View.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_view_View = JSClassCreate(&ClassDefinitionForJava_android_view_View);
        
        JSClassRetain(ClassRefForJava_android_view_View);
    }
    return ClassRefForJava_android_view_View;
}

JSClassRef CreateClassConstructorForJava_android_view_View ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_view_View = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_view_View.className = "View";
        ClassDefinitionConstructorForJava_android_view_View.callAsConstructor = MakeInstanceForJava_android_view_View;
        ClassDefinitionConstructorForJava_android_view_View.callAsFunction = MakeInstanceFromFunctionForJava_android_view_View;
        ClassDefinitionConstructorForJava_android_view_View.staticFunctions = StaticFunctionArrayConstructorForJava_android_view_View;
        
        ClassDefinitionConstructorForJava_android_view_View.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_view_View = JSClassCreate(&ClassDefinitionConstructorForJava_android_view_View);
        
        JSClassRetain(ClassRefConstructorForJava_android_view_View);
    }
    return ClassRefConstructorForJava_android_view_View;
}

#ifdef __cplusplus
}
#endif