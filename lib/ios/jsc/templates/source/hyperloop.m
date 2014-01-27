/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "hyperloop.h"
#import "JSBuffer.h"
#import "NSException+NSExceptionHyperloopAdditions.h"

//#define LOG_ALLOC_DEALLOC

/**
 * implementation of JSPrivateObject
 */
@implementation JSPrivateObject

@synthesize object=object;
@synthesize value=value;
@synthesize buffer=buffer;
@synthesize type=type;
@synthesize context=context;

-(void)dealloc
{
    [self.object release];
    if (self.buffer && type==JSPrivateObjectTypeJSBuffer)
    {
        JSBuffer *b = (JSBuffer*)self.buffer;
        DestroyJSBuffer(b);
        self.buffer = NULL;
    }
    [super dealloc];
}
@end

/**
 * create a JSPrivateObject for storage in a JSObjectRef
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx, id object)
{
    JSPrivateObject *p = [JSPrivateObject new];
    p.object = object;
    p.value = NAN;
    p.type = JSPrivateObjectTypeID;
    p.context = ctx;
    return [p autorelease];
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a JSBuffer *
 */
JSPrivateObject* HyperloopMakePrivateObjectForJSBuffer(JSBuffer *buffer)
{
    JSPrivateObject *p = [JSPrivateObject new];
    p.buffer = buffer;
    p.value = NAN;
    p.type = JSPrivateObjectTypeJSBuffer;
    return [p autorelease];
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a Class
 */
JSPrivateObject* HyperloopMakePrivateObjectForClass(Class cls)
{
    JSPrivateObject *p = [JSPrivateObject new];
    p.object = cls;
    p.value = NAN;
    p.type = JSPrivateObjectTypeClass;
    return [p autorelease];
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a void *
 */
JSPrivateObject* HyperloopMakePrivateObjectForPointer(void *pointer)
{
    JSPrivateObject *p = [JSPrivateObject new];
    p.buffer = pointer;
    p.type = JSPrivateObjectTypePointer;
    p.value = NAN;
    return [p autorelease];
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a double
 */
JSPrivateObject* HyperloopMakePrivateObjectForNumber(double value)
{
    JSPrivateObject *p = [JSPrivateObject new];
    p.value = value;
    p.type = JSPrivateObjectTypeNumber;
    return [p autorelease];
}

/**
 * destroy a JSPrivateObject stored in a JSObjectRef
 */
void HyperloopDestroyPrivateObject(JSObjectRef object)
{
    JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
    if (![p isKindOfClass:[JSPrivateObject class]])
    {
        return;
    }
#endif
    if (p!=NULL)
    {
        [p release];
        JSObjectSetPrivate(object,0);
    }
}

/**
 * return a JSPrivateObject as an ID (or nil if not of type JSPrivateObjectTypeID)
 */
id HyperloopGetPrivateObjectAsID(JSObjectRef object)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return nil;
        }
#endif
        if (p!=nil)
        {
            if (p.type == JSPrivateObjectTypeID)
            {
                return p.object;
            }
        }
    }
    return nil;
}

/**
 * return a JSPrivateObject as a Class (or nil if not of type JSPrivateObjectTypeID)
 */
Class HyperloopGetPrivateObjectAsClass(JSObjectRef object)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return nil;
        }
#endif
        if (p!=nil)
        {
            if (p.type == JSPrivateObjectTypeClass)
            {
                return (Class)p.object;
            }
        }
    }
    return nil;
}

/**
 * return a JSPrivateObject as a JSBuffer (or NULL if not of type JSPrivateObjectTypeJSBuffer)
 */
JSBuffer* HyperloopGetPrivateObjectAsJSBuffer(JSObjectRef object)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return NULL;
        }
#endif
        if (p!=nil)
        {
            if (p.type == JSPrivateObjectTypeJSBuffer)
            {
                return (JSBuffer*)p.buffer;
            }
        }
    }
    return NULL;
}

/**
 * return a JSPrivateObject as a void * (or NULL if not of type JSPrivateObjectTypePointer)
 */
void* HyperloopGetPrivateObjectAsPointer(JSObjectRef object)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return NULL;
        }
#endif
        if (p!=nil)
        {
            if (p.type == JSPrivateObjectTypePointer)
            {
                return p.buffer;
            }
        }
    }
    return NULL;
}

/**
 * return a JSPrivateObject as a double (or NaN if not of type JSPrivateObjectTypeNumber)
 */
double HyperloopGetPrivateObjectAsNumber(JSObjectRef object)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return NAN;
        }
#endif
        if (p!=nil)
        {
            if (p.type == JSPrivateObjectTypeNumber)
            {
                return p.value;
            }
        }
    }
    return NAN;
}


/**
 * return true if JSPrivateObject is of type
 */
bool HyperloopPrivateObjectIsType(JSObjectRef object, JSPrivateObjectType type)
{
    if (object!=NULL)
    {
        JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
#ifdef USE_TIJSCORE
        if (![p isKindOfClass:[JSPrivateObject class]])
        {
            return false;
        }
#endif
        if (p!=nil)
        {
            return p.type == type;
        }
    }
    return false;
}

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *error, JSValueRef *exception)
{
    if (exception!=NULL)
    {
        JSStringRef string = JSStringCreateWithUTF8CString(error);
        JSValueRef message = JSValueMakeString(ctx, string);
        JSStringRelease(string);
        *exception = JSObjectMakeError(ctx, 1, &message, 0);
    }
    return JSValueMakeUndefined(ctx);
}

/**
 * return a string representation as a JSValueRef for an id
 */
JSValueRef HyperloopToString(JSContextRef ctx, id object)
{
    NSString *description;
    if ([object isKindOfClass:[NSString class]])
    {
        description = (NSString*)object;
    }
    else
    {
        description = [object description];
    }
    JSStringRef descriptionStr = JSStringCreateWithUTF8CString([description UTF8String]);
    JSValueRef result = JSValueMakeString(ctx, descriptionStr);
    JSStringRelease(descriptionStr);
    return result;
}

NSData* HyperloopDecompressBuffer (NSData*  _data)
{
    NSUInteger dataLength = [_data length];
    NSUInteger halfLength = dataLength / 2;

#ifdef DEBUG_COMPRESS
    NSLog(@"decompress called with %d bytes",dataLength);
#endif

    NSMutableData *decompressed = [NSMutableData dataWithLength: dataLength + halfLength];
    BOOL done = NO;
    int status;

    z_stream strm;
    strm.next_in = (Bytef *)[_data bytes];
    strm.avail_in = (uInt)dataLength;
    strm.total_out = 0;
    strm.zalloc = Z_NULL;
    strm.zfree = Z_NULL;

    // inflateInit2 knows how to deal with gzip format
    if (inflateInit2(&strm, (15+32)) != Z_OK)
    {
#ifdef DEBUG_COMPRESS
        NSLog(@"decompress inflateInit2 failed");
#endif
        return nil;
    }

    while (!done)
    {
        // extend decompressed if too short
        if (strm.total_out >= [decompressed length])
        {
            [decompressed increaseLengthBy: halfLength];
        }

        strm.next_out = [decompressed mutableBytes] + strm.total_out;
        strm.avail_out = (uInt)[decompressed length] - (uInt)strm.total_out;

        // Inflate another chunk.
        status = inflate (&strm, Z_SYNC_FLUSH);

        if (status == Z_STREAM_END)
        {
            done = YES;
        }
        else if (status != Z_OK)
        {
            break;
        }
    }

    if (inflateEnd (&strm) != Z_OK || !done)
    {
#ifdef DEBUG_COMPRESS
        NSLog(@"decompress inflateEnd failed");
#endif
        return nil;
    }

    // set actual length
    [decompressed setLength:strm.total_out];

#ifdef DEBUG_COMPRESS
    NSLog(@"decompress returning %ld bytes",strm.total_out);
#endif
    return decompressed;
}

/**
 * attempt to convert a JSValueRef to a NSString
 */
NSString* HyperloopToNSString(JSContextRef ctx, JSValueRef value)
{
    if (JSValueIsString(ctx,value))
    {
        JSStringRef stringRef = JSValueToStringCopy(ctx, value, 0);
        return HyperloopToNSStringFromString(ctx, stringRef);
    }
    else if (JSValueIsNumber(ctx,value))
    {
        double result = JSValueToNumber(ctx,value,0);
        return [[NSNumber numberWithDouble:result] stringValue];
    }
    else if (JSValueIsBoolean(ctx,value))
    {
        bool result = JSValueToBoolean(ctx,value);
        return result ? @"true" : @"false";
    }
    else if (JSValueIsNull(ctx,value) || JSValueIsUndefined(ctx,value))
    {
        return @"<null>";
    }
    else if (JSValueIsObject(ctx,value))
    {
        JSObjectRef objectRef = JSValueToObject(ctx, value, 0);
        if (JSObjectIsFunction(ctx,objectRef))
        {
            //TODO: return body of function?
            return @"[native function]";
        }
        else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeID))
        {
            id value = HyperloopGetPrivateObjectAsID(objectRef);
            return [value description];
        }
        else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeClass))
        {
            Class cls = HyperloopGetPrivateObjectAsClass(objectRef);
            return NSStringFromClass(cls);
        }
        else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeJSBuffer))
        {
            return @"JSBuffer";
        }
        else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypePointer))
        {
            void *pointer = HyperloopGetPrivateObjectAsPointer(objectRef);
            return [NSString stringWithFormat:@"%p",pointer];
        }
        // see if we have a defined toString function and if so, use it
        JSStringRef toStringProp = JSStringCreateWithUTF8CString("toString");
        if (JSObjectHasProperty(ctx,objectRef,toStringProp)) {
            JSValueRef resultRef = JSObjectGetProperty(ctx,objectRef,toStringProp,0);
            JSStringRelease(toStringProp);
            if (JSValueIsObject(ctx,resultRef))
            {
                JSObjectRef functionRef = JSValueToObject(ctx,resultRef,0);
                resultRef = JSObjectCallAsFunction(ctx,functionRef,objectRef,0,0,0);
                return HyperloopToNSString(ctx,resultRef);
            }
        }
        JSStringRelease(toStringProp);
    }
    JSStringRef stringRef = JSValueCreateJSONString(ctx, value, 0, 0);
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *result = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    return result;
}

