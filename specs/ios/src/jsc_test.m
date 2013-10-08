@import Foundation;
@import JavaScriptCore;

#import "JSBuffer.h"

@protocol HyperloopModule
+(JSValueRef)load:(JSContextRef)context;
@end

@interface hl$app : NSObject<HyperloopModule>
@end

JSValueRef AssertionCallback (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    bool passed = JSValueToBoolean(ctx,arguments[0]);
    JSStringRef stringRef = JSValueToStringCopy(ctx,arguments[1],0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *msg = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    if (!passed) {
        NSLog(@"[INFO] FAIL: %@",msg);
    }
    else {
        NSLog(@"[INFO] PASS: %@",msg);
    }
    return JSValueMakeUndefined(ctx);
}

@implementation hl$app

+(JSValueRef)load:(JSContextRef)context
{
    JSObjectRef globalObject = JSContextGetGlobalObject(context);

    JSStringRef assertProperty = JSStringCreateWithUTF8CString("assert");
    JSObjectRef function = JSObjectMakeFunctionWithCallback(context, assertProperty, AssertionCallback);
    JSObjectSetProperty(context, globalObject, assertProperty, function, kJSPropertyAttributeNone, 0);
    JSStringRelease(assertProperty);


    JSObjectRef objectRef = MakeObjectForJSBufferConstructor(context);
    JSStringRef stringRef = JSStringCreateWithUTF8CString("JSBuffer");
    JSObjectSetProperty(context, globalObject, stringRef, objectRef, 0, 0);
    JSStringRelease(stringRef);

    JSValueRef exception = NULL;
    JSStringRef sourceStr = JSStringCreateWithUTF8CString("JS_TEST_SRC");
    JSValueRef resultRef = JSEvaluateScript(context, sourceStr, 0, 0, 0, &exception);
    JSStringRelease(sourceStr);

    if (exception!=NULL)
    {
        char buf[4000];
        JSStringRef resultStr = JSValueToStringCopy(context, exception, 0);
        JSStringGetUTF8CString(resultStr, buf, 4000);
        NSLog(@"[ERROR] %s", buf);
        JSStringRelease(resultStr);
    }

    NSLog(@"[DEBUG] EXIT");
    return nil;
}

@end
