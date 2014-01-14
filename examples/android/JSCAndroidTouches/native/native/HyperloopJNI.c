//
//  HyperloopJNI.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/9/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include "HyperloopJNI.h"
#include "JS_java_lang_Object.h"
#include "JS_java_lang_String.h"
#include "JS_android_util_Log.h"
#include "JS_android_view_View.h"
#include "JS_android_view_Gravity.h"
#include "JS_android_view_MotionEvent.h"
#include "JS_android_graphics_Color.h"
#include "JS_android_widget_FrameLayout.h"

#ifdef __cplusplus
extern "C" {
#endif

static bool JS_registerObject(JSGlobalContextRef context, JSObjectRef parentObject,
                      const char* className, JSObjectRef classObject)
{
    JSStringRef js_className = JSStringCreateWithUTF8CString(className);
    JSObjectSetProperty(context, parentObject,
                        js_className, classObject,
                        kJSPropertyAttributeNone, NULL);
    JSStringRelease(js_className);
    return true;
}

static JSObjectRef JS_registerNamespace(JSGlobalContextRef context, JSObjectRef parentObj, const char* name)
{
    JSObjectRef namespaceObj = JSObjectMake(context, NULL, NULL);
    JSStringRef js_name = JSStringCreateWithUTF8CString(name);
    JSObjectSetProperty(context, parentObj,
                        js_name, namespaceObj,
                        kJSPropertyAttributeNone, NULL);
    JSStringRelease(js_name);
    
    return namespaceObj;
}

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *error, JSValueRef *exception)
{
    if (exception!=NULL)
    {
        JSStringRef string = JSStringCreateWithUTF8CString(error);
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
    }
    return JSValueMakeUndefined(ctx);
}

JSGlobalContextRef HyperloopCreateVM()
{
    JSGlobalContextRef globalContextRef = JSGlobalContextCreate(NULL);
    JSObjectRef globalObjectRef = JSContextGetGlobalObject(globalContextRef);

    // TODO register objects
    JSObjectRef java_ObjectRef = JS_registerNamespace(globalContextRef, globalObjectRef, "java"); /* java */
    JSObjectRef java_lang_ObjectRef = JS_registerNamespace(globalContextRef, java_ObjectRef, "lang"); /* java.lang */
    
    JSObjectRef android_ObjectRef = JS_registerNamespace(globalContextRef, globalObjectRef, "android"); /* android */
    JSObjectRef android_util_ObjectRef = JS_registerNamespace(globalContextRef, android_ObjectRef, "util"); /* android.util */
    JSObjectRef android_view_ObjectRef = JS_registerNamespace(globalContextRef, android_ObjectRef, "view"); /* android.view */
    JSObjectRef android_graphics_ObjectRef = JS_registerNamespace(globalContextRef, android_ObjectRef, "graphics"); /* android.graphics */
    JSObjectRef android_widget_ObjectRef = JS_registerNamespace(globalContextRef, android_ObjectRef, "widget"); /* android.widget */
    
    JS_registerObject(globalContextRef, java_lang_ObjectRef, "Object",
                      MakeObjectConstructorForJava_java_lang_Object(globalContextRef)); /* java.lang.Object */
    JS_registerObject(globalContextRef, java_lang_ObjectRef, "String",
                      MakeObjectConstructorForJava_java_lang_String(globalContextRef)); /* java.lang.String */
    JS_registerObject(globalContextRef, android_util_ObjectRef, "Log",
                      MakeObjectConstructorForJava_android_util_Log(globalContextRef)); /* android.util.Log */
    JS_registerObject(globalContextRef, android_view_ObjectRef, "Gravity",
                      MakeObjectConstructorForJava_android_view_Gravity(globalContextRef)); /* android.view.Gravity */
    JS_registerObject(globalContextRef, android_graphics_ObjectRef, "Color",
                      MakeObjectConstructorForJava_android_graphics_Color(globalContextRef)); /* android.graphics.Color */
    JS_registerObject(globalContextRef, android_widget_ObjectRef, "FrameLayout",
                      MakeObjectConstructorForJava_android_widget_FrameLayout(globalContextRef)); /* android.widget.FrameLayout */
    JS_registerObject(globalContextRef, android_view_ObjectRef, "View",
                      MakeObjectConstructorForJava_android_view_View(globalContextRef)); /* android.view.View */
    JS_registerObject(globalContextRef, android_view_ObjectRef, "MotionEvent",
                      MakeObjectConstructorForJava_android_view_MotionEvent(globalContextRef)); /* android.view.MotionEvent */
    
    // retain it
    JSGlobalContextRetain(globalContextRef);
    
    return globalContextRef;
}

#ifdef __cplusplus
}
#endif
