/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "JSBaseTestCase.h"

extern JSValueRef HyperloopEAGLGetVersion (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception);

extern JSValueRef HyperloopCGPathCreateMutable (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception);

extern JSObjectRef MakeObjectForJSBuffer (JSContextRef ctx, JSBuffer *instance);

@interface FunctionTypeTests : JSBaseTestCase
@end

@implementation FunctionTypeTests

- (void)testInOutParameter
{
    JSBuffer* minor = malloc(sizeof(JSBuffer));
    minor->buffer = malloc(sizeof(int));
    minor->length = sizeof(int);
    minor->type = JSBufferTypePointer;
    
    JSBuffer* major = malloc(sizeof(JSBuffer));
    major->buffer = malloc(sizeof(int));
    major->length = sizeof(int);
    major->type = JSBufferTypePointer;
 
    JSObjectRef minorObject = MakeObjectForJSBuffer(globalContext, minor);
    JSObjectRef majorObject = MakeObjectForJSBuffer(globalContext, major);
    
    JSValueRef arguments[2];
    JSValueRef exception = NULL;

    arguments[0] = majorObject;
    arguments[1] = minorObject;
    
    unsigned int _major = 0;
    unsigned int _minor = 0;
    
    EAGLGetVersion(&_major,&_minor);
    
    JSValueRef result = HyperloopEAGLGetVersion(globalContext,NULL,NULL,2,arguments,&exception);
    
    unsigned int resultMajor = ((unsigned int*)major->buffer)[0];
    unsigned int resultMinor = ((unsigned int*)minor->buffer)[0];
    
    XCTAssertTrue(JSValueIsUndefined(globalContext, result), @"result should have been undefined");
    XCTAssertTrue(resultMajor==_major,@"major version %d doesn't match: %d",(int)resultMajor,(int)_major);
    XCTAssertTrue(resultMinor==_minor,@"minor version %d doesn't match: %d",(int)resultMinor,(int)_minor);
}

- (void)testFunctionWithNoArgsOrReturnType
{
    JSValueRef exception = NULL;
    JSValueRef result = HyperloopCGPathCreateMutable(globalContext,NULL,NULL,0,NULL,&exception);
    XCTAssertTrue(JSValueIsUndefined(globalContext, result)==false, @"result should not have been undefined");
    XCTAssertTrue(JSValueIsObject(globalContext, result), @"result should have been object");
}

@end
