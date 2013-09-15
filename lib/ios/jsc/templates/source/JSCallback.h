/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */


@import Foundation;
@import JavaScriptCore;

/**
 * JSCallback is a class that will hold a JS callback function and source and will call the function
 * upon the invocation of the selector method callback: 
 *
 * It will properly retain the source and function and will weak reference the source's private object (id)
 * and will cleanup memory if the source's private object is released.
 */
@interface JSCallback : NSObject
{
    JSContextRef context;
    JSObjectRef source;
    JSObjectRef function;
    NSMapTable *map;
}

-(id)initWithSource:(JSObjectRef)src withFunction:(JSObjectRef)fn withContext:(JSContextRef)ctx;
-(BOOL)check;
-(void)callback:(id)action;

@end

