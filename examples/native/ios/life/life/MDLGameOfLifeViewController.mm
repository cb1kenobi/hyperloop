//
//  MDLGameOfLifeViewController.m
//  life
//
//  Created by Matt Langston on 9/24/13.
//  Copyright (c) 2013 Appcelerator. All rights reserved.
//

#import "MDLGameOfLifeViewController.h"
#import "MDLUniverseView.h"

@interface MDLGameOfLifeViewController ()

@property (nonatomic, strong) MDLUniverseView* universeView;
@property (nonatomic, assign) NSTimeInterval   fps;
@property (nonatomic, strong) NSTimer*         timer;
@property (nonatomic, strong) UILabel*         fpsLabel;
@property (nonatomic, strong) UILabel*         numberOfGenerationsLabel;

@end

@implementation MDLGameOfLifeViewController

- (instancetype)initWithNumberOfRows:(NSUInteger)numberOfRows numberOfColumns:(NSUInteger)numberOfColumns timerBased:(BOOL)timerBased {
    self = [super init];
    if (self) {
        NSLog(@"initWithNumberOfRows:%d, numberOfColumns:%d timerBased:%@", numberOfRows, numberOfColumns, timerBased ? @"YES" : @"NO");
        _numberOfRows    = numberOfRows;
        _numberOfColumns = numberOfColumns;
        _timerBased      = timerBased;
    }
    return self;
}

- (void)loadView {
    const CGRect applicationFrame = [[UIScreen mainScreen] applicationFrame];
    NSLog(@"[UIScreen mainScreen] bounds] = %@", NSStringFromCGRect(applicationFrame));
    
    UIView *contentView = [[UIView alloc] initWithFrame:applicationFrame];
    contentView.translatesAutoresizingMaskIntoConstraints = NO;
    contentView.backgroundColor = [UIColor darkTextColor];
//    contentView.backgroundColor = [UIColor lightGrayColor];
    
    self.fpsLabel = [[UILabel alloc] initWithFrame:CGRectZero];
//    self.fpsLabel = [[UILabel alloc] init];
    self.fpsLabel.textColor = [UIColor whiteColor];
    self.fpsLabel.text = @"FPS: 0";
    [contentView addSubview:self.fpsLabel];
    
    self.universeView = [[MDLUniverseView alloc] initWithNumberOfRows:self.numberOfRows numberOfColumns:self.numberOfColumns];
    [contentView addSubview:self.universeView];

    // Auto Layout
    self.fpsLabel.translatesAutoresizingMaskIntoConstraints = NO;
    
    NSMutableDictionary *constraintDictionary = [NSMutableDictionary dictionary];
    constraintDictionary[@"fpsLabel"]     = self.fpsLabel;
    constraintDictionary[@"universeView"] = self.universeView;
    
    [contentView addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-[fpsLabel]"                  options:0 metrics:nil views:constraintDictionary]];
    [contentView addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-[universeView]-|"            options:0 metrics:nil views:constraintDictionary]];
    [contentView addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|-[fpsLabel]-[universeView]-|" options:0 metrics:nil views:constraintDictionary]];
    
    self.view = contentView;
}

//- (void)updateViewConstraints {
//    [self.view constraints];
//    [constraints removeAllObjects];
//    
//    [super updateViewConstraints];
//}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.

    [self.universeView randomizeStates];
    
    if (self.timerBased) {
		NSLog(@">>>>> Using NSTimer for render loop <<<<<");
        const NSTimeInterval timeInterval = 1.0 / 100.0;
        self.timer = [NSTimer scheduledTimerWithTimeInterval:timeInterval target:self selector:@selector(update:) userInfo:NULL repeats:YES];
    } else {
		NSLog(@">>>>> Using CADisplayLink for render loop <<<<<");
		CADisplayLink *displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(update:)];
		[displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
    }

    NSLog(@"self.view.frame = %@", NSStringFromCGRect(self.view.frame));
    for (NSLayoutConstraint *constraint in self.view.constraints) {
        NSLog(@"constraint = %@", constraint);
    }
}

- (void)update:(CADisplayLink *)sender {
//    NSLog(@"update: %f", sender.duration);
    self.fps = sender.frameInterval / sender.duration;
//    NSLog(@"self.universeView.frame = %@", NSStringFromCGRect(self.universeView.frame));
//    [self.universeView debugConstraints:self];
    [self.universeView nextState];
}

//-(NSTimeInterval)fps {
//    if (self.timerBased) {
//        _fps = fabs(1.0 / [self.lastTime timeIntervalSinceNow]);
//        self.lastTime = [NSDate date];
//    }
//    return _fps;
//}


- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.

    NSLog(@"didReceiveMemoryWarning");
}

@end