JSValueRef HyperloopLogger (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
    if (argumentCount>1) {
        NSMutableArray *array = [NSMutableArray array];
        for (size_t c=0;c<argumentCount;c++)
        {
            [array addObject:HyperloopToNSString(ctx,arguments[c])];
        }
        NSLog(@"%@", [array componentsJoinedByString:@" "]);
    }
    else if (argumentCount>0) {
        NSLog(@"%@",HyperloopToNSString(ctx,arguments[0]));
    }

    return JSValueMakeUndefined(ctx);
}

/**
 * run module in an existing global context
 */
HyperloopJS* HyperloopRunInVM (JSGlobalContextRef globalContextRef, NSString *name, NSString *prefix, void(^initializer)(JSContextRef,JSObjectRef))
{
    if (prefix == nil)
    {
        // use the default if nil is specified, pass an empty string to not use one
        prefix = @"hl$";
    }

    JSObjectRef globalObjectref = JSContextGetGlobalObject(globalContextRef);
    JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
    if (!JSObjectHasProperty(globalContextRef,globalObjectref,prop))
    {
        JSClassDefinition def = kJSClassDefinitionEmpty;
        JSClassRef classDef = JSClassCreate(&def);
        JSObjectRef wrapper = JSObjectMake(globalContextRef, classDef, globalContextRef);
        JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
        JSObjectSetProperty(globalContextRef, globalObjectref, prop, wrapper, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete, 0);
    }
    JSStringRelease(prop);

    // setup our globals object
    JSStringRef globalProperty = JSStringCreateWithUTF8CString("global");
    if (!JSObjectHasProperty(globalContextRef,globalObjectref,globalProperty))
    {
        JSObjectSetProperty(globalContextRef, globalObjectref, globalProperty, globalObjectref, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete, 0);
    }
    JSStringRelease(globalProperty);

    // load the app into the module's context and use it over the global one
    JSObjectRef consoleObject = JSObjectMake(globalContextRef, 0, 0);
    JSStringRef logProperty = JSStringCreateWithUTF8CString("log");
    JSObjectRef logFunction = JSObjectMakeFunctionWithCallback(globalContextRef, logProperty, HyperloopLogger);
    JSObjectSetProperty(globalContextRef, consoleObject, logProperty, logFunction, kJSPropertyAttributeNone, 0);
    JSStringRelease(logProperty);

    HyperloopJS *result = HyperloopLoadJSWithLogger(globalContextRef,nil,name,prefix,consoleObject);

    if (initializer)
    {
        initializer(globalContextRef,result.exports);
    }

    return result;
}

/**
 * create a hyperloop VM
 */
JSGlobalContextRef HyperloopCreateVM (NSString *name, NSString *prefix)
{
    JSGlobalContextRef globalContextRef = JSGlobalContextCreate(NULL);
    JSObjectRef globalObjectref = JSContextGetGlobalObject(globalContextRef);

    // inject a simple console logger
    JSObjectRef consoleObject = JSObjectMake(globalContextRef, 0, 0);
    JSStringRef logProperty = JSStringCreateWithUTF8CString("log");
    JSStringRef consoleProperty = JSStringCreateWithUTF8CString("console");
    JSObjectRef logFunction = JSObjectMakeFunctionWithCallback(globalContextRef, logProperty, HyperloopLogger);
    JSObjectSetProperty(globalContextRef, consoleObject, logProperty, logFunction, kJSPropertyAttributeNone, 0);
    JSObjectSetProperty(globalContextRef, globalObjectref, consoleProperty, consoleObject, kJSPropertyAttributeNone, 0);
    JSStringRelease(logProperty);
    JSStringRelease(consoleProperty);

    // create a hook into our global context
    JSClassDefinition def = kJSClassDefinitionEmpty;
    JSClassRef classDef = JSClassCreate(&def);
    JSObjectRef wrapper = JSObjectMake(globalContextRef, classDef, globalContextRef);
    JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
    JSObjectSetProperty(globalContextRef, globalObjectref, prop, wrapper, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete, 0);
    JSStringRelease(prop);

    // setup our globals object
    JSStringRef globalProperty = JSStringCreateWithUTF8CString("global");
    JSObjectSetProperty(globalContextRef, globalObjectref, globalProperty, globalObjectref, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete, 0);
    JSStringRelease(globalProperty);

    // see if we need to load any custom js (these are JS files that are common across platform)
    id customJS =  NSClassFromString([NSString stringWithFormat:@"%@CustomJS",prefix]);
    if (customJS)
    {
        // will be nil in cases we didn't load any of the classes, which is perfectly OK
        NSData* compressedBuf = [customJS performSelector:@selector(buffer)];
        if (compressedBuf && [compressedBuf length] > 0)
        {
            BOOL usesArrayBuffer = (BOOL) [customJS performSelector:@selector(useArrayBuffer)];
            if (usesArrayBuffer)
            {
                JSStringRef bufProperty = JSStringCreateWithUTF8CString("JSBuffer");
                JSObjectRef jsobject = MakeObjectForJSBufferConstructor (globalContextRef);
                JSObjectSetProperty(globalContextRef, globalObjectref, bufProperty, jsobject, kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete, 0);
                JSStringRelease(bufProperty);
            }
            // load up the buffer
            NSData *buffer = HyperloopDecompressBuffer(compressedBuf);
            NSString *jscode = [[[NSString alloc] initWithData:buffer encoding:NSUTF8StringEncoding] autorelease];
            JSStringRef script = JSStringCreateWithUTF8CString([jscode UTF8String]);
            JSValueRef exception = NULL;
            JSEvaluateScript(globalContextRef,script,globalObjectref,NULL,0,&exception);
            JSStringRelease(script);
            CHECK_EXCEPTION(globalContextRef,exception,prefix);
        }
    }

    // install the try/catch handler
    HyperloopRegisterTryCatchHandler(globalContextRef);

    // retain it
    JSGlobalContextRetain(globalContextRef);

    // load the app into the context
    HyperloopJS *module = HyperloopLoadJS(globalContextRef,nil,name,prefix);
    if (module==nil)
    {
        return nil;
    }

    return globalContextRef;
}

/**
 * given a context, get the global context
 */
JSGlobalContextRef HyperloopGetGlobalContext (JSContextRef ctx)
{
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
    JSValueRef value = JSObjectGetProperty(ctx, global, prop, NULL);
    JSStringRelease(prop);
    if (JSValueIsObject(ctx,value))
    {
        JSObjectRef obj = JSValueToObject(ctx,value,0);
        return (JSGlobalContextRef)JSObjectGetPrivate(obj);
    }
    return NULL;
}

/**
 * destroy a hyperloop VM
 */
void HyperloopDestroyVM (JSGlobalContextRef ctx)
{
    JSGlobalContextRef globalCtx = HyperloopGetGlobalContext(ctx);
    if (globalCtx!=NULL)
    {
        JSObjectRef global = JSContextGetGlobalObject(ctx);
        JSStringRef prop = JSStringCreateWithUTF8CString("hyperloop$global");
        JSValueRef value = JSObjectGetProperty(ctx, global, prop, NULL);
        JSObjectRef obj = JSValueToObject(ctx,value,0);
        JSStringRelease(prop);
        JSObjectSetPrivate(obj,NULL);
        JSGlobalContextRelease(globalCtx);
    }
}

