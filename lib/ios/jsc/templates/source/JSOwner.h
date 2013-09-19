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
 * JSOwner manages the relationship between a JS object and a native object
 * that are linked.
 */
@interface JSOwner : NSObject
{
    JSGlobalContextRef context;
    JSObjectRef source;
    NSMapTable *map;
}

-(id)initWithSource:(JSObjectRef)jsObject withNative:(id)nativeObject withContext:(JSGlobalContextRef)ctx;

@end

