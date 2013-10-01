/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import <XCTest/XCTest.h>
#import <hyperloop.h>
#import "JSBaseTestCase.h"

@implementation JSBaseTestCase

- (void)setUp
{
    [super setUp];
    globalContext = JSGlobalContextCreate(NULL);
}

- (void)tearDown
{
    JSGlobalContextRelease(globalContext);
    [super tearDown];
}

-(void)assertStringProperty:(JSObjectRef)object property:(NSString*)name value:(NSString*)value
{
    JSStringRef prop = JSStringCreateWithUTF8CString([name UTF8String]);
    JSValueRef exception = NULL;
    JSValueRef result = JSObjectGetProperty(globalContext, object, prop, &exception);
    JSStringRelease(prop);
    if (exception!=NULL)
    {
        XCTFail("Exception raised: %@",HyperloopToNSString(globalContext, result));
    }
    if (!JSValueIsString(globalContext, result))
    {
        XCTFail("should have been string property value for: %@ and it was not",name);
    }
    NSString *resultStr = HyperloopToNSString(globalContext, result);
    XCTAssertEqualObjects(value, resultStr, @"expected value: %@ for property: %@, but received: %@", value, name, resultStr);
    
}

-(void)assertNumberProperty:(JSObjectRef)object property:(NSString*)name value:(double)value
{
    JSStringRef prop = JSStringCreateWithUTF8CString([name UTF8String]);
    JSValueRef exception = NULL;
    JSValueRef result = JSObjectGetProperty(globalContext, object, prop, &exception);
    JSStringRelease(prop);
    if (exception!=NULL)
    {
        XCTFail("Exception raised: %@",HyperloopToNSString(globalContext, result));
    }
    if (!JSValueIsNumber(globalContext, result))
    {
        XCTFail("should have been string property value for: %@ and it was not",name);
    }
    double resultValue = JSValueToNumber(globalContext, result, 0);
    XCTAssertEqual(value, resultValue, @"expected value: %f for property: %@, but received: %f", value, name, resultValue);
}

@end
