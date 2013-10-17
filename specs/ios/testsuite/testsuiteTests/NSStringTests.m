/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"

extern JSObjectRef MakeObjectForNSStringConstructor (JSContextRef ctx);

@interface NSStringTests : JSBaseTestCase
@end

@implementation NSStringTests

- (void)testStringWithFormat
{
    JSObjectRef stringObjectRef = MakeObjectForNSStringConstructor(globalContext);
    JSStringRef property = JSStringCreateWithUTF8CString("NSString");
    JSObjectSetProperty(globalContext, globalObject, property, stringObjectRef, 0, 0);
    JSStringRelease(property);

    JSStringRef script = JSStringCreateWithUTF8CString("NSString.stringWithFormat('%@','hello')");
    JSValueRef result = JSEvaluateScript(globalContext, script, globalObject, NULL, 0, 0);
    JSStringRef stringRef = JSValueToStringCopy(globalContext, result, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *resultStr = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    JSStringRelease(script);

    NSString *expected = @"hello";
    XCTAssertTrue([resultStr isEqualToString:expected],
        @"expected '%@', got '%@'", expected, resultStr);
}

- (void)testStringWithFormatAndPrimitiveInt
{
    JSObjectRef stringObjectRef = MakeObjectForNSStringConstructor(globalContext);
    JSStringRef property = JSStringCreateWithUTF8CString("NSString");
    JSObjectSetProperty(globalContext, globalObject, property, stringObjectRef, 0, 0);
    JSStringRelease(property);

    JSStringRef script = JSStringCreateWithUTF8CString("NSString.stringWithFormat('%@,%d','hello',1)");
    JSValueRef result = JSEvaluateScript(globalContext, script, globalObject, NULL, 0, 0);
    JSStringRef stringRef = JSValueToStringCopy(globalContext, result, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *resultStr = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    JSStringRelease(script);

    NSString *expected = @"hello,1";
    XCTAssertTrue([resultStr isEqualToString:expected],
        @"expected '%@', got '%@'", expected, resultStr);
}

- (void)testStringWithFormatAndPrimitiveBool
{
    JSObjectRef stringObjectRef = MakeObjectForNSStringConstructor(globalContext);
    JSStringRef property = JSStringCreateWithUTF8CString("NSString");
    JSObjectSetProperty(globalContext, globalObject, property, stringObjectRef, 0, 0);
    JSStringRelease(property);

    JSStringRef script = JSStringCreateWithUTF8CString("NSString.stringWithFormat('%@,%d','hello',false)");
    JSValueRef result = JSEvaluateScript(globalContext, script, globalObject, NULL, 0, 0);
    JSStringRef stringRef = JSValueToStringCopy(globalContext, result, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *resultStr = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    JSStringRelease(script);

    NSString *expected = @"hello,0";
    XCTAssertTrue([resultStr isEqualToString:expected],
        @"expected '%@', got '%@'", expected, resultStr);
}

- (void)testStringWithFormatAndPrimitiveChar
{
    JSObjectRef stringObjectRef = MakeObjectForNSStringConstructor(globalContext);
    JSStringRef property = JSStringCreateWithUTF8CString("NSString");
    JSObjectSetProperty(globalContext, globalObject, property, stringObjectRef, 0, 0);
    JSStringRelease(property);

    JSStringRef script = JSStringCreateWithUTF8CString("NSString.stringWithFormat('%@,%@','hello','0')");
    JSValueRef result = JSEvaluateScript(globalContext, script, globalObject, NULL, 0, 0);
    JSStringRef stringRef = JSValueToStringCopy(globalContext, result, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *resultStr = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    JSStringRelease(script);

    NSString *expected = @"hello,0";
    XCTAssertTrue([resultStr isEqualToString:expected],
        @"expected '%@', got '%@'", expected, resultStr);
}

@end
