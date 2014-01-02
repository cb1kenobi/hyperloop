/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import "HyperloopApp.h"
#import "AppDelegate.h"
#import <JavaScriptCore/JavaScriptCore.h>

#ifndef HL_DISABLE_CRASH
#import <KSCrash/KSCrash.h>
#import <KSCrash/KSCrashAdvanced.h>
#import <KSCrash/KSCrashInstallationVictory.h>
#endif

// WARNING: this file is generated and will be overwritten
// Generated on <%=new Date%>

extern "C" JSGlobalContextRef HyperloopCreateVM(NSString *name, NSString *prefix);
extern "C" id HyperloopGetPrivateObjectAsID(JSObjectRef objectRef);

@implementation HyperloopApp {
 	JSGlobalContextRef context;
 	UIWindow *window;
 	id<UIApplicationDelegate> mydelegate;
}

@synthesize window=window;
@synthesize mydelegate=mydelegate;

-(id)init
{
	if (self = [super init])
	{		
#ifndef HL_DISABLE_CRASH
		// Takanshi error reporting server.
		// (A Python open source project. It runs on Google App Engine)
		// https://github.com/kelp404/Victory
		//
		// FIXME: currently, this is just for testing.  we will replace with AppC backend
		// and also allow it to be configurable in the future (before release);
		#define kVictoryURL [NSURL URLWithString:@"https://victory-demo.appspot.com/api/v1/crash/3223dc8f-6e7f-4589-9e53-4592529230d1"]
		[KSCrash sharedInstance].printTraceToStdout = YES;
		KSCrashInstallationVictory* installation = [KSCrashInstallationVictory sharedInstance];
		installation.url = kVictoryURL;
		[installation addConditionalAlertWithTitle:@"Crash Detected"
                                     message:@"The app crashed last time it was launched. Send a crash report?"
                                   yesAnswer:@"Sure!"
                                    noAnswer:@"No thanks"];

		[installation install];
	    NSLog(@"[DEBUG] crash reporting installed, sending reports to %@",kVictoryURL);

	    // report any crashes before starting up
		[installation sendAllReportsWithCompletion:^(NSArray *filteredReports, BOOL completed, NSError *error)
		{
#endif
		    // setup the root window and root view controller
		    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
		    self.window.backgroundColor = [UIColor whiteColor];
		    self.window.rootViewController = [[UIViewController alloc] init];
		    [self.window makeKeyAndVisible];

		    // create the virtual machine
		    context = HyperloopCreateVM(@"./<%=main_js%>",@"<%=prefix%>");
		    if (context==NULL)
		    {
		        NSLog(@"[ERROR] Application '<%=main_js%>' (<%=prefix%>) not loaded. Make sure that you have the appropriately built library");
		        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: @"Application Error"
		            message: @"Could not load your application."
		            delegate: nil
		            cancelButtonTitle:@"OK"
		            otherButtonTitles:nil];
		        [alert show];
		    }

	<% if (appdelegate!=='AppDelegate') { -%>
			// we must call through JS since the compiled code has the embedded / compiled functions in it
	        JSObjectRef global = JSContextGetGlobalObject(context);
	        JSStringRef script = JSStringCreateWithUTF8CString("<%=appdelegate%>()");
	        JSValueRef value = JSEvaluateScript(context, script, global, NULL, 0, 0);
	        JSObjectRef obj = JSValueToObject(context,value,0);
	        JSStringRelease(script);

	        // we are going to make strong reference to hold the pointer
	        self.mydelegate = (id<UIApplicationDelegate>)HyperloopGetPrivateObjectAsID(obj);
	<% } -%>
#ifndef HL_DISABLE_CRASH
		 }];
#endif
	}
	return self;
}

<% if (appdelegate!=='AppDelegate') { -%>
-(void)setDelegate:(id<UIApplicationDelegate>) delegate
{
	// this happens because of the main setup of the AppDelegate
	// in which case, we override and install our own here
	// this is only compiled in code when we have a special app delegate
	// that overrides the default
	if ([delegate isKindOfClass:[AppDelegate class]])
	{
		delegate = self.mydelegate;
	}
	[super setDelegate:delegate];
}
<% } -%>

-(void)dealloc
{
	if (context!=NULL)
	{
		JSGlobalContextRelease(context);
		context = NULL;
	}
	[self.mydelegate release];
	self.mydelegate = nil;
	[self.window release];
	self.window = nil;
	[super dealloc];
}

@end
