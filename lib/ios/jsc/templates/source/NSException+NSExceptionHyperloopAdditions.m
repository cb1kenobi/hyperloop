#import "NSException+NSExceptionHyperloopAdditions.h"
#import "hyperloop.h"

@implementation NSException (NSExceptionHyperloopAdditions)

+ (void)raiseJSException:(JSValueRef)exception context:(JSContextRef)context
{

	if (exception != nil) {
		NSMutableDictionary *fields = [[@{
			@"name": @"HyperloopException",
			@"message": @"Uncaught Javascript exception",
			@"sourceURL": @"<file unknown>",
			@"line": @"<line unknown>",
			@"stack": @"<no stack trace>"
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
				}

				// free up the JSStringRef
				JSStringRelease(keyString);
			}

		// if it's now an object, try our best to stringify it
		} else {
			[fields setObject:HyperloopToNSString(context, exception) forKey:@"message"];
		}

		// let NSException raise the exception
		[self raise:@"HyperloopException" format:@"%@: %@ (%@:%@)\nstack\n-----\n%@\n",
			[fields objectForKey:@"name"],
			[fields objectForKey:@"message"],
			[fields objectForKey:@"sourceURL"],
			[fields objectForKey:@"line"],
			[fields objectForKey:@"stack"]
		];
	}
}

@end