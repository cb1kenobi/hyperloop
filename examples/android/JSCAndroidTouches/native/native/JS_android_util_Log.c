//
//  JS_android_util_Log.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_util_Log.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionConstructorForJava_android_util_Log;
JSClassRef ClassRefConstructorForJava_android_util_Log;

JSValueRef dForJava_android_util_Log(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    if (argumentCount >= 2) {
        jstring arg0Str = NULL;
        jstring arg1Str = NULL;
        JNI_ENV_ENTER
        
        if (JSValueIsString(ctx, arguments[0]) && JSValueIsString(ctx, arguments[1])) {
            /* From JavaScript String */
            JSStringRef arg0 = JSValueToStringCopy(ctx, arguments[0], NULL);
            JSStringRef arg1 = JSValueToStringCopy(ctx, arguments[1], NULL);
            JSTRING_FROM_JSSTRINGREF(arg0, arg0C, arg0Obj);
            JSSTRING_RELEASE(arg0);
            JSTRING_FROM_JSSTRINGREF(arg1, arg1C, arg1Obj);
            JSSTRING_RELEASE(arg1);
            arg0Str = arg0Obj;
            arg1Str = arg1Obj;
        } else {
            /* From Java String */
            JSPrivateObject* arg0 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[0], NULL));
            JSPrivateObject* arg1 = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, arguments[1], NULL));
            if (arg0 == NULL || arg0->object == NULL) return JSValueMakeUndefined(ctx);
            if (arg1 == NULL || arg1->object == NULL) return JSValueMakeUndefined(ctx);
            arg0Str = arg0->object;
            arg1Str = arg1->object;
        }
        
        jclass  javaClass = (*env)->FindClass(env, "android/util/Log");
        if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.util.Log", exception);

        jmethodID methodId = (*env)->GetStaticMethodID(env, javaClass, "d", "(Ljava/lang/String;Ljava/lang/String;)I");
        if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.util.Log#d", exception);
        
        jint result = (*env)->CallStaticIntMethod(env, javaClass, methodId, arg0Str, arg1Str);
        JNI_ENV_EXIT
        return JSValueMakeNumber(ctx, (int)result);
    }
    return JSValueMakeUndefined(ctx);
}

static JSStaticFunction StaticFunctionArrayConstructorForJava_android_util_Log [] = {
    { "d", dForJava_android_util_Log, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

void InitializerForJava_android_util_Log(JSContextRef ctx, JSObjectRef object)
{
}

void FinalizerForJava_android_util_Log(JSObjectRef object)
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

JSValueRef JSTypeConvertorForJava_android_util_Log(JSContextRef ctx, JSObjectRef object, JSType type, JSValueRef* exception)
{
    // TODO
    return NULL;
}

bool IsInstanceForJava_android_util_Log(JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(JSValueToObject(ctx, possibleInstance, NULL));
    if (p && p->object) {
        JNI_ENV_ENTER
        jclass  javaClass = (*env)->FindClass(env, "android/util/Log");
        jboolean result = (*env)->IsInstanceOf(env, p->object, javaClass);
        JNI_ENV_EXIT
        return result == JNI_TRUE ? true : false;
    }
    return false;
}

JSObjectRef MakeObjectConstructorForJava_android_util_Log(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_android_util_Log(), 0);
}

JSClassRef CreateClassConstructorForJava_android_util_Log ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_util_Log = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_util_Log.className = "Log";
        ClassDefinitionConstructorForJava_android_util_Log.staticFunctions = StaticFunctionArrayConstructorForJava_android_util_Log;
        ClassDefinitionConstructorForJava_android_util_Log.hasInstance = IsInstanceForJava_android_util_Log;
        
        ClassDefinitionConstructorForJava_android_util_Log.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_util_Log = JSClassCreate(&ClassDefinitionConstructorForJava_android_util_Log);
        
        JSClassRetain(ClassRefConstructorForJava_android_util_Log);
    }
    return ClassRefConstructorForJava_android_util_Log;
}
#ifdef __cplusplus
}
#endif