//
//  JavaScriptCorePerformanceTestOption3.c
//  JavaScriptCorePerformanceTestOption3
//
//  Created by Kota Iguchi on 12/10/13.
//  Copyright (c) 2013 Appcelerator, Inc. All rights reserved.
//

#include <stdio.h>
#include "JavaScriptCoreForJNI.h"

#define LOGD(...) ((void)fprintf(stdout, __VA_ARGS__));fflush(stdout);
#define LOGI(...) ((void)fprintf(stdout, __VA_ARGS__));fflush(stdout);
#define LOGW(...) ((void)fprintf(stdout, __VA_ARGS__));fflush(stdout);
#define LOGE(...) ((void)fprintf(stdout, __VA_ARGS__));fflush(stdout);

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
const char* aschars##varin = (*env)->GetStringUTFChars(env, varin, NULL);\
JSStringRef varout = JSStringCreateWithUTF8CString(aschars##varin);\
(*env)->ReleaseStringUTFChars(env, varin, aschars##varin);

/*
 * Call JSObjectMake* function from arguments
 */
#define JSOBJECTMAKE_FROM_ARGV(callfunc, argc, argv, varout)\
jlong* p_argv = (*env)->GetLongArrayElements(env, argv, NULL);\
const JSValueRef* js_argv = (JSValueRef*)p_argv;\
JSObjectRef varout = callfunc(ctx, argc, js_argv, &exceptionStore);\
(*env)->ReleaseLongArrayElements(env, argv, p_argv, 0);

#ifdef __cplusplus
extern "C" {
#endif
    
static JavaVM* jvm;
static jclass  jniMethodInvokerClass = NULL;
static jobject jniMethodInvokerObj   = NULL;

static bool useJNIMethodCache = false;
    
jmethodID jmethodId_JNIMethodInvoker_CallObjectMethod0 = NULL;
jmethodID jmethodId_JNIMethodInvoker_CallObject1 = NULL;

#define CALLBACK_TEST_COUNT 10000

jint JNI_OnLoad(JavaVM* vm, void* reserved)
{
    jvm = vm;
    return JNI_VERSION_1_6;
}

/*
 * Cache JNI invoker method id so that we can call it faster.
 */
static bool JSCoreApp_CacheInvokerMethods(JNIEnv* env)
{
    jmethodId_JNIMethodInvoker_CallObjectMethod0 = (*env)->GetMethodID(env,
        jniMethodInvokerClass, "CallObjectMethod0", "(ILjava/lang/Object;)Ljava/lang/Object;");
    jmethodId_JNIMethodInvoker_CallObject1 = (*env)->GetMethodID(env,
        jniMethodInvokerClass, "CallObject1", "(ILjava/lang/Object;)Ljava/lang/Object;");

    return true;
}

static JSClassRef _JavaTestObject_classRef = NULL;

JSObjectRef _wrap_new_JavaTestObject(JSContextRef context, JSObjectRef thisObject,
                                          size_t argc, const JSValueRef argv[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    if (!useJNIMethodCache) {
        jmethodId_JNIMethodInvoker_CallObject1 = (*env)->GetMethodID(env,
            jniMethodInvokerClass, "CallObject1", "(ILjava/lang/Object;)Ljava/lang/Object;");
    }
    
    JSStringRef argv0 = JSValueToStringCopy(context, argv[0], NULL);
    JSTRING_FROM_JSSTRINGREF(argv0, cparam0, jparam0)
    
    jobject obj = (*env)->CallObjectMethod(env, jniMethodInvokerObj,
                                        jmethodId_JNIMethodInvoker_CallObject1,
                                        -2147483648, jparam0);
    JSObjectPrivateData* prv = (JSObjectPrivateData*)malloc(sizeof(JSObjectPrivateData));
    prv->object = (*env)->NewGlobalRef(env, obj);
    JNI_ENV_EXIT
    return JSObjectMake(context, _JavaTestObject_classRef, prv);
}

static JSClassRef createNewClass(JSContextRef context);

void _wrap_initialize_JavaTestObject(JSContextRef ctx, JSObjectRef object) {
    _JavaTestObject_classRef = createNewClass(ctx);
}

void _wrap_finalize_JavaTestObject(JSObjectRef thisObject) {
    JSObjectPrivateData* prv = (JSObjectPrivateData*)JSObjectGetPrivate(thisObject);
    JNI_ENV_ENTER
    if (prv && prv->object)
    {
        (*env)->DeleteGlobalRef(env, prv->object);
    }
    JNI_ENV_EXIT
    free(prv);
}

JSValueRef _wrap_toString_JavaTestObject(JSContextRef context, JSObjectRef function, JSObjectRef thisObject,
                                         size_t argc, const JSValueRef argv[], JSValueRef* exception)
{
    JSObjectPrivateData* prv = (JSObjectPrivateData*)JSObjectGetPrivate(thisObject);
    JNI_ENV_ENTER
    if (!useJNIMethodCache) {
        jmethodId_JNIMethodInvoker_CallObjectMethod0 = (*env)->GetMethodID(env,
            jniMethodInvokerClass, "CallObjectMethod0", "(ILjava/lang/Object;)Ljava/lang/Object;");
    }
    jstring value = (*env)->CallObjectMethod(env, jniMethodInvokerObj,
                                             jmethodId_JNIMethodInvoker_CallObjectMethod0,
                                             -2147483646, prv->object);
    JSSTRINGREF_FROM_JSTRING(value, jvalue);
    JNI_ENV_EXIT
    
    return JSValueMakeString(context, jvalue);
}

JSStaticFunction _JavaTestObject_staticFunctions[] =
{
    { "toString", _wrap_toString_JavaTestObject, kJSPropertyAttributeNone },
    {0, 0, 0}
};

static JSClassRef createNewClass(JSContextRef context) {
    JSClassDefinition definition = kJSClassDefinitionEmpty;
    definition.initialize = _wrap_initialize_JavaTestObject;
    definition.callAsConstructor = _wrap_new_JavaTestObject;
    definition.staticFunctions = _JavaTestObject_staticFunctions;
    definition.finalize = _wrap_finalize_JavaTestObject;
    
    return JSClassCreate(&definition);
}

static JSObjectRef registerNewJSClass(JSContextRef context, JSObjectRef parentObject, const char* name)
{
    JSStringRef jsname = JSStringCreateWithUTF8CString(name);
    
    JSClassRef jsClass = createNewClass(context);
    JSObjectRef jsObj = JSObjectMake(context, jsClass, NULL);
    JSObjectSetProperty(context, parentObject, jsname, jsObj, kJSPropertyAttributeNone, NULL);
    
    return jsObj;
}

JNIEXPORT jboolean JNICALL
Java_com_appcelerator_javascriptcore_JavaScriptCorePerformanceTestOption3_NativeSetup
    (JNIEnv *env, jobject thiz, jobject invokerObj, jboolean useMethodCache)
{
    jniMethodInvokerObj   = (*env)->NewGlobalRef(env, invokerObj);
    jniMethodInvokerClass = (*env)->NewGlobalRef(env, (*env)->GetObjectClass(env, invokerObj));
    
    if (useMethodCache == JNI_TRUE)
    {
        JSCoreApp_CacheInvokerMethods(env);
        useJNIMethodCache = true;
    }
    
    return true;
}

JNIEXPORT void JNICALL
Java_com_appcelerator_javascriptcore_JavaScriptCorePerformanceTestOption3_NativeTestCreateNewObjects
(JNIEnv *env, jobject thiz, jlong context, jlong global_object)
{
    JSGlobalContextRef ctx = (JSGlobalContextRef)context;
    JSObjectRef globalObject = (JSObjectRef)global_object;
    
    char str[20];
    for (int i = 0; i < CALLBACK_TEST_COUNT; i++) {
        sprintf(str,"TestObject%d",i);
        registerNewJSClass(ctx, globalObject, str);
    }
}

JNIEXPORT void JNICALL
Java_com_appcelerator_javascriptcore_JavaScriptCorePerformanceTestOption3_NativeTestCreateAndCallObjectMethod
(JNIEnv *env, jobject thiz, jlong context, jlong global_object, jstring script)
{
    const char* scriptchars = (*env)->GetStringUTFChars(env, script, NULL);
    JSStringRef scriptJS = JSStringCreateWithUTF8CString(scriptchars);
    (*env)->ReleaseStringUTFChars(env, script, scriptchars);
    
    JSGlobalContextRef ctx = (JSGlobalContextRef)context;
    JSObjectRef globalObject = (JSObjectRef)global_object;
    
    char str[20];
    for (int i = 0; i < CALLBACK_TEST_COUNT; i++) {
        sprintf(str,"TestObject%d",i);
        registerNewJSClass(ctx, globalObject, str);
    }
    
    JSEvaluateScript(ctx, scriptJS, NULL, NULL, 1, NULL);
}

#ifdef __cplusplus
}
#endif