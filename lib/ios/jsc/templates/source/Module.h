/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
@import JavaScriptCore;


@interface HyperloopJS : NSObject 

@property (nonatomic, copy) NSString *id;
@property (nonatomic, copy) NSString *filename;
@property (nonatomic, readwrite) BOOL loaded;
@property (nonatomic, retain) HyperloopJS *parent;
@property (nonatomic, assign) JSObjectRef exports;
@property (nonatomic, assign) JSContextRef context;
@property (nonatomic, copy) NSString *prefix;

@end

JSObjectRef HyperloopMakeJSObject (JSContextRef ctx, HyperloopJS *module);
HyperloopJS* HyperloopLoadJS (JSContextRef ctx, HyperloopJS *parent, NSString *path, NSString *prefix);
