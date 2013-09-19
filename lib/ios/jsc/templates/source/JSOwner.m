/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

#import "JSOwner.h"

static NSMutableArray *objects;

@implementation JSOwner

+(void)timerFired:(id)timer
{
    NSLog(@"timer fired");
}

+(void)startTimerIfNecessary
{
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        objects = [[NSMutableArray alloc] init];
        [NSTimer scheduledTimerWithTimeInterval:5 target:[JSOwner class] selector:@selector(timerFired:) userInfo:nil repeats:YES];
    });
}

-(id)initWithSource:(JSObjectRef)jsObject withNative:(id)nativeObject withContext:(JSGlobalContextRef)ctx
{
    if ((self = [super self]))
    {
        source = jsObject;
        context = ctx;
        JSGlobalContextRetain(context);
        map = [[NSMapTable strongToWeakObjectsMapTable] retain];
        [map setObject:nativeObject forKey:@"o"];
        JSValueProtect(ctx,source);

        // add only on main queue, but can be async
        dispatch_async(dispatch_get_main_queue(),^{
            [JSOwner startTimerIfNecessary];
            [objects addObject:self];
        });
    }
    return self;
}

-(void)cleanup
{
    if (map!=nil)
    {
        [map removeAllObjects];
        [map release];
        map = nil;
    }
    if (source!=NULL)
    {
        JSValueUnprotect(context,source);
        source = NULL;
    }
    if (context!=NULL)
    {
        JSGlobalContextRelease(context);
        context = NULL;
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

@end
