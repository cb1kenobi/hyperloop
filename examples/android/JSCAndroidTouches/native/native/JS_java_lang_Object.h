//
//  JS_java_lang_Object.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/10/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_java_lang_Object_h
#define HyperloopJNI_JS_java_lang_Object_h

JSClassRef CreateClassForJava_java_lang_Object();
JSClassRef CreateClassConstructorForJava_java_lang_Object();
JSObjectRef MakeObjectConstructorForJava_java_lang_Object(JSContextRef ctx);
JSObjectRef MakeObjectForJava_java_lang_Object(JSContextRef ctx, jobject javaObject);

#endif
