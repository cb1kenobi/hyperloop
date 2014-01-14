//
//  JS_android_os_Bundle.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/12/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_android_os_Bundle_h
#define HyperloopJNI_JS_android_os_Bundle_h

#include "HyperloopJNI.h"

JSClassRef CreateClassForJava_android_os_Bundle();
JSObjectRef MakeObjectForJava_android_os_Bundle(JSContextRef ctx, jobject javaObject);

#endif
