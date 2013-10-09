//
//  MDLUniverseView.m
//  life
//
//  Created by Matt Langston on 9/29/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import "MDLUniverseView.h"
#import "MDLCellView.h"

@interface MDLUniverseView ()
//@property (nonatomic, copy, readonly) NSArray* cellMatrix;
@end

@implementation MDLUniverseView {
    NSMutableArray *cellConstraints;
    NSMutableArray *cellMatrix;
//    NSMapTable *cellToPositioningConstraints;
}

//- (id)initWithFrame:(CGRect)frame
- (instancetype)initWithNumberOfRows:(NSUInteger)numberOfRows numberOfColumns:(NSUInteger)numberOfColumns {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        NSLog(@"initWithNumberOfRows:%d, numberOfColumns:%d", numberOfRows, numberOfColumns);
        
        // Use Auto Layout.
        self.translatesAutoresizingMaskIntoConstraints = NO;
//        self.backgroundColor = [UIColor darkTextColor];
        self.backgroundColor = [UIColor lightGrayColor];

        cellConstraints = [[NSMutableArray alloc] init];
//        cellViews = [[NSMutableArray alloc] init];
        
        cellMatrix = [NSMutableArray arrayWithCapacity:numberOfRows];
        for (NSUInteger rowIndex = 0; rowIndex < numberOfRows; ++rowIndex) {
            NSMutableArray *cellRow = [NSMutableArray arrayWithCapacity:numberOfColumns];
            for (NSUInteger columnIndex = 0; columnIndex < numberOfColumns; ++columnIndex) {
                MDLCellView *cell = [[MDLCellView alloc] initWithCurrentState:MDLGameOfLifeStateAlive];
                [self addSubview:cell];
                cellRow[columnIndex] = cell;
            }
            cellMatrix[rowIndex] = [NSArray arrayWithArray:cellRow];
        }
        _numberOfRows    = numberOfRows;
        _numberOfColumns = numberOfColumns;

    }
    return self;
}

- (IBAction)debugConstraints:(id)sender {
    NSLog(@"MDLUniverseView = %@", NSStringFromCGRect(self.frame));
    for (NSUInteger rowIndex = 0; rowIndex < self.numberOfRows; ++rowIndex) {
        NSArray *cellRow = cellMatrix[rowIndex];
        for (NSUInteger columnIndex = 0; columnIndex < self.numberOfColumns; ++columnIndex) {
            MDLCellView *view = cellRow[columnIndex];
            NSLog(@"cell[%d, %d] = %@", rowIndex, columnIndex, NSStringFromCGRect(view.frame));
        }
    }
}

- (void) updateConstraints {
    [self removeConstraints:cellConstraints];
    [cellConstraints removeAllObjects];
    
    const NSUInteger firstRowIndex = 0;
    const NSUInteger lastRowIndex  = self.numberOfRows -1;
    
    const NSUInteger firstColumnIndex = 0;
    const NSUInteger lastColumnIndex  = self.numberOfColumns -1;
    
    for (NSUInteger rowIndex = firstRowIndex; rowIndex <= lastRowIndex; ++rowIndex) {
        NSArray *cellRow = cellMatrix[rowIndex];
        
        // Pin the first view in the row to the left edge of the superview.
        UIView *firstViewInRow = [cellRow firstObject];
        [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-[firstViewInRow]"
                                                                                     options:0
                                                                                     metrics:nil
                                                                                       views:NSDictionaryOfVariableBindings(firstViewInRow)]
         ];
        
        // Pin the last view in the row to the right edge of the superview.
        UIView *lastViewInRow = [cellRow lastObject];
        [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"H:[lastViewInRow]-|"
                                                                                     options:0
                                                                                     metrics:nil
                                                                                       views:NSDictionaryOfVariableBindings(lastViewInRow)]
         ];
        
        UIView *previousView = nil;
        for (NSUInteger columnIndex = firstColumnIndex; columnIndex <= lastColumnIndex; ++columnIndex) {
            UIView *view = cellRow[columnIndex];
            
            if (rowIndex == firstRowIndex) {
                // Pin every view in the first row to the top edge of the superview.
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-[view]"
                                                                                             options:0
                                                                                             metrics:nil
                                                                                               views:NSDictionaryOfVariableBindings(view)]
                 ];
            }
            
            if (rowIndex == lastRowIndex) {
                // Pin every view in the last row to the bottom edge of the superview.
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[view]-|"
                                                                                             options:0
                                                                                             metrics:nil
                                                                                               views:NSDictionaryOfVariableBindings(view)]
                 ];
            }
            
            if (rowIndex > firstRowIndex) {
                UIView *viewAbove = cellMatrix[rowIndex - 1][columnIndex];
                // Space out the views vertically and make them equal heights.
                NSDictionary *views = NSDictionaryOfVariableBindings(viewAbove, view);
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[viewAbove][view]"   options:0 metrics:nil views:views]];
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[viewAbove(==view)]" options:0 metrics:nil views:views]];
            }
            
            if (previousView) {
                // Space out the views horizontally and make them equal widths.
                NSDictionary *views = NSDictionaryOfVariableBindings(previousView, view);
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"H:[previousView][view]"   options:0 metrics:nil views:views]];
                [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"H:[previousView(==view)]" options:0 metrics:nil views:views]];
            }
            previousView = view;
        } // columnIndex
    } // rowIndex
    
    [self addConstraints:cellConstraints];

    [super updateConstraints];
}

