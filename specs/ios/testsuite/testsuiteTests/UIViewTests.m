/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"
@import UIKit;

extern JSObjectRef MakeObjectForUIView (JSContextRef ctx, UIView * instance);

@interface UIViewTests : JSBaseTestCase
@end

@implementation UIViewTests


- (void)testPlainView
{
    UIView *view = [[UIView alloc] init];
    JSObjectRef object = MakeObjectForUIView(globalContext, view);
    JSStringRef property = JSStringCreateWithUTF8CString("bounds");
    JSValueRef exception = NULL;
    JSValueRef bounds = JSObjectGetProperty(globalContext, object, property, &exception);
    JSObjectRef boundsObject = JSValueToObject(globalContext, bounds, &exception);
    JSStringRef originProperty = JSStringCreateWithUTF8CString("origin");
    JSValueRef origin = JSObjectGetProperty(globalContext, boundsObject, originProperty, &exception);
    JSObjectRef originObject = JSValueToObject(globalContext, origin, &exception);
    [super assertNumberProperty:originObject property:@"x" value:0];
    JSStringRelease(property);
    JSStringRelease(originProperty);
}

@end
