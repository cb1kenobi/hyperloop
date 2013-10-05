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
extern JSObjectRef MakeObjectForNSMutableAttributedStringConstructor (JSContextRef ctx);


@interface NSMutableStringTests : JSBaseTestCase
@end

@implementation NSMutableStringTests


- (void)testInitWithString
{
    JSObjectRef nmsObjectRef = MakeObjectForNSMutableAttributedStringConstructor(globalContext);
    JSObjectRef stringObjectRef = MakeObjectForNSStringConstructor(globalContext);
    JSStringRef property = JSStringCreateWithUTF8CString("NSMutableAttributedString");
    JSObjectSetProperty(globalContext, globalObject, property, nmsObjectRef, 0, 0);
    JSStringRelease(property);
    property = JSStringCreateWithUTF8CString("NSString");
    JSObjectSetProperty(globalContext, globalObject, property, stringObjectRef, 0, 0);
    JSStringRelease(property);
    
   
    NSMutableAttributedString *s = [[NSMutableAttributedString alloc] initWithString:@"Hello, world."];
    
    JSStringRef script = JSStringCreateWithUTF8CString("var mas = NSMutableAttributedString.alloc(),iws = mas.initWithString(NSString.stringWithUTF8String('Hello, world.')); iws");
    JSValueRef result = JSEvaluateScript(globalContext, script, globalObject, NULL, 0, 0);
    JSStringRef stringRef = JSValueToStringCopy(globalContext, result, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *resultStr = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    JSStringRelease(script);
    
    XCTAssertTrue([resultStr isEqualToString:[s description]], @"result was not correct");
}

@end
