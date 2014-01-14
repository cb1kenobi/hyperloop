//
//  JS_android_view_Gravity.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "JS_android_view_Gravity.h"
#include "JS_java_lang_Object.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionConstructorForJava_android_view_Gravity;
JSClassRef ClassRefConstructorForJava_android_view_Gravity;

JSValueRef GetTOPForJava_android_view_Gravity(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/view/Gravity");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.view.Gravity", exception);

    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "TOP", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.view.Gravity.TOP", exception);
    
    jint TOP = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)TOP);
}

static JSStaticValue StaticValueArrayForJava_android_view_Gravity [] = {
    { "TOP", GetTOPForJava_android_view_Gravity, 0, kJSPropertyAttributeReadOnly },
    { 0, 0, 0, 0 }
};

JSObjectRef MakeObjectConstructorForJava_android_view_Gravity(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_android_view_Gravity(), 0);
}

JSClassRef CreateClassConstructorForJava_android_view_Gravity ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_view_Gravity = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_view_Gravity.className = "Gravity";
        ClassDefinitionConstructorForJava_android_view_Gravity.staticValues = StaticValueArrayForJava_android_view_Gravity;
        
        ClassDefinitionConstructorForJava_android_view_Gravity.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_view_Gravity = JSClassCreate(&ClassDefinitionConstructorForJava_android_view_Gravity);
        
        JSClassRetain(ClassRefConstructorForJava_android_view_Gravity);
    }
    return ClassRefConstructorForJava_android_view_Gravity;
}

#ifdef __cplusplus
}
#endif