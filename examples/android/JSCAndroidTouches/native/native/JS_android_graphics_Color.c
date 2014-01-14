//
//  JS_android_graphics_Color.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "JS_android_graphics_Color.h"
#include "JS_java_lang_Object.h"

#ifdef __cplusplus
extern "C" {
#endif

extern JavaVM* jvm;

JSClassDefinition ClassDefinitionConstructorForJava_android_graphics_Color;
JSClassRef ClassRefConstructorForJava_android_graphics_Color;

JSValueRef GetREDForJava_android_graphics_Color(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/graphics/Color");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.graphics.Color", exception);

    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "RED", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.graphics.Color.RED", exception);
    
    jint TOP = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)TOP);
}

JSValueRef GetBLUEForJava_android_graphics_Color(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/graphics/Color");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.graphics.Color", exception);

    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "BLUE", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.graphics.Color.BLUE", exception);
    
    jint TOP = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)TOP);
}

JSValueRef GetYELLOWForJava_android_graphics_Color(JSContextRef ctx, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    JNI_ENV_ENTER
    jclass  javaClass = (*env)->FindClass(env, "android/graphics/Color");
    if (javaClass == NULL) return HyperloopMakeException(ctx, "Class not found: android.graphics.Color", exception);

    jfieldID fieldId = (*env)->GetStaticFieldID(env, javaClass, "YELLOW", "I");
    if (fieldId == NULL) return HyperloopMakeException(ctx, "Field not found: android.graphics.Color.YELLOW", exception);
    
    jint TOP = (*env)->GetStaticIntField(env, javaClass, fieldId);
    (*env)->DeleteLocalRef(env, javaClass);
    JNI_ENV_EXIT
    
    return JSValueMakeNumber(ctx, (int)TOP);
}

static JSStaticValue StaticValueArrayForJava_android_graphics_Color [] = {
    { "RED", GetREDForJava_android_graphics_Color, 0, kJSPropertyAttributeReadOnly },
    { "BLUE", GetBLUEForJava_android_graphics_Color, 0, kJSPropertyAttributeReadOnly },
    { "YELLOW", GetYELLOWForJava_android_graphics_Color, 0, kJSPropertyAttributeReadOnly },
    { 0, 0, 0, 0 }
};

JSObjectRef MakeObjectConstructorForJava_android_graphics_Color(JSContextRef ctx)
{
    return JSObjectMake(ctx, CreateClassConstructorForJava_android_graphics_Color(), 0);
}

JSClassRef CreateClassConstructorForJava_android_graphics_Color ()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionConstructorForJava_android_graphics_Color = kJSClassDefinitionEmpty;
        ClassDefinitionConstructorForJava_android_graphics_Color.className = "Color";
        ClassDefinitionConstructorForJava_android_graphics_Color.staticValues = StaticValueArrayForJava_android_graphics_Color;
        
        ClassDefinitionConstructorForJava_android_graphics_Color.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefConstructorForJava_android_graphics_Color = JSClassCreate(&ClassDefinitionConstructorForJava_android_graphics_Color);
        
        JSClassRetain(ClassRefConstructorForJava_android_graphics_Color);
    }
    return ClassRefConstructorForJava_android_graphics_Color;
}

#ifdef __cplusplus
}
#endif