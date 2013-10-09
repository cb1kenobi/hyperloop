//
//  MDLUniverseView.h
//  life
//
//  Created by Matt Langston on 9/29/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import <UIKit/UIKit.h>

@class MDLCellView;

@interface MDLUniverseView : UIView

@property (nonatomic, assign, readonly) NSUInteger numberOfRows;
@property (nonatomic, assign, readonly) NSUInteger numberOfColumns;

// Designated initializer.
- (instancetype)initWithNumberOfRows:(NSUInteger)numberOfRows numberOfColumns:(NSUInteger)numberOfColumns;

- (void)nextState;
- (void)randomizeStates;

- (IBAction)debugConstraints:(id)sender;

@end