- (void)nextState {
    for (NSUInteger rowIndex = 0; rowIndex < self.numberOfRows; ++rowIndex) {
        NSArray *cellRow = cellMatrix[rowIndex];
        for (NSUInteger columnIndex = 0; columnIndex < self.numberOfColumns; ++columnIndex) {
            MDLCellView *cell = cellRow[columnIndex];
            cell.currentState = [self nextStateForCellAtRowIndex:rowIndex columnIndex:columnIndex];
        }
    }
}

- (void)randomizeStates {
    [UIView beginAnimations:nil context:nil];
    
    for (NSUInteger rowIndex = 0; rowIndex < self.numberOfRows; ++rowIndex) {
        NSArray *cellRow = cellMatrix[rowIndex];
        for (NSUInteger columnIndex = 0; columnIndex < self.numberOfColumns; ++columnIndex) {
            // Determine whether or not this cell is alive.
            const BOOL alive = (arc4random() % 2 == 0);
            MDLCellView *cell = cellRow[columnIndex];
            cell.currentState = alive ? MDLGameOfLifeStateAlive : MDLGameOfLifeStateDead;
        }
    }
    
    [UIView commitAnimations];
}

// calculate the next state of each cell
- (MDLGameOfLifeState) nextStateForCellAtRowIndex:(CFIndex)r columnIndex:(CFIndex)c {
    NSParameterAssert(r >= 0);
    NSParameterAssert(r < self.numberOfRows);
    NSParameterAssert(c >= 0);
    NSParameterAssert(c < self.numberOfColumns);
    
    // The cell in question.
    MDLCellView const * const cell = cellMatrix[r][c];
    
	CFIndex nearestNeighborAliveCount = 0;
    
    // Iterate over the nearest neighbors of the cell at index {r, c}.
    for (CFIndex rowOffset = -1; rowOffset < 2; ++rowOffset) {
        // boundary condition.
        if (r == 0 && rowOffset == -1) {
            continue;
        }
        
        const CFIndex rowIndex = r + rowOffset;
        
        // boundary condition.
        if (rowIndex >= self.numberOfRows) {
            continue;
        }
        
        NSArray *cellRow = cellMatrix[rowIndex];
        
        for (CFIndex columnOffset = -1; columnOffset < 2; ++columnOffset) {
            // boundary condition.
            if (c == 0 && columnOffset == -1) {
                continue;
            }
            
            const CFIndex columnIndex = c + columnOffset;
            
            // boundary condition.
            if (columnIndex >= self.numberOfColumns) {
                continue;
            }
            
            // Skip the cell in question, since we only care abour it's nearest
            // neighbors.
            if (rowIndex == r && columnIndex == c) {
                continue;
            }
            
            MDLCellView const * const nearestNeighbor = cellRow[columnIndex];
            if (nearestNeighbor.previousState == MDLGameOfLifeStateAlive) {
                ++nearestNeighborAliveCount;
            }
        }
    }
    
    MDLGameOfLifeState nextState;
    
    switch (cell.previousState) {
        case MDLGameOfLifeStateAlive:
            if (nearestNeighborAliveCount < 2) {
                // Death due to under-population.
                nextState = MDLGameOfLifeStateDead;
                break;
            } else if (nearestNeighborAliveCount == 2 || nearestNeighborAliveCount == 3) {
                nextState = MDLGameOfLifeStateAlive;
                break;
            } else if (nearestNeighborAliveCount > 3) {
                // Death due to overcrowding.
                nextState = MDLGameOfLifeStateDead;
                break;
            } else {
                NSException* myException = [NSException
                                            exceptionWithName:@"LogicError"
                                            reason:[NSString stringWithFormat:@"Unhandled count %ld", nearestNeighborAliveCount]
                                            userInfo:nil];
                @throw myException;
            }
            break;
        case MDLGameOfLifeStateDead:
            if (nearestNeighborAliveCount == 3) {
                // Life due to reproduction.
                nextState = MDLGameOfLifeStateAlive;
                break;
            } else {
                nextState = MDLGameOfLifeStateDead;
                break;
            }
            
        default:
            NSException* myException = [NSException
                                        exceptionWithName:@"LogicError"
                                        reason:[NSString stringWithFormat:@"Unrecognized state %d", cell.previousState]
                                        userInfo:nil];
            @throw myException;
            break;
    }
    
    //NSLog(@"nextStateForCellAtRowIndex: %ld columnIndex:%ld = %@", r, c, nextState == MDLGameOfLifeStateAlive ? @"Alive" : @"Dead");
	return nextState;
}

