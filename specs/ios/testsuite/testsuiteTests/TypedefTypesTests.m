/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"

@interface TypedefTypesTests : JSBaseTestCase
@end

extern JSValueRef HyperloopCGFloatToJSValueRef (JSContextRef ctx, CGFloat object);
extern CGFloat HyperloopJSValueRefToCGFloat (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);

extern JSValueRef HyperloopCGFloat_PToJSValueRef (JSContextRef ctx, CGFloat * object);
extern CGFloat * HyperloopJSValueRefToCGFloat_P (JSContextRef ctx, JSValueRef object, JSValueRef *exception, bool *cleanup);


@implementation TypedefTypesTests


- (void)testCGFloat
{
    CGFloat f = 123.0f;
    JSValueRef value = HyperloopCGFloatToJSValueRef(globalContext,f);
    XCTAssertTrue(JSValueIsNumber(globalContext, value), @"value was not a number");
    double number = JSValueToNumber(globalContext, value, 0);
    XCTAssertTrue(f==(CGFloat)number, @"number wasn't expected, was: %f",number);
    JSValueRef exception = NULL;
    CGFloat f2 = HyperloopJSValueRefToCGFloat(globalContext,value,&exception,NULL);
    XCTAssertTrue(f==f2, @"f2 wasn't expected, was: %f",f2);
}

- (void)testCGFloatPointer
{
    CGFloat f[] = {123.0f,456.0f};
    JSValueRef value = HyperloopCGFloat_PToJSValueRef(globalContext,f);
    XCTAssertTrue(JSValueIsObject(globalContext, value), @"value was not an object");
    JSValueRef exception = NULL;
    bool cleanup = false;
    CGFloat *result = HyperloopJSValueRefToCGFloat_P(globalContext,value,&exception,&cleanup);
    XCTAssertTrue(exception==NULL, @"exception was not NULL");
    XCTAssertTrue(cleanup==false, @"cleanup was true, should have been false");
    XCTAssertTrue(result!=NULL, @"result was NULL");
    XCTAssertTrue(f[0]==result[0], @"result[0] was not 123.0, was: %f",result[0]);
}

@end
