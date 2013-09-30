//
//  MDLCell.m
//  life
//
//  Created by Matt Langston on 9/25/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import "MDLCellView.h"

@interface MDLCellView ()

@property (nonatomic, assign, readwrite) MDLGameOfLifeState previousState;

@end

@implementation MDLCellView

//- (id)initWithFrame:(CGRect)frame
- (id)initWithCurrentState:(MDLGameOfLifeState)currentState {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        // Use Auto Layout.
        self.translatesAutoresizingMaskIntoConstraints = NO;
        
        // Set our width equal to our height so that we're square.
        [self addConstraint:[NSLayoutConstraint constraintWithItem:self
                                                         attribute:NSLayoutAttributeWidth
                                                         relatedBy:NSLayoutRelationEqual
                                                            toItem:self
                                                         attribute:NSLayoutAttributeHeight
                                                        multiplier:1
                                                          constant:0]
         ];
        
        // Set a min width of 1 and a max width of 10.
        [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"[self(<=10@800,>=1@800)]" options:0 metrics:nil views:NSDictionaryOfVariableBindings(self)]];
        
        _currentState  = currentState;
        _previousState = currentState;
        
        self.backgroundColor = [UIColor whiteColor];
        self.hidden          = _currentState == MDLGameOfLifeStateAlive ? NO : YES;
    }
    return self;
}

- (void) setCurrentState:(MDLGameOfLifeState)currentState {
    const MDLGameOfLifeState previousState = self.currentState;
    _currentState = currentState;
    if (self.previousState != self.currentState) {
        // The state has changed, so the view needs to be redrawn.
        self.hidden = _currentState == MDLGameOfLifeStateAlive ? NO : YES;
        [self setNeedsDisplay];
    }
    self.previousState = previousState;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
