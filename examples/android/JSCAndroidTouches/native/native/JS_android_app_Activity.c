//
//  JS_android_app_Activity.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "JS_android_app_Activity.h"
#include "JS_java_lang_Object.h"

#ifdef __cplusplus
extern "C" {
#endif
    
extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_app_Activity;
JSClassRef ClassRefForJava_android_app_Activity;

JSValueRef setContentViewForJava_android_app_Activity(JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JSPrivateObject* p = (JSPrivateObject*)JSObjectGetPrivate(object);
    if (p && p->object && argumentCount > 0 && JSValueIsObject(ctx, arguments[0])) {
        JSObjectRef arg0 = JSValueToObject(ctx, arguments[0], exception);
        JSPrivateObject* arg0Obj = JSObjectGetPrivate(arg0);
        if (arg0Obj && arg0Obj->object) {
            JNI_ENV_ENTER
            jclass  javaClass = (*env)->FindClass(env, "android/app/Activity");
            if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.app.Activity", exception);
            
            jmethodID methodId = (*env)->GetMethodID(env, javaClass, "setContentView", "(Landroid/view/View;)V");
            if (methodId == NULL) return HyperloopMakeException(ctx, "Method not found: android.app.Activity#setContentView", exception);
            
            (*env)->CallVoidMethod(env, p->object, methodId, arg0Obj->object);
            CHECK_JAVAEXCEPTION
            JNI_ENV_EXIT
        }
    }
    return JSValueMakeUndefined(ctx);
}

static JSStaticFunction StaticFunctionArrayForJava_android_app_Activity[] = {
    { "setContentView", setContentViewForJava_android_app_Activity, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

void FinalizerForJava_android_app_Activity(JSObjectRef object)
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

JSObjectRef MakeObjectForJava_android_app_Activity(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_app_Activity(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSClassRef CreateClassForJava_android_app_Activity()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_app_Activity = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_app_Activity.finalize = FinalizerForJava_android_app_Activity;
        ClassDefinitionForJava_android_app_Activity.staticFunctions = StaticFunctionArrayForJava_android_app_Activity;
        ClassDefinitionForJava_android_app_Activity.className = "Activity";
        ClassDefinitionForJava_android_app_Activity.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_app_Activity = JSClassCreate(&ClassDefinitionForJava_android_app_Activity);
        
        JSClassRetain(ClassRefForJava_android_app_Activity);
    }
    return ClassRefForJava_android_app_Activity;
}

#ifdef __cplusplus
}
#endif
