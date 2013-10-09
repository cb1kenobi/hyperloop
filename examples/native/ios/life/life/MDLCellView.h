//
//  MDLCell.h
//  life
//
//  Created by Matt Langston on 9/25/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, MDLGameOfLifeState) {
    MDLGameOfLifeStateAlive,
    MDLGameOfLifeStateDead
};

@interface MDLCellView : UIView

@property (nonatomic, assign, readwrite) MDLGameOfLifeState currentState;
@property (nonatomic, assign, readonly)  MDLGameOfLifeState previousState;

// TODO Only for video.
@property (nonatomic)  CGPoint locationInPile;;

// Designated initializer.
//- (id)initWithFrame:(CGRect)frame;
- (id)initWithCurrentState:(MDLGameOfLifeState)currentState;

@end