/*

 //        [self hasAmbiguousLayout];
 //        [self exerciseAmbiguityInLayout];
 //        NSArray *constraintsAffectingLayoutForAxisHorizontal = [self constraintsAffectingLayoutForAxis:UILayoutConstraintAxisHorizontal];
 //        NSArray *constraintsAffectingLayoutForAxisVertical   = [self constraintsAffectingLayoutForAxis:UILayoutConstraintAxisVertical];
 
 //        CGRect alignmentRectForFrame = [self alignmentRectForFrame:[self frame]];
 //        CGRect frameForAlignmentRect = [self frameForAlignmentRect:alignmentRectForFrame];
 
 //        [self sizeToFit];
 //        CGSize randomSize;
 //        CGSize sizeThatFits = [self sizeThatFits:randomSize];
 
 //        CGSize intrinsicContentSize = [self intrinsicContentSize];
 
 // Compression Resistance: H:[button(>=120)]
 // Content Hugging:        H:[button(<=120)]
 //
 // Compression Resistance: V:[button(>=25)]
 // Content Hugging:        V:[button(<=25)]
 //
 // This is sufficient to unambiguously size the view!
 
 //        [self setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal];
 //        [self setContentCompressionResistancePriority:UILayoutPriorityDefaultHigh forAxis:UILayoutConstraintAxisHorizontal];
 
 
- (IBAction)debug:(id)sender {
    // Ambiguity.
    MDLCellView *cellView = cellViews[0];
    NSLog(@"%@", NSStringFromCGRect([cellView frame]));
    
    for (UIView *view in cellViews) {
        if ([view hasAmbiguousLayout]) {
            [view exerciseAmbiguityInLayout];
        }
    }
}

- (NSArray *)cellViews {
    return [cellViews copy];
}

- (void) addCellView:(MDLCellView *)view {
    NSUInteger idx = [cellViews indexOfObjectIdenticalTo:view];
    if (idx == NSNotFound) {
        [self addSubview:view];
        [cellViews addObject:view];
        
        // TODO
        //[view setEventHandler:self];
        
        // Reset our constraints.
        [self removeConstraints:cellConstraints];
        [cellConstraints removeAllObjects];
        [self setNeedsUpdateConstraints];
    }
}

- (void) removeCellView:(MDLCellView *)view {
    NSUInteger idx = [cellViews indexOfObjectIdenticalTo:view];
    if (idx != NSNotFound) {
        // TODO Couldn't see remainder of this method in video (just before
        // 8:18) so I'm just guessing below.
        [view removeFromSuperview];
        [cellViews removeObject:view];
        
        // TODO
        //[view setEventHandler:self];
        
        // Reset our constraints.
        [self removeConstraints:cellConstraints];
        [cellConstraints removeAllObjects];
        [self setNeedsUpdateConstraints];
    }
}

- (void) removeAllCellViews {
    for (UIView *view in cellViews) {
        [view removeFromSuperview];
    }
    [cellViews removeAllObjects];
    [self removeConstraints:cellConstraints];
    [self setNeedsUpdateConstraints];
}

- (void) updateConstraintsLetterContainer {
    // BEGIN: LetterContainer.m
    // Remove any lingering constraints.
    [self removeConstraints:cellConstraints];
    [cellConstraints removeAllObjects];
    
    [super updateConstraints];
    // END: LetterContainer.m
}

- (void) updateConstraintsLetterRack {
    // BEGIN: LetterRack.m
    [super updateConstraints];
    
    // Make sure we have at least one view.
    if ([cellViews count] == 0) {
        return;
    }
    
    // Pin the first view to the left edge.
    UIView *firstView = [cellViews objectAtIndex:0];
    [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"|-[firstView]"
                                                                                 options:0
                                                                                 metrics:nil
                                                                                   views:NSDictionaryOfVariableBindings(firstView)]
     ];
    
    // Pin the last view to the right edge, weakly.
    UIView *lastView = [cellViews lastObject];
    [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"[lastView]-(>=20@450)-|"
                                                                                 options:0
                                                                                 metrics:nil
                                                                                   views:NSDictionaryOfVariableBindings(lastView)]
     ];
    
    // Make a constraint that says that the first letter view is the same height
    // as the container, but weakly so.
    NSLayoutConstraint *weakHeightConstraint = [NSLayoutConstraint constraintWithItem:self
                                                                            attribute:NSLayoutAttributeHeight
                                                                            relatedBy:NSLayoutRelationEqual
                                                                               toItem:firstView
                                                                            attribute:NSLayoutAttributeHeight
                                                                           multiplier:1
                                                                             constant:20];
    [weakHeightConstraint setPriority:250];
    [cellConstraints addObject:weakHeightConstraint];
    
    // Pin all views to each other. Make them all equal width.
    UIView *previousView = nil;
    for (UIView *view in cellViews) {
        // Center the cell vertically in the container.
        NSLayoutConstraint *centerConstraint = [NSLayoutConstraint constraintWithItem:self
                                                                            attribute:NSLayoutAttributeCenterY
                                                                            relatedBy:NSLayoutRelationEqual
                                                                               toItem:view
                                                                            attribute:NSLayoutAttributeCenterY
                                                                           multiplier:1
                                                                             constant:0];
        [cellConstraints addObject:centerConstraint];
        
        if (previousView) {
            // Space out the views and make them equal widths.
            NSDictionary *views = NSDictionaryOfVariableBindings(previousView, view);
            [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"[previousView]-20-[view]" options:0 metrics:nil views:views]];
            [cellConstraints addObjectsFromArray:[NSLayoutConstraint constraintsWithVisualFormat:@"[previousView(==view)]"   options:0 metrics:nil views:views]];
        }
        previousView = view;
    }
    
    [self addConstraints:cellConstraints];
    // END: LetterRack.m
}
    
- (void) updateConstraintsLetterPile {
    // BEGIN: LetterPile.m
    [super updateConstraints];

    // Record the positioning constraints per view so we can adjust them later.
    cellToPositioningConstraints = [NSMapTable strongToStrongObjectsMapTable];
    
    // All the views are size 64.
    for (UIView *view in cellViews) {
        [cellConstraints addObject:[NSLayoutConstraint constraintWithItem:view
                                                                attribute:NSLayoutAttributeWidth
                                                                relatedBy:NSLayoutRelationEqual
                                                                   toItem:nil
                                                                attribute:NSLayoutAttributeNotAnAttribute
                                                               multiplier:0
                                                                 constant:64]
         ];
    }

    for (MDLCellView *view in cellViews) {
        // Pick coordinates for this cell view if we haven't done it yet.
        if (CGPointEqualToPoint(CGPointZero, view.locationInPile)) {
            CGFloat radius = (256.0      * arc4random()) / UINT32_MAX;
            CGFloat angle  = (2.0 * M_PI * arc4random()) / UINT32_MAX;
            view.locationInPile = CGPointMake(radius * cos(angle), radius * sin(angle));
        }
        
        // Add constraints with that positioning.
        NSArray *positioningConstraints = @[
                                            [NSLayoutConstraint constraintWithItem:view
                                                                         attribute:NSLayoutAttributeCenterX
                                                                         relatedBy:NSLayoutRelationEqual
                                                                            toItem:self attribute:NSLayoutAttributeCenterX
                                                                        multiplier:1
                                                                          constant:view.locationInPile.x],
                                            [NSLayoutConstraint constraintWithItem:view
                                                                         attribute:NSLayoutAttributeCenterY
                                                                         relatedBy:NSLayoutRelationEqual
                                                                            toItem:self attribute:NSLayoutAttributeCenterY
                                                                        multiplier:1
                                                                          constant:view.locationInPile.y]
                                            ];
    }
    // ...
    
    // END: LetterPile.m
}
*/

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
