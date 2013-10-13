/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

@import JavaScriptCore;

#define CHECK_EXCEPTION(ctx,ex) [NSException raiseJSException:ex context:ctx]

@interface NSException (NSExceptionHyperloopAdditions)

+ (void)raiseJSException:(JSValueRef)exception context:(JSContextRef)context;

@end