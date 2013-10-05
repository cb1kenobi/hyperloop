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

@interface EnumTypesTests : JSBaseTestCase
@end

@implementation EnumTypesTests

- (void)testEnumeration
{
    UIView *view = [[UIView alloc] init];
    view.contentMode = UIViewContentModeCenter;
    JSObjectRef object = MakeObjectForUIView(globalContext, view);
    JSStringRef property = JSStringCreateWithUTF8CString("contentMode");
    JSValueRef exception = NULL;
    JSValueRef contentMode = JSObjectGetProperty(globalContext, object, property, &exception);
    double value = JSValueToNumber(globalContext, contentMode, &exception);
    XCTAssertTrue(value==UIViewContentModeCenter, @"expected value to be equal to %d, but was: %d",(int)UIViewContentModeCenter,(int)value);
    JSValueRef valueRef = JSValueMakeNumber(globalContext, UIViewContentModeRedraw);
    JSObjectSetProperty(globalContext, object, property, valueRef, kJSPropertyAttributeNone, &exception);
    XCTAssertTrue(view.contentMode==UIViewContentModeRedraw, @"expected value to be equal to %d, but was: %d",(int)UIViewContentModeRedraw,(int)view.contentMode);
    JSStringRelease(property);
    [view release];
}

@end
