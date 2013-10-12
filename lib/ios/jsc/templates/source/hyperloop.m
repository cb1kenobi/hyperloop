/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "hyperloop.h"

//#define LOG_ALLOC_DEALLOC

/**
 * create a JSPrivateObject for storage in a JSObjectRef
 */
JSPrivateObject* HyperloopMakePrivateObjectForID(JSContextRef ctx, id object)
{
	JSPrivateObject *p = (JSPrivateObject*)malloc(sizeof(JSPrivateObject));
	p->object = (void *)object;
    p->value = NAN;
	p->type = JSPrivateObjectTypeID;
	p->map = nil;
	p->context = ctx;
	[object retain];
	return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a JSBuffer *
 */
JSPrivateObject* HyperloopMakePrivateObjectForJSBuffer(JSBuffer *buffer)
{
	JSPrivateObject *p = (JSPrivateObject*)malloc(sizeof(JSPrivateObject));
	p->object = (void *)buffer;
    p->value = NAN;
	p->type = JSPrivateObjectTypeJSBuffer;
	p->map = nil;
	p->context = NULL;
	return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a Class
 */
JSPrivateObject* HyperloopMakePrivateObjectForClass(Class cls)
{
	JSPrivateObject *p = (JSPrivateObject*)malloc(sizeof(JSPrivateObject));
	p->object = (void *)cls;
    p->value = NAN;
	p->type = JSPrivateObjectTypeClass;
	p->map = nil;
	p->context = NULL;
	return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a void *
 */
JSPrivateObject* HyperloopMakePrivateObjectForPointer(void *pointer)
{
    JSPrivateObject *p = (JSPrivateObject*)malloc(sizeof(JSPrivateObject));
    p->object = pointer;
    p->value = NAN;
    p->type = JSPrivateObjectTypePointer;
    p->map = nil;
    p->context = NULL;
    return p;
}

/**
 * create a JSPrivateObject for storage in a JSObjectRef where the object is a double
 */
JSPrivateObject* HyperloopMakePrivateObjectForNumber(double value)
{
    JSPrivateObject *p = (JSPrivateObject*)malloc(sizeof(JSPrivateObject));
    p->value = value;
    p->object = NULL;
    p->type = JSPrivateObjectTypeNumber;
    p->map = nil;
    p->context = NULL;
    return p;
}


/**
 * destroy a JSPrivateObject stored in a JSObjectRef
 */
void HyperloopDestroyPrivateObject(JSObjectRef object)
{
	JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
	if (p!=NULL)
	{
#ifdef LOG_ALLOC_DEALLOC
		NSLog(@"HyperloopDestroyPrivateObject %p",p->context);
#endif
		if (p->type == JSPrivateObjectTypeID)
		{
			id object = (id)p->object;
			[object release];
		}
		else if (p->type == JSPrivateObjectTypeJSBuffer)
		{
			JSBuffer *buffer = (JSBuffer*)p->object;
			DestroyJSBuffer(buffer);
			buffer = NULL;
		}
		else if (p->type == JSPrivateObjectTypeClass)
		{
			Class cls = (Class)p->object;
			[cls release];
		}
        else if (p->type == JSPrivateObjectTypePointer)
        {
            p->object = NULL;
        }
        else if (p->type == JSPrivateObjectTypeNumber)
        {
            p->value = NAN;
        }
		if (p->map)
		{
			[p->map removeAllObjects];
			[p->map release];
			p->map=nil;
			JSValueUnprotect(p->context,object);
		}
		if (p->context!=NULL)
		{
			p->context = NULL;
		}
		free(p);
		p = NULL;
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
        if (p!=NULL)
        {
            if (p->type == JSPrivateObjectTypeID)
            {
                return (id)p->object;
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
        if (p!=NULL)
        {
            if (p->type == JSPrivateObjectTypeClass)
            {
                return (Class)p->object;
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
        if (p!=NULL)
        {
            if (p->type == JSPrivateObjectTypeJSBuffer)
            {
                return (JSBuffer*)p->object;
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
        if (p!=NULL)
        {
            if (p->type == JSPrivateObjectTypePointer)
            {
                return p->object;
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
        if (p!=NULL)
        {
            if (p->type == JSPrivateObjectTypeNumber)
            {
                return p->value;
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
        if (p!=NULL)
        {
            return p->type == type;
        }
    }
	return false;
}

/**
 * raise an exception
 */
JSValueRef HyperloopMakeException(JSContextRef ctx, const char *error, JSValueRef *exception)
{
    if (*exception!=NULL)
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

/**
 * set the owner for an object
 */
void HyperloopSetOwner(JSObjectRef object, id owner)
{
	JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
	if (p!=NULL)
	{
		BOOL protect = YES;
		if (p->map==nil)
		{
			p->map = [[NSMapTable alloc] init];
		}
		else
		{
			[p->map removeAllObjects];
			protect = NO; // already held
		}
		[p->map setObject:owner forKey:@"o"];
		if (protect)
		{
			JSValueProtect(p->context,object);
		}
	}
}

/**
 * get the owner for an object or nil if no owner or it's been released
 */
id HyperloopGetOwner(JSObjectRef object)
{
	JSPrivateObject *p = (JSPrivateObject*)JSObjectGetPrivate(object);
	if (p!=NULL && p->map)
	{
		id owner = [p->map objectForKey:@"o"];
		if (owner==nil)
		{
			[p->map removeAllObjects];
			p->map = nil;
			JSValueUnprotect(p->context,object);
		}
	}
	return nil;
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
        return [[NSNumber numberWithBool:result] stringValue];
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
 * create a hyperloop VM
 */
JSContextRef HyperloopCreateVM (NSString *name)
{
	Class<HyperloopModule> cls = NSClassFromString(name);
	if (cls==nil)
	{
		return nil;
	}

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

    // retain it
    JSGlobalContextRetain(globalContextRef);

    // load the app into the context
    [cls load:globalContextRef];

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
void HyperloopDestroyVM (JSContextRef ctx)
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
    char buf[buflen];
    buflen = JSStringGetUTF8CString(stringRef, buf, buflen);
    buf[buflen] = '\0';
    NSString *result = [NSString stringWithUTF8String:buf];
    JSStringRelease(stringRef);
    return result;
}

