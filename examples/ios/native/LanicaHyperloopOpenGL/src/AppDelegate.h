//
//  AppDelegate.h
//  ___PROJECTNAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___YEAR___ ___ORGANIZATIONNAME___. All rights reserved.
//

#import <UIKit/UIKit.h>

@class ViewController;


@interface AppDelegate : NSObject <UIApplicationDelegate> {
    UIWindow *window;
    ViewController *rootViewController;
}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) ViewController *rootViewController;

@end

