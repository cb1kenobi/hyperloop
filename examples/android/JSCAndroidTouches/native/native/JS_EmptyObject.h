//
//  JS_EmptyObject.h
//  HyperloopJNI
//
//  Created by Kota Iguchi on 1/10/14.
//  Copyright (c) 2014 Appcelerator, Inc. All rights reserved.
//

#ifndef HyperloopJNI_JS_EmptyObject_h
#define HyperloopJNI_JS_EmptyObject_h

JSClassRef CreateClassForJava_EmptyObject();
JSClassRef CreateClassConstructorForJava_EmptyObject();
JSObjectRef MakeObjectConstructorForJava_EmptyObject(JSContextRef ctx);
JSObjectRef MakeObjectForJava_EmptyObject(JSContextRef ctx, jobject object);

#endif
