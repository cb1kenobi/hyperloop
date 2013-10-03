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
extern CGRect* HyperloopJSValueRefToCGRect(JSContextRef,JSValueRef, JSValueRef*, bool*);

@interface UIViewTests : JSBaseTestCase
@end

@implementation UIViewTests


- (void)testViewWithEmptyBounds
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
    [view release];
}

- (void)testViewWithBounds
{
    UIView *view = [[UIView alloc] init];
    view.bounds = CGRectMake(10, 20, 100, 200);
    JSObjectRef object = MakeObjectForUIView(globalContext, view);
    JSStringRef property = JSStringCreateWithUTF8CString("bounds");
    JSValueRef exception = NULL;
    JSValueRef bounds = JSObjectGetProperty(globalContext, object, property, &exception);
    JSObjectRef boundsObject = JSValueToObject(globalContext, bounds, &exception);
    JSStringRef originProperty = JSStringCreateWithUTF8CString("origin");
    JSValueRef origin = JSObjectGetProperty(globalContext, boundsObject, originProperty, &exception);
    JSObjectRef originObject = JSValueToObject(globalContext, origin, &exception);
    [super assertNumberProperty:originObject property:@"x" value:10];
    [super assertNumberProperty:originObject property:@"y" value:20];
    JSStringRef sizeProperty = JSStringCreateWithUTF8CString("size");
    JSValueRef size = JSObjectGetProperty(globalContext, boundsObject, sizeProperty, &exception);
    JSObjectRef sizeObject = JSValueToObject(globalContext, size, &exception);
    [super assertNumberProperty:sizeObject property:@"width" value:100];
    [super assertNumberProperty:sizeObject property:@"height" value:200];
    JSStringRelease(property);
    JSStringRelease(originProperty);
    JSStringRelease(sizeProperty);
    [view release];
}

- (void)testViewWithBoundsUsingJSValueRef
{
    UIView *view = [[UIView alloc] init];
    view.bounds = CGRectMake(10, 20, 100, 200);
    JSObjectRef object = MakeObjectForUIView(globalContext, view);
    JSStringRef property = JSStringCreateWithUTF8CString("bounds");
    JSValueRef exception = NULL;
    JSValueRef bounds = JSObjectGetProperty(globalContext, object, property, &exception);
    CGRect *rect = HyperloopJSValueRefToCGRect(globalContext,bounds,&exception,0);
    XCTAssertTrue(rect!=NULL, @"rect was NULL");
    XCTAssertTrue(rect->origin.x==10, @"rect.origin.x was not 10, was: %f",rect->origin.x);
    XCTAssertTrue(rect->origin.y==20, @"rect.origin.y was not 20, was: %f",rect->origin.y);
    XCTAssertTrue(rect->size.width==100, @"rect.size.width was not 100, was: %f",rect->size.width);
    XCTAssertTrue(rect->size.height==200, @"rect.size.height was not 200, was: %f",rect->size.height);
    JSStringRelease(property);
    [view release];
}

- (void)testViewWithTag
{
    UIView *view = [[UIView alloc] init];
    view.tag = 12345;
    JSObjectRef object = MakeObjectForUIView(globalContext, view);
    JSStringRef property = JSStringCreateWithUTF8CString("tag");
    JSValueRef exception = NULL;
    JSValueRef tagValue = JSObjectGetProperty(globalContext, object, property, &exception);
    JSStringRelease(property);
    [view release];
    XCTAssertTrue(JSValueToNumber(globalContext, tagValue, &exception)==12345, @"tag is not 12345");
}

@end
