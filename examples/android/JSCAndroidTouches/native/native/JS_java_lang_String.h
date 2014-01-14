//
//  JS_java_lang_String.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/10/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_java_lang_String_h
#define HyperloopJNI_JS_java_lang_String_h

JSClassRef CreateClassForJava_java_lang_String();
JSClassRef CreateClassConstructorForJava_java_lang_String();
JSObjectRef MakeObjectConstructorForJava_java_lang_String(JSContextRef ctx);
JSObjectRef MakeObjectForJava_java_lang_String(JSContextRef ctx, jobject javaObject);

#endif
