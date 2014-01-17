//
//  HyperloopJNIExport.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/10/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_android_app_Activity.h"
#include "JS_android_os_Bundle.h"
#include "JS_android_view_View.h"
#include "JS_android_view_MotionEvent.h"

#ifdef __cplusplus
extern "C" {
#endif

JavaVM* jvm;

jint JNI_OnLoad(JavaVM* vm, void* reserved)
{
    jvm = vm;
    
    return JNI_VERSION_1_6;
}

JNIEXPORT jlong JNICALL
Java_com_appcelerator_hyperloop_HyperloopJNI_NativeHyperloopCreateVM
(JNIEnv *env, jobject thiz)
{
    return (jlong)HyperloopCreateVM();
}

JNIEXPORT void JNICALL
Java_com_appcelerator_hyperloop_HyperloopJNI_HyperloopCallActivityOnCreate
(JNIEnv *env, jobject thiz, jlong jsContextRef, jobject activity, jobject savedInstanceState)
{
    JSContextRef context = (JSContextRef)jsContextRef;
    JSObjectRef globalObject = JSContextGetGlobalObject(context);
    
    JSStringRef onCreate = JSStringCreateWithUTF8CString("onCreate");
    JSObjectRef onCreateFunc = JSValueToObject(context,
                    JSObjectGetProperty(context, globalObject, onCreate, NULL), NULL);
    JSStringRelease(onCreate);
    
    // save current Activity
    JSObjectRef activityObj = MakeObjectForJava_android_app_Activity(context, activity);
    
    // save parameter
    JSValueRef args[1];
    args[0] = MakeObjectForJava_android_os_Bundle(context, savedInstanceState);

    JSValueRef exception = JSValueMakeNull(context);
    
    // Call onCreate function
    if (JSObjectIsFunction(context, onCreateFunc)) {
        JSObjectCallAsFunction(context, onCreateFunc, activityObj, 1, args, &exception);
    }
    if (!JSValueIsNull(context, exception)) {
        JSStringRef string = JSValueToStringCopy(context, exception, NULL);
        CCHAR_FROM_JSSTRINGREF(string, cstring);
        LOGD("Java_com_appcelerator_hyperloop_HyperloopJNI_HyperloopCallActivityOnCreate '%s'", cstring);
        free(cstring);
        JSStringRelease(string);
    }
    
}
JNIEXPORT jboolean JNICALL
Java_com_appcelerator_hyperloop_ViewOnTouchListener_NativeOnTouch
(JNIEnv *env, jobject thiz, jlong jsContextRef, jlong thisObjectRef, jlong onTouchFuncRef, jobject view, jobject event)
{
    JSContextRef ctx = (JSContextRef)jsContextRef;
    JSObjectRef onTouchFunc = (JSObjectRef)onTouchFuncRef;
    JSObjectRef thisObject = (JSObjectRef)thisObjectRef;
    
    JSValueRef argv[2];
    argv[0] = MakeObjectForJava_android_view_View(ctx, view);
    argv[1] = MakeObjectForJava_android_view_MotionEvent(ctx, event);

    if (JSObjectIsFunction(ctx, onTouchFunc)) {
        JSValueRef exception = JSValueMakeNull(ctx);
        JSValueRef result = JSObjectCallAsFunction(ctx, onTouchFunc, thisObject, 2, argv, &exception);
        if (!JSValueIsNull(ctx, exception)) {
            JSStringRef string = JSValueToStringCopy(ctx, exception, NULL);
            CCHAR_FROM_JSSTRINGREF(string, cstring);
            LOGD("Java_com_appcelerator_hyperloop_ViewOnTouchListener_NativeOnTouch '%s'", cstring);
            free(cstring);
            JSStringRelease(string);
        }
        return JSValueToBoolean(ctx, result) ? JNI_TRUE : JNI_FALSE;
    }
    return JNI_FALSE;
}

#ifdef __cplusplus
}
#endif