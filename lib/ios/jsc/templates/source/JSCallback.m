/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

#import "JSCallback.h"

@implementation JSCallback

-(id)initWithSource:(JSObjectRef)src withFunction:(JSObjectRef)fn withContext:(JSContextRef)ctx
{
    if ((self = [super self]))
    {
        source = src;
        function = fn;
        context = ctx;
        map = [[NSMapTable strongToWeakObjectsMapTable] retain];
        id sourceObject = (id)JSObjectGetPrivate(src);
        [map setObject:sourceObject forKey:@"o"];
        JSValueProtect(ctx,function);
        JSValueProtect(context,source);
    }
    return self;
}

-(void)cleanup
{
    if (map!=nil)
    {
        [map removeAllObjects];
        JSValueUnprotect(context,function);
        JSValueUnprotect(context,source);
        function = NULL;
        source = NULL;
        context = NULL;
        [map release];
        map = nil;
    }
}

-(void)dealloc
{
    [self cleanup];
    [super dealloc];
}

-(BOOL)check
{
    if (map!=nil)
    {
        id sourceObj = [map objectForKey:@"o"];
        if (sourceObj==nil)
        {
            [self cleanup];
        }
        else
        {
            return YES;
        }
    }
    return NO;
}

-(void)callback:(id)action
{
    if ([self check])
    {
        JSObjectCallAsFunction(context, function, source, 0, 0, 0);
    }
}

@end