id HyperloopDynamicInvokeWithSentinel(JSContextRef ctx, const JSValueRef *arguments, size_t argumentCount, id target, SEL selector, bool instance)
{
    Method method = instance ? class_getInstanceMethod(target,selector) : class_getClassMethod(target,selector);
    IMP imp = method_getImplementation(method);
    id args[argumentCount];
    for (size_t c=0;c<argumentCount;c++)
    {
        JSValueRef value = arguments[c];
        id arg = NULL;
        if (JSValueIsObject(ctx,value))
        {
            JSObjectRef objectRef = JSValueToObject(ctx, value, 0);
            if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeID))
            {
                arg = HyperloopGetPrivateObjectAsID(objectRef);
            }
            else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeClass))
            {
                arg = (id)HyperloopGetPrivateObjectAsClass(objectRef);
            }
            else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypePointer))
            {
                arg = (id)HyperloopGetPrivateObjectAsPointer(objectRef);
            }
        }
        else if (JSValueIsBoolean(ctx,value))
        {
            arg = [NSNumber numberWithBool:JSValueToBoolean(ctx,value)];
        }
        else if (JSValueIsNumber(ctx,value))
        {
            arg = [NSNumber numberWithDouble:JSValueToNumber(ctx,value,0)];
        }
        else if (JSValueIsString(ctx,value))
        {
            JSStringRef stringRef = JSValueToStringCopy(ctx, value, 0);
            size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
            char buf[buflen];
            buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
            buf[buflen] = '\0';
            arg = (id)[NSString stringWithUTF8String:buf];
            JSStringRelease(stringRef);
        }
        args[c]=arg;
    }

    // hack, how else can you invoke a vararg IMP. i can't find any other way
    switch(argumentCount) {
        case 1: {
            return imp(target,selector,args[0],nil);
        }
        case 2: {
            return imp(target,selector,args[0],args[1],nil);
        }
        case 3: {
            return imp(target,selector,args[0],args[1],args[2],nil);
        }
        case 4: {
            return imp(target,selector,args[0],args[1],args[2],args[3],nil);
        }
        case 5: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],nil);
        }
        case 6: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],args[5],nil);
        }
        case 7: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],args[5],args[6],nil);
        }
        case 8: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],nil);
        }
        case 9: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],nil);
        }
        case 10: {
            return imp(target,selector,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9],nil);
        }
    }
    [NSException raise:@"HyperloopDynamicInvokeWithSentinel" format:@"too many arguments passed",nil];
    return nil;
}

/**
 * invoke a dynamic argument
 */
id HyperloopDynamicInvoke (JSContextRef ctx, const JSValueRef *arguments, size_t argumentCount, id target, SEL selector, bool instance)
{
    NSMethodSignature *signature = instance ? [target instanceMethodSignatureForSelector:selector] : [target methodSignatureForSelector:selector];
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];

    [invocation setSelector:selector];
    [invocation setTarget:target];

    for (size_t c=0;c<argumentCount;c++)
    {
        JSValueRef value = arguments[c];
        void *arg = NULL;
        if (JSValueIsObject(ctx,value))
        {
            JSObjectRef objectRef = JSValueToObject(ctx, value, 0);
            if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeID))
            {
                arg = (void*)HyperloopGetPrivateObjectAsID(objectRef);
            }
            else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeClass))
            {
                arg = (void*)HyperloopGetPrivateObjectAsClass(objectRef);
            }
            else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypeJSBuffer))
            {
                JSBuffer *buffer = HyperloopGetPrivateObjectAsJSBuffer(objectRef);
                arg = buffer->buffer;
            }
            else if (HyperloopPrivateObjectIsType(objectRef,JSPrivateObjectTypePointer))
            {
                arg = HyperloopGetPrivateObjectAsPointer(objectRef);
            }
        }
        else if (JSValueIsBoolean(ctx,value))
        {
            arg = (void*)JSValueToBoolean(ctx,value);
        }
        else if (JSValueIsNumber(ctx,value))
        {
            double d = JSValueToNumber(ctx,value,0);
            arg = &d;
        }
        else if (JSValueIsString(ctx,value))
        {
            JSStringRef stringRef = JSValueToStringCopy(ctx, value, 0);
            size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
            char buf[buflen];
            buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
            buf[buflen] = '\0';
            arg = (void*)[NSString stringWithUTF8String:buf];
            JSStringRelease(stringRef);
        }
        [invocation setArgument:&arg atIndex:2+c];
    }

    [invocation invoke];

    id returnValue = nil;

    if ([[invocation methodSignature] methodReturnLength] > 0)
    {
        if (strncmp([[invocation methodSignature] methodReturnType],@encode(id), 1))
        {
            char *buffer = malloc([[invocation methodSignature] methodReturnLength]);
            if (buffer != NULL) {
                [invocation getReturnValue: buffer];
                returnValue = [NSValue valueWithBytes:buffer objCType:[signature methodReturnType]];
                free(buffer);
            }
        }
        else
        {
            [invocation getReturnValue: &returnValue];
        }
        [returnValue retain];
    }

    return [returnValue autorelease];
}

/**
 * attempt to convert a JSString to a NSString
 */
NSString* HyperloopToNSStringFromString(JSContextRef ctx, JSStringRef stringRef)
{
    size_t buflen = JSStringGetMaximumUTF8CStringSize(stringRef);
    if (buflen)
    {
        char buf[buflen];
        buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
        buf[buflen] = '\0';
        NSString *result = [NSString stringWithUTF8String:buf];
        return result;
    }
    return nil;
}

/**
 * function will properly convert a native exception into a JS Error and throw it back
 * into the JSContext by setting the Error in the exception passed
 */
void HyperloopRaiseNativetoJSException(JSContextRef ctx, JSValueRef *exception, NSException *ex, NSArray *backtrace, const char *file, const char *fnName, int lineNumber)
{
    JSValueRef exargs[1];
    JSStringRef exstr = JSStringCreateWithUTF8CString([[ex description] UTF8String]);
    exargs[0] = JSValueMakeString(ctx,exstr);

    // make the js Error object
    JSObjectRef exobj = JSObjectMakeError(ctx,1,exargs,0);

    JSStringRef jsBacktrace = JSStringCreateWithUTF8CString([[backtrace componentsJoinedByString:@"\n"] UTF8String]);
    JSValueRef stackObj = JSValueMakeString(ctx,jsBacktrace);
    JSStringRelease(jsBacktrace);

    // set the property for the native stack
    {
        JSStringRef prop = JSStringCreateWithUTF8CString("nativeStack");
        JSObjectSetProperty(ctx, exobj, prop, stackObj, kJSPropertyAttributeNone, 0);
        JSStringRelease(prop);
    }
    // set the native source filename
    {
        JSStringRef prop = JSStringCreateWithUTF8CString("nativeSource");
        JSStringRef valueStr = JSStringCreateWithUTF8CString(file);
        JSValueRef value = JSValueMakeString(ctx,valueStr);
        JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
        JSStringRelease(prop);
        JSStringRelease(valueStr);
    }
    // set the native source function
    {
        JSStringRef prop = JSStringCreateWithUTF8CString("nativeFunction");
        JSStringRef valueStr = JSStringCreateWithUTF8CString(fnName);
        JSValueRef value = JSValueMakeString(ctx,valueStr);
        JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
        JSStringRelease(prop);
        JSStringRelease(valueStr);
    }
    // set the native line number
    {
        JSStringRef prop = JSStringCreateWithUTF8CString("nativeLine");
        JSValueRef value = JSValueMakeNumber(ctx,lineNumber);
        JSObjectSetProperty(ctx, exobj, prop, value, kJSPropertyAttributeNone, 0);
        JSStringRelease(prop);
    }

    JSStringRelease(exstr);

    // set our exception object
    *exception = exobj;
}

/**
 * for a given JS filename and line, turn it into to a source map result
 */
NSDictionary* HyperloopSourceMap(JSContextRef context, NSString *prefix, NSString *filename, NSString *line, NSString *column)
{
    if ([filename hasPrefix:@"./"])
    {
        filename = [filename substringFromIndex:2];
    }
    if ([filename hasSuffix:@".js"])
    {
        filename = [filename substringToIndex:[filename length]-3];
    }
    id sourceMap =  NSClassFromString([NSString stringWithFormat:@"%@_source_map",prefix]);
    if (sourceMap)
    {
        NSData* compressedBuf = [sourceMap performSelector:@selector(buffer)];
        if (compressedBuf && [compressedBuf length] > 0)
        {
            NSData *buffer = HyperloopDecompressBuffer(compressedBuf);
            NSString *sourceMapSource = [[[NSString alloc] initWithData:buffer encoding:NSUTF8StringEncoding] autorelease];

            NSString *filePath = [filename stringByAppendingString:@"_sm"];
            id sourceMapJSON =  NSClassFromString([NSString stringWithFormat:@"%@%@",prefix,filePath]);
            if (!sourceMapJSON)
            {
                return nil;
            }
            compressedBuf = [sourceMapJSON performSelector:@selector(buffer)];
            if (compressedBuf && [compressedBuf length] > 0)
            {
                // load up the buffer
                buffer = HyperloopDecompressBuffer(compressedBuf);
                NSString *sourceMapJSON = [[[NSString alloc] initWithData:buffer encoding:NSUTF8StringEncoding] autorelease];

                // make sure we have a valid column if not specified in stack
                if (column==nil || [column isEqualToString:@"<null>"])
                {
                    column = @"0";
                }

                NSString *script = [NSString stringWithFormat:
                    @"%@;(new this.sourceMap.SourceMapConsumer(%@)).originalPositionFor({ line: %@, column: %@ });",
                    sourceMapSource, sourceMapJSON, line, column
                ];

                // NSLog(@"[INFO] script=%@",sourceMapJSON);

                // execute the source map query via JS
                JSStringRef scriptRef = JSStringCreateWithUTF8CString([script UTF8String]);
                JSValueRef resultValue = JSEvaluateScript(context, scriptRef, NULL, NULL, 0, NULL);
                JSObjectRef resultObj = JSValueToObject(context, resultValue, NULL);
                JSStringRelease(scriptRef);

                // get an object from the result
                if (resultObj) {
                    NSMutableDictionary *fields = [NSMutableDictionary dictionary];

                    // Get raw JSON of source map data
                    [fields setObject:HyperloopToNSStringFromString(context,
                        JSValueCreateJSONString(context, resultValue, 0, NULL)) forKey:@"sourcemapQuery"];

                    // get the line number based on the source map property
                    JSStringRef lineString = JSStringCreateWithUTF8CString([@"line" UTF8String]);
                    JSValueRef lineRef = JSObjectGetProperty(context, resultObj, lineString, NULL);
                    [fields setObject:HyperloopToNSString(context, lineRef) forKey:@"line"];
                    JSStringRelease(lineString);

                    // get the column number based on the source map property
                    JSStringRef colString = JSStringCreateWithUTF8CString([@"column" UTF8String]);
                    JSValueRef colRef = JSObjectGetProperty(context, resultObj, colString, NULL);
                    [fields setObject:HyperloopToNSString(context, colRef) forKey:@"column"];
                    JSStringRelease(colString);

                    // get the sourceURL based on the source map property
                    JSStringRef sourceUrlString = JSStringCreateWithUTF8CString([@"source" UTF8String]);
                    JSValueRef sourceUrlRef = JSObjectGetProperty(context, resultObj, sourceUrlString, NULL);
                    [fields setObject:HyperloopToNSString(context, sourceUrlRef) forKey:@"sourceURL"];
                    JSStringRelease(sourceUrlString);

                    return fields;
                }

            }
        }
    }

    return nil;
}

