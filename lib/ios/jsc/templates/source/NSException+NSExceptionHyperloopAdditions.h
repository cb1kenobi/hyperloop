@import JavaScriptCore;

#define CHECK_EXCEPTION(ctx,ex) [NSException raiseJSException:ex context:ctx]

@interface NSException (NSExceptionHyperloopAdditions)

+ (void)raiseJSException:(JSValueRef)exception context:(JSContextRef)context;

@end