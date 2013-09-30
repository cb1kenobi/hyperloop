//
//  MDLGameOfLifeViewController.h
//  life
//
//  Created by Matt Langston on 9/24/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MDLGameOfLifeViewController : UIViewController

@property (nonatomic, assign, readonly) NSUInteger numberOfRows;
@property (nonatomic, assign, readonly) NSUInteger numberOfColumns;
@property (nonatomic, assign, readonly, getter=isTimerBased) BOOL timerBased;

// Designated initializer.
// Designated initializer.
- (instancetype)initWithNumberOfRows:(NSUInteger)numberOfRows numberOfColumns:(NSUInteger)numberOfColumns timerBased:(BOOL)timerBased;

@end