JSValueRef HyperloopNativeErrorProcessor (JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
{
#undef DEBUG_STACKTRACE

    JSObjectRef exObject = JSValueToObject(ctx,arguments[0],exception);
    if (!exObject)
    {
        return exObject;
    }
    NSString *fn = HyperloopToNSString(ctx,arguments[1]);
    NSString *classPrefix = HyperloopToNSString(ctx,arguments[2]);
    JSStringRef property = JSStringCreateWithUTF8CString("stack");

    if (JSObjectHasProperty(ctx,exObject,property))
    {
        JSValueRef value = JSObjectGetProperty(ctx,exObject,property,exception);
        NSString *str = HyperloopToNSString(ctx,value);

        JSStringRef lineProp = JSStringCreateWithUTF8CString("line");
        value = JSObjectGetProperty(ctx,exObject,lineProp,exception);
        NSString *line = HyperloopToNSString(ctx,value);
        JSStringRelease(lineProp);

        JSStringRef colProp = JSStringCreateWithUTF8CString("column");
        value = JSObjectGetProperty(ctx,exObject,colProp,exception);
        NSString *column = HyperloopToNSString(ctx,value);
        JSStringRelease(colProp);

        // fetch the source map details for this JS line
        NSDictionary *sourceMap = HyperloopSourceMap(ctx,classPrefix,fn,line,column);

    #ifdef DEBUG_STACKTRACE
        NSLog(@"[INFO] sourceMap=%@",sourceMap);
    #endif

        NSString *top;
        NSMutableArray *stack;

        if (sourceMap!=nil)
        {
            // create a stack array
            stack = [NSMutableArray array];
            [stack addObjectsFromArray:[str componentsSeparatedByString:@"\n"]];

    #ifdef DEBUG_STACKTRACE
            NSLog(@"STACK=%@",stack);
            NSLog(@"sourceMap=%@",sourceMap);
    #endif
            top = [stack objectAtIndex:0];
            // fix the top of the stack to convert native entry point into JS
            top = [top stringByReplacingOccurrencesOfString:@"@[native code]"
                withString:[NSString stringWithFormat:@"@%@:%@:%@",
                [sourceMap objectForKey:@"sourceURL"],
                [sourceMap objectForKey:@"line"],
                [sourceMap objectForKey:@"column"]]];

            // we remove top of the stack since we append it special below
            [stack removeObjectAtIndex:0];

            for (int c=0;c<[stack count];c++)
            {
                NSString *line = [stack objectAtIndex:c];
                if ([fn hasPrefix:@"./"]==NO)
                {
                    fn = [NSString stringWithFormat:@"./%@",fn];
                }
                NSString *requireLine = [NSString stringWithFormat:@"require@%@.js",fn];
    #ifdef DEBUG_STACKTRACE
                NSLog(@"requireLine=%@",requireLine);
                NSLog(@"LINE[%d]=%@",c,line);
    #endif
                if ([line hasPrefix:requireLine]==NO)
                {
                    NSRange range = [line rangeOfString:@"@"];
                    if (range.location != NSNotFound)
                    {
                        //should look like this: require@./app.js:4:20
                        NSArray *parts = [[line substringFromIndex:range.location+1] componentsSeparatedByString:@":"];
                        if ([parts count] > 2)
                        {
                            NSString *pm = [line substringToIndex:range.location];
                            NSString *pfn = [parts objectAtIndex:0];
                            NSString *pln = [parts objectAtIndex:1];
                            NSString *pcn = [parts objectAtIndex:2];
                            NSDictionary *psm = HyperloopSourceMap(ctx,classPrefix,pfn,pln,pcn);
                            if (psm!=nil)
                            {
        #ifdef DEBUG_STACKTRACE
                                NSLog(@"pfn=[%@], pln=[%@], pcn=[%@]",pfn,pln,pcn);
                                NSLog(@"psm=[%@]",psm);
        #endif
                                NSString *newline = [NSString stringWithFormat:@"%@@%@:%@:%@",
                                    pm,
                                    [psm objectForKey:@"sourceURL"],
                                    [psm objectForKey:@"line"],
                                    [psm objectForKey:@"column"]
                                ];
                                [stack setObject:newline atIndexedSubscript:c];
                            }
                        }
                    }
                }
                else
                {
                    // since require@./<fn> is a wrapped common JS which isn't in the
                    // dev's source file, let's set the line number to <generated code> to indicate
                    // that this was generated source
                    [stack setObject:[NSString stringWithFormat:@"%@[generated code]",requireLine] atIndexedSubscript:c];
                }
            }
        }

        NSString *fn;
        NSString *func;
        {
            JSStringRef p = JSStringCreateWithUTF8CString("nativeSource");
            JSValueRef v = JSObjectGetProperty(ctx,exObject,p,exception);
            fn = HyperloopToNSString(ctx,v);
            JSStringRelease(p);
        }
        {
            JSStringRef p = JSStringCreateWithUTF8CString("nativeFunction");
            JSValueRef v = JSObjectGetProperty(ctx,exObject,p,exception);
            func = HyperloopToNSString(ctx,v);
            JSStringRelease(p);
        }
        {
            JSStringRef p = JSStringCreateWithUTF8CString("nativeLine");
            JSValueRef v = JSObjectGetProperty(ctx,exObject,p,exception);
            line = HyperloopToNSString(ctx,v);
            JSStringRelease(p);
        }
        if (sourceMap!=nil)
        {
            NSString *nativetop = [NSString stringWithFormat:@"%@@%@:%@:0",func,fn,line];
            str = [NSString stringWithFormat:@"%@\n%@\n%@", nativetop, top, [stack componentsJoinedByString:@"\n"]];
        }
        JSStringRef newstr = JSStringCreateWithUTF8CString([str UTF8String]);
        JSValueRef newStack = JSValueMakeString(ctx,newstr);
        JSPropertyNameArrayRef pa = JSObjectCopyPropertyNames(ctx,exObject);
        JSValueRef exargs[1];
        {
            JSStringRef p = JSStringCreateWithUTF8CString("message");
            exargs[0] = JSObjectGetProperty(ctx,exObject,p,0);
            JSStringRelease(p);
        }
        JSObjectRef newError = JSObjectMakeError(ctx,1,exargs,0);
        size_t count = JSPropertyNameArrayGetCount(pa);
        for (size_t c=0;c<count;c++)
        {
            JSStringRef p = JSPropertyNameArrayGetNameAtIndex(pa,c);
            if (!JSStringIsEqualToUTF8CString(p,"stack"))
            {
                JSValueRef v = JSObjectGetProperty(ctx,exObject,p,0);
                JSObjectSetProperty(ctx,newError,p,v,0,0);
            }
        }

        JSObjectSetProperty(ctx,newError,property,newStack,0,exception);
        JSPropertyNameArrayRelease(pa);
        JSStringRelease(newstr);
        exObject = newError;
    }
    JSStringRelease(property);
    return exObject;
}

/**
 * register a try/catch handler which will process special native exceptions
 */
void HyperloopRegisterTryCatchHandler(JSContextRef ctx)
{
    JSObjectRef object = JSContextGetGlobalObject(ctx);
    JSStringRef property = JSStringCreateWithUTF8CString("HL$ProcessEx");
    if (!JSObjectHasProperty(ctx,object,property))
    {
        JSObjectRef function = JSObjectMakeFunctionWithCallback(ctx, property, HyperloopNativeErrorProcessor);
        JSObjectSetProperty(ctx, object, property, function, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontEnum|kJSPropertyAttributeDontDelete, 0);
    }
    JSStringRelease(property);
}