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

+ (void)raiseJSException:(JSValueRef)exception context:(JSContextRef)context
{

	if (exception != nil) {
		int line = -1;
		NSMutableDictionary *fields = [[@{
			@"name": @"HyperloopException",
			@"message": @"Uncaught Javascript exception",
			@"sourceURL": @"<file unknown>",
			@"line": @"<line unknown>",
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
						line = [[fields objectForKey:@"line"] intValue];
					}
				}

				// free up the JSStringRef
				JSStringRelease(keyString);
			}

		// if it's not an object, try our best to stringify it
		} else {
			[fields setObject:HyperloopToNSString(context, exception) forKey:@"message"];
		}

		// create the source map and lib paths
		NSFileManager *fileManager = [NSFileManager defaultManager];
		NSString *mapDir = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:@"_map"];
		NSString *sourceMapPath = [mapDir stringByAppendingPathComponent:@"_source-map.js"];
		NSString *filePath = [NSString pathWithComponents:@[ mapDir,
			[ [fields objectForKey:@"sourceURL"] stringByAppendingString:@".map" ] ] ];

		// make sure we have a valid line number, and source map and lib exist
		if (line != -1 && [fileManager fileExistsAtPath:sourceMapPath] && [fileManager fileExistsAtPath:filePath]) {
			NSString *sourceMapSource = [NSString stringWithContentsOfFile:sourceMapPath encoding:NSUTF8StringEncoding error:nil];
			NSString *fileSource = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];

			// make sure we have the source map and lib source
			if (fileSource && sourceMapSource) {
				// TODO: Attempt to find column somewhere. Maybe we can extract it from the stack trace?
				NSString *script = [NSString stringWithFormat:
					@"%@;(new this.sourceMap.SourceMapConsumer(%@)).originalPositionFor({ line: %d, column: 0 });",
					sourceMapSource, fileSource, line
				];

				// execute the source map query via JS
				JSStringRef scriptRef = JSStringCreateWithUTF8CString([script UTF8String]);
				JSValueRef resultValue = JSEvaluateScript(context, scriptRef, NULL, NULL, 0, NULL);
				JSObjectRef resultObj = JSValueToObject(context, resultValue, NULL);
				JSStringRelease(scriptRef);

				// get an object from the result
				if (resultObj) {
					// Get raw JSON of source map data
					[fields setObject:HyperloopToNSStringFromString(context,
						JSValueCreateJSONString(context, resultValue, 0, NULL)) forKey:@"sourcemapQuery"];

					// Change the exception line number based on the source map property
					JSStringRef lineString = JSStringCreateWithUTF8CString([@"line" UTF8String]);
					JSValueRef lineRef = JSObjectGetProperty(context, resultObj, lineString, NULL);
					[fields setObject:HyperloopToNSString(context, lineRef) forKey:@"line"];
					JSStringRelease(lineString);

					// Change the exception sourceURL based on the source map property
					JSStringRef sourceUrlString = JSStringCreateWithUTF8CString([@"source" UTF8String]);
					JSValueRef sourceUrlRef = JSObjectGetProperty(context, resultObj, sourceUrlString, NULL);
					[fields setObject:HyperloopToNSString(context, sourceUrlRef) forKey:@"sourceURL"];
					JSStringRelease(sourceUrlString);
				}
			}
		}

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
}

@end