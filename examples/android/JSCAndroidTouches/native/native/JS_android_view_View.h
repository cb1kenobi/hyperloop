//
//  JS_android_view_View.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_android_view_View_h
#define HyperloopJNI_JS_android_view_View_h

JSClassRef CreateClassForJava_android_view_View();
JSClassRef CreateClassConstructorForJava_android_view_View();
JSObjectRef MakeObjectConstructorForJava_android_view_View(JSContextRef ctx);
JSObjectRef MakeObjectForJava_android_view_View(JSContextRef ctx, jobject javaObject);

#endif
