/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */

// WARNING: this file is generated and will be overwritten
// Generated on <%=new Date%>

#import "AppDelegate.h"
@import Foundation;
@import JavaScriptCore;

extern JSContextRef HyperloopCreateVM(NSString *name);

@implementation AppDelegate {
	JSContextRef context;
}


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // setup the root window and root view controller
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    self.window.backgroundColor = [UIColor whiteColor];
    self.window.rootViewController = [[UIViewController alloc] init];
    [self.window makeKeyAndVisible];

    // create the virtual machine
    context = HyperloopCreateVM(@"<%=main_js%>");
    if (context==NULL)
    {
        NSLog(@"[ERROR] Application '<%=main_js%>' not loaded. Make sure that you have the appropriately built library");
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: @"Application Error"
            message: @"Could not load your application."
            delegate: nil
            cancelButtonTitle:@"OK"
            otherButtonTitles:nil];
        [alert show];
    }

    return YES;
}

@end
