//
//  JS_android_view_MotionEvent.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/13/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_android_view_MotionEvent_h
#define HyperloopJNI_JS_android_view_MotionEvent_h

JSClassRef CreateClassForJava_android_view_MotionEvent();
JSClassRef CreateClassConstructorForJava_android_view_MotionEvent();
JSObjectRef MakeObjectConstructorForJava_android_view_MotionEvent(JSContextRef ctx);
JSObjectRef MakeObjectForJava_android_view_MotionEvent(JSContextRef ctx, jobject javaObject);

#endif
