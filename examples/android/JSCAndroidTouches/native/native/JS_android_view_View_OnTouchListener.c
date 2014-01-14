//
//  JS_android_view_View_OnTouchListener.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_android_view_View_OnTouchListener.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_view_View_OnTouchListener;
JSClassDefinition ClassDefinitionConstructorForJava_android_view_View_OnTouchListener;
JSClassRef ClassRefForJava_android_view_View_OnTouchListener;
JSClassRef ClassRefConstructorForJava_android_view_View_OnTouchListener;

JSObjectRef MakeObjectConstructorForJava_android_view_View_OnTouchListener(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_android_view_View_OnTouchListener(), 0);
}

JSObjectRef MakeObjectForJava_android_view_View_OnTouchListener(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_view_View_OnTouchListener(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSObjectRef MakeInstanceForJava_android_view_View_OnTouchListener(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "com/appcelerator/hyperloop/ViewOnTouchListener");
    if (javaClass == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Class not found: com.appcelerator.hyperloop.ViewOnTouchListener", exception), exception);
    }

    jmethodID initMethodId = (*env)->GetMethodID(env, javaClass, "<init>", "(JJ)V");
    if (initMethodId == NULL) {
        return JSValueToObject(ctx, HyperloopMakeException(ctx,
                            "Method not found: com.appcelerator.hyperloop.ViewOnTouchListener#<init>()V", exception), exception);
    }
    
    if (argumentCount > 0 && JSValueIsObject(ctx, arguments[0])) {
        
        JSStringRef onTouchFuncName = JSStringCreateWithUTF8CString("onTouch");
        JSObjectRef onTouchFunc = JSValueToObject(ctx,
                JSObjectGetProperty(ctx, JSValueToObject(ctx, arguments[0], NULL), onTouchFuncName, exception), NULL);
        JSStringRelease(onTouchFuncName);
        
        if (JSObjectIsFunction(ctx, onTouchFunc)) {
            JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_view_View_OnTouchListener(), NULL);
            jobject javaObject = (*env)->NewObject(env, javaClass, initMethodId, (jlong)object, (jlong)onTouchFunc);
            
            JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
            p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
            (*env)->DeleteLocalRef(env, javaObject);
            (*env)->DeleteLocalRef(env, javaClass);
            
            JSObjectSetPrivate(object, p);
            JNI_ENV_EXIT
            
            return object;
        }
        
    }
    JNI_ENV_EXIT

    return NULL;
}

JSValueRef MakeInstanceFromFunctionForJava_android_view_View_OnTouchListener(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    return MakeInstanceForJava_android_view_View_OnTouchListener(ctx, function, argumentCount, arguments, exception);
}

JSClassRef CreateClassForJava_android_view_View_OnTouchListener()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_view_View_OnTouchListener = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_view_View_OnTouchListener.className = "OnTouchListener";
        ClassDefinitionForJava_android_view_View_OnTouchListener.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_view_View_OnTouchListener = JSClassCreate(&ClassDefinitionForJava_android_view_View_OnTouchListener);
        
        JSClassRetain(ClassRefForJava_android_view_View_OnTouchListener);
    }
    return ClassRefForJava_android_view_View_OnTouchListener;
}

JSClassRef CreateClassConstructorForJava_android_view_View_OnTouchListener()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_view_View_OnTouchListener = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_view_View_OnTouchListener.className = "View";
        ClassDefinitionConstructorForJava_android_view_View_OnTouchListener.callAsConstructor = MakeInstanceForJava_android_view_View_OnTouchListener;
        ClassDefinitionConstructorForJava_android_view_View_OnTouchListener.callAsFunction = MakeInstanceFromFunctionForJava_android_view_View_OnTouchListener;
        
        ClassDefinitionConstructorForJava_android_view_View_OnTouchListener.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_view_View_OnTouchListener = JSClassCreate(&ClassDefinitionConstructorForJava_android_view_View_OnTouchListener);
        
        JSClassRetain(ClassRefConstructorForJava_android_view_View_OnTouchListener);
    }
    return ClassRefConstructorForJava_android_view_View_OnTouchListener;
}

#ifdef __cplusplus
}
#endif