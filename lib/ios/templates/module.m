/**
 * Appcelerator Titanium is Copyright (c) 2009-2013 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 *
 * This is a generated file and any changes will be overwritten.
 */
#import "<%=modulename%>.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@interface HyperloopJS : NSObject
@property (nonatomic, copy) NSString *id;
@property (nonatomic, copy) NSString *filename;
@property (nonatomic, readwrite) BOOL loaded;
@property (nonatomic, retain) HyperloopJS *parent;
@property (nonatomic, assign) TiObjectRef exports;
@property (nonatomic, assign) TiContextRef context;
@property (nonatomic, copy) NSString *prefix;
@end

extern void HyperloopRunInVM (TiGlobalContextRef globalContextRef, NSString *name, NSString *prefix, void(^completionHandler)(HyperloopJS*));

@implementation <%=modulename%>

#pragma mark Internal

-(id)moduleGUID
{
	return @"<%=guid%>";
}

-(NSString*)moduleId
{
	return @"<%=moduleid%>";
}

#pragma mark Lifecycle

-(void)startup
{
	[super startup];

	KrollContext *kroll = [[self executionContext] krollContext];
	TiGlobalContextRef globalContext = [kroll context];

	// run the hyperloop module in the global context of kroll
	HyperloopRunInVM(globalContext,@"./<%=app%>",@"<%=prefix%>",^(HyperloopJS* module){
		NSLog(@"[DEBUG] module <%=app%> loaded = %@",module);
	});
}

-(void)shutdown:(id)sender
{
	[super shutdown:sender];
}

@end
