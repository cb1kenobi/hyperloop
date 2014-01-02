/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

#import "NSException+NSExceptionHyperloopAdditions.h"
#import "hyperloop.h"

@implementation NSException (NSExceptionHyperloopAdditions)

+ (void)raiseJSException:(JSValueRef)exception context:(JSContextRef)context prefix:(NSString*)prefix
{
#ifdef DEBUGEXCEPTION
	NSLog(@"[ERROR] raiseJSException called %p",exception);
	NSLog(@"[ERROR] %@",HyperloopToNSString(context,exception));
	NSLog(@"[ERROR] %@", [NSThread callStackSymbols]);
#endif
	
	NSString *line = @"-1";
	NSString *column = nil;
	NSMutableDictionary *fields = [[@{
		@"name": @"HyperloopException",
		@"message": @"Uncaught Javascript exception",
		@"sourceURL": @"<file unknown>",
		@"line": @"<line unknown>",
		@"column": @"<column unknown",
		@"stack": @"<no stack trace>",
		@"rawException": HyperloopToNSStringFromString(context,
			JSValueCreateJSONString(context, exception, 0, NULL)),
		@"sourcemapQuery": @"<no source map data>"
	} mutableCopy] autorelease];

	// make sure we actually have an object for the exception
	if (JSValueIsObject(context, exception)) {
		JSObjectRef exObject = JSValueToObject(context, exception, NULL);

		// iterate through all keys we're interested in
		for (NSString *key in [fields allKeys]) {
			JSStringRef keyString = JSStringCreateWithUTF8CString([key UTF8String]);

			// if we find the key on the JSObject, set it on the fields dictionary
			if (JSObjectHasProperty(context, exObject, keyString)) {
				JSValueRef prop = JSObjectGetProperty(context, exObject, keyString, NULL);
				[fields setObject:HyperloopToNSString(context, prop) forKey:key];
				if ([key isEqualToString:@"line"]) {
					line = [fields objectForKey:@"line"];
				}
				else if ([key isEqualToString:@"column"]) {
					column = [fields objectForKey:@"column"];
				}
			}

			// free up the JSStringRef
			JSStringRelease(keyString);
		}

	// if it's not an object, try our best to stringify it
	} else {
		[fields setObject:HyperloopToNSString(context, exception) forKey:@"message"];
	}

	NSString *sourceURL = [fields objectForKey:@"sourceURL"];
	if ([sourceURL hasPrefix:@"./"]) 
	{
		sourceURL = [sourceURL substringFromIndex:2];
	}
	sourceURL = [sourceURL stringByReplacingOccurrencesOfString:@".js" withString:@""];

	// fetch the source map details
    NSDictionary *sourceMap = HyperloopSourceMap(context,prefix,sourceURL,line,column); 
    // merge in the source map details
    [fields addEntriesFromDictionary:sourceMap];

	// format the stack
	NSString *stack = [fields objectForKey:@"stack"];
	NSMutableArray *stackLines = [NSMutableArray arrayWithArray:[stack componentsSeparatedByString:@"\n"]];
	for (int i = 0; i < [stackLines count]; i++) {
		[stackLines replaceObjectAtIndex:i withObject:
			[NSString stringWithFormat:@"    %@ (generated)", [stackLines objectAtIndex:i]]];
	}
	[fields setObject:[stackLines componentsJoinedByString:@"\n"] forKey:@"stack"];

	// let NSException raise the exception
	[self raise:@"HyperloopException" format:@"%@: %@\n\n%@:%@\n%@\n\nRAW EXCEPTION: %@\nSOURCEMAP RESULT: %@\n",
		[fields objectForKey:@"name"],
		[fields objectForKey:@"message"],
		[fields objectForKey:@"sourceURL"],
		[fields objectForKey:@"line"],
		[fields objectForKey:@"stack"],
		[fields objectForKey:@"rawException"],
		[fields objectForKey:@"sourcemapQuery"]
	];
}

@end