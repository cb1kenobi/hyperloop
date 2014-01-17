//
//  HyperloopJNI.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/9/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_HyperloopJNI_h
#define HyperloopJNI_HyperloopJNI_h

#include <jni.h>
#include <JavaScriptCore/JSBase.h>
#include <JavaScriptCore/JSContextRef.h>
#include <JavaScriptCore/JSStringRef.h>
#include <JavaScriptCore/JSObjectRef.h>
#include <JavaScriptCore/JSValueRef.h>

#ifdef ENABLE_JAVASCRIPTCORE_PRIVATE_API
#include "JavaScriptCore/JSObjectRefPrivate.h"
#include "JavaScriptCore/JSContextRefPrivate.h"
#endif

#define JSCORE_LOG_TAG "JavaScriptCore"
#define NEWLINE "\n"

#ifdef __ANDROID__
#include <stdarg.h>
#include <android/log.h>
#define LOGD(...) ((void)__android_log_print(ANDROID_LOG_DEBUG, JSCORE_LOG_TAG, __VA_ARGS__));
#define LOGI(...) ((void)__android_log_print(ANDROID_LOG_INFO,  JSCORE_LOG_TAG, __VA_ARGS__));
#define LOGW(...) ((void)__android_log_print(ANDROID_LOG_WARN,  JSCORE_LOG_TAG, __VA_ARGS__));
#define LOGE(...) ((void)__android_log_print(ANDROID_LOG_ERROR, JSCORE_LOG_TAG, __VA_ARGS__));
#else
#define LOGD(...) ((void)fprintf(stdout, __VA_ARGS__));fprintf(stdout, NEWLINE);fflush(stdout);
#define LOGI(...) ((void)fprintf(stdout, __VA_ARGS__));fprintf(stdout, NEWLINE);fflush(stdout);
#define LOGW(...) ((void)fprintf(stdout, __VA_ARGS__));fprintf(stdout, NEWLINE);fflush(stdout);
#define LOGE(...) ((void)fprintf(stdout, __VA_ARGS__));fprintf(stdout, NEWLINE);fflush(stdout);
#endif

/*
 * Get JNIEnv* from JVM
 */
#define JNI_ENV_ENTER \
JNIEnv* env = NULL;\
bool jvm_attached = false;\
if (jvm != NULL) {\
    jint jvm_attach_status = (*jvm)->GetEnv(jvm, (void**)&env, JNI_VERSION_1_6);\
    if (jvm_attach_status == JNI_EDETACHED) {\
        jvm_attach_status = (*jvm)->AttachCurrentThread(jvm, (void**)&env, NULL);\
        if (jvm_attach_status == JNI_OK){\
            jvm_attached = true;\
        }\
    }\
}

#define JNI_ENV_EXIT \
if (jvm_attached) {\
    (*jvm)->DetachCurrentThread(jvm);\
}\
env = NULL;

/*
 *  Create char* from JSStringRef
 * (varout char should be freed later)
 */
#define CCHAR_FROM_JSSTRINGREF(varin, varout)\
size_t length##varin = JSStringGetMaximumUTF8CStringSize(varin);\
char* varout = (char*)malloc(length##varin);\
JSStringGetUTF8CString(varin, varout, length##varin);\

/*
 * Create jstring from JSStringRef
 * (varcout char is freed)
 */
#define JSTRING_FROM_JSSTRINGREF(varin, varcout, varjout)\
CCHAR_FROM_JSSTRINGREF(varin, varcout);\
jstring varjout = (*env)->NewStringUTF(env, varcout);\
free(varcout);

/* 
 * Create JSStringRef from jstring
 * (varout should be freed by JSStringRelease later)
 */
#define JSSTRINGREF_FROM_JSTRING(varin, varout)\
JSStringRef varout = NULL;\
if(varin != NULL) {\
    const char* aschars##varin = (*env)->GetStringUTFChars(env, varin, NULL);\
    varout = JSStringCreateWithUTF8CString(aschars##varin);\
    (*env)->ReleaseStringUTFChars(env, varin, aschars##varin);\
}

#define JSSTRING_RELEASE(varin)\
if (varin != NULL) JSStringRelease(varin);

/* try-catch Java Exception and convert it to JS exception */
#define CHECK_JAVAEXCEPTION \
bool JAVA_EXCEPTION_OCCURED = false; \
if ((*env)->ExceptionCheck(env)) {\
    JAVA_EXCEPTION_OCCURED = true;\
    jthrowable jexception = (*env)->ExceptionOccurred(env);\
    jclass jexceptionClass = (*env)->GetObjectClass(env, jexception);\
    jmethodID jexceptionmsgId = (*env)->GetMethodID(env, jexceptionClass, "toString", "()Ljava/lang/String;");\
    jstring jexceptionmsgObj = (*env)->CallObjectMethod(env, jexception, jexceptionmsgId);\
    const char* jexceptionmsgC = (*env)->GetStringUTFChars(env, jexceptionmsgObj, NULL);\
    HyperloopUpdateExceptionByString(ctx, jexceptionmsgC, exception);\
    (*env)->ReleaseStringUTFChars(env, jexceptionmsgObj, jexceptionmsgC);\
    (*env)->DeleteLocalRef(env, jexceptionmsgObj);\
    (*env)->DeleteLocalRef(env, jexception);\
    (*env)->DeleteLocalRef(env, jexceptionClass);\
    (*env)->ExceptionClear(env);\
}

/* Private object for JSObjectRef (taken from JavaScriptCore for Java) */
typedef struct {
    // Java Object for callback
    jobject callback;
    jclass  callbackClass;
    // Used for Java initializer callback
    bool initialized;
    // Java Object associated with jsobject
    jobject object;
    // Reserved data
    void* reserved;
    // Can be used from outside of the JavaScriptCore
    void* data;
} JSPrivateObject;

JSGlobalContextRef HyperloopCreateVM();
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *error, JSValueRef *exception);
void HyperloopUpdateExceptionByString(JSContextRef ctx, const char *error, JSValueRef *exception);

#endif
