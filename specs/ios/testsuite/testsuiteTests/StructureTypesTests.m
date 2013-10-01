/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"

JSObjectRef MakeObjectForNSRange (JSContextRef ctx, NSRange *instance);
JSObjectRef MakeObjectForCGRect (JSContextRef ctx, CGRect *rect);
JSObjectRef MakeObjectForSEL (JSContextRef ctx, SEL selector);


@interface StructureTypesTests : JSBaseTestCase
@end

@implementation StructureTypesTests

- (void)testNSRange
{
    NSRange range;
    range.length = 1;
    range.location = 2;
    
    JSObjectRef object = MakeObjectForNSRange(globalContext, &range);
    [self assertNumberProperty:object property:@"length" value:1];
    [self assertNumberProperty:object property:@"location" value:2];
}

- (void)testCGRect
{
    CGRect rect;
    rect.origin = CGPointMake(1, 2);
    rect.size = CGSizeMake(3, 4);
    
    JSObjectRef object = MakeObjectForCGRect(globalContext, &rect);
    
    JSValueRef exception = NULL;
    JSStringRef originProp = JSStringCreateWithUTF8CString("origin");
    JSStringRef sizeProp   = JSStringCreateWithUTF8CString("size");
    
    JSValueRef origin = JSObjectGetProperty(globalContext, object, originProp, &exception);
    if (exception!=NULL)
    {
        NSString *msg = HyperloopToNSString(globalContext, exception);
        XCTFail(@"exception generated trying to get origin property: %@", msg);
    }
    XCTAssert(origin!=NULL, @"origin property was null");
    
    JSStringRelease(originProp);
    JSStringRelease(sizeProp);
}

- (void)testSEL
{
    SEL selector = @selector(testSEL);
    JSObjectRef object = MakeObjectForSEL(globalContext, selector);
    JSValueRef exception = NULL;
    JSStringRef toStringProp = JSStringCreateWithUTF8CString("toString");
    JSValueRef toString = JSObjectGetProperty(globalContext, object, toStringProp, &exception);
    if (exception!=NULL)
    {
        NSString *msg = HyperloopToNSString(globalContext, exception);
        XCTFail(@"exception generated trying to get toString property: %@", msg);
    }
    XCTAssert(toString!=NULL, @"toString property was null");
    JSObjectRef function = JSValueToObject(globalContext, toString, &exception);
    XCTAssert(JSObjectIsFunction(globalContext,function),@"toString property was not a function");
    NSLog(@"%@", HyperloopToNSString(globalContext, function));
    JSValueRef result = JSObjectCallAsFunction(globalContext, function, object, 0, NULL, &exception);
    NSString *resultStr = HyperloopToNSString(globalContext, result);
    bool equal = [resultStr isEqualToString:NSStringFromSelector(selector)];
    XCTAssert(equal, @"selector didn't match");
}

@end
