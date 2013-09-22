@import Foundation;
@import JavaScriptCore;

#import "JSBuffer.h"

@protocol HyperloopModule
+(JSValue*)load:(JSContext*)context;
@end

@interface hl$app : NSObject<HyperloopModule>
@end


@implementation hl$app

+(JSValue*)load:(JSContext*)context 
{
	JSGlobalContextRef globalContextRef = [context JSGlobalContextRef];
	JSValueRef globalValueref = [[context globalObject] JSValueRef];
	JSObjectRef globalObjectref = JSValueToObject(globalContextRef,globalValueref,0);
    JSObjectRef objectRef = MakeObjectForJSBufferConstructor(globalContextRef);
    JSStringRef stringRef = JSStringCreateWithUTF8CString("JSBuffer");
    JSObjectSetProperty(globalContextRef, globalObjectref, stringRef, objectRef, 0, 0);
    JSStringRelease(stringRef);

    context[@"assert"] = ^(bool passed, NSString *msg) {
        if (!passed) {
            NSLog(@"[INFO] FAIL: %@",msg);
        }
        else {
            NSLog(@"[INFO] PASS: %@",msg);
        }
    };

    JSValueRef exception = NULL;
    JSStringRef sourceStr = JSStringCreateWithUTF8CString("JS_TEST_SRC");
    JSValueRef resultRef = JSEvaluateScript(globalContextRef, sourceStr, 0, 0, 0, &exception);
    JSStringRelease(sourceStr);

    if (exception!=NULL) 
    {
        char buf[4000];
        JSStringRef resultStr = JSValueToStringCopy(globalContextRef, exception, 0);
        JSStringGetUTF8CString(resultStr, buf, 4000);
        NSLog(@"[ERROR] %s", buf);
    }

    NSLog(@"[DEBUG] EXIT");
    return nil;
}

@end
