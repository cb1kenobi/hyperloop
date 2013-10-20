/**
 * Appcelerator Titanium is Copyright (c) 2009-2013 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 *
 * This is a generated file
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

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"<%=guid%>";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"<%=moduleid%>";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
    
    KrollContext *kroll = [[self executionContext] krollContext];
    TiGlobalContextRef globalContext = [kroll context];
    HyperloopRunInVM(globalContext,@"./<%=app%>",@"<%=prefix%>",^(HyperloopJS* module){
        NSLog(@"[DEBUG] module <%=app%> loaded = %@",module);
    });
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably
	
	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
	// release any resources that have been retained by the module
	[super dealloc];
}


@end
