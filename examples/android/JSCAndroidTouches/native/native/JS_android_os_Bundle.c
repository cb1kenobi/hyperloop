//
//  JS_android_os_Bundle.c
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#include <stdlib.h>
#include "JS_android_os_Bundle.h"
#include "JS_java_lang_Object.h"

#ifdef __cplusplus
extern "C" {
#endif
    
extern JavaVM* jvm;

JSClassDefinition ClassDefinitionForJava_android_os_Bundle;
JSClassRef ClassRefForJava_android_os_Bundle;

void FinalizerForJava_android_os_Bundle(JSObjectRef object)
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

JSObjectRef MakeObjectForJava_android_os_Bundle(JSContextRef ctx, jobject javaObject)
{
    JNI_ENV_ENTER
    JSPrivateObject* p = malloc(sizeof(JSPrivateObject));
    p->object = (*env)->NewGlobalRef(env, javaObject); // retain Java Object
    JSObjectRef object = JSObjectMake(ctx, CreateClassForJava_android_os_Bundle(), (void*)p);
    JNI_ENV_EXIT
    return object;
}

JSClassRef CreateClassForJava_android_os_Bundle()
{
    static bool init;
    if (!init)
    {
        init = true;
        
        ClassDefinitionForJava_android_os_Bundle = kJSClassDefinitionEmpty;
        ClassDefinitionForJava_android_os_Bundle.className = "Activity";
        ClassDefinitionForJava_android_os_Bundle.finalize = FinalizerForJava_android_os_Bundle;
        ClassDefinitionForJava_android_os_Bundle.parentClass = CreateClassConstructorForJava_java_lang_Object();
        ClassRefForJava_android_os_Bundle = JSClassCreate(&ClassDefinitionForJava_android_os_Bundle);
        
        JSClassRetain(ClassRefForJava_android_os_Bundle);
    }
    return ClassRefForJava_android_os_Bundle;
}

#ifdef __cplusplus
}
#endif