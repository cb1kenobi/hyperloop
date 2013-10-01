/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import <XCTest/XCTest.h>
#import <hyperloop.h>


@interface JSBaseTestCase : XCTestCase
{
    JSGlobalContextRef globalContext;
}

-(void)assertStringProperty:(JSObjectRef)object property:(NSString*)name value:(NSString*)value;
-(void)assertNumberProperty:(JSObjectRef)object property:(NSString*)name value:(double)value;

@end
