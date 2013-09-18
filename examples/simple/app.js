
@import('UIKit/UIApplication');
@import('UIKit/UIWindow');
@import('UIKit/UIColor');
@import('UIKit/UIViewController');
@import('UIKit/UIScreen');
@import('UIKit/UIView');
@import('UIKit/UIButton');

@import('Foundation/NSLog');
@import('Foundation/NSString');
@import('CoreGraphics/CGRectMake');
@import('UIKit/UIButtonTypeSystem');
@import('UIKit/UIControlStateNormal');
@import('UIKit/UIControlEventTouchDown');

// @compiler({
// 	cflags: ['-DDEBUG=1']
// });

//require('test/foo');

var keyWindow = UIApplication.sharedApplication().keyWindow;

keyWindow.backgroundColor = UIColor.blackColor();

var view = new UIView();
view.frame = CGRectMake(0,0,200,200);
view.backgroundColor = UIColor.blueColor();

keyWindow.addSubview(view);
/*
var callback = @callback(function(sender) {
	NSLog('clicked on button=%@',sender);
});

var btn = UIButton.buttonWithType(UIButtonTypeSystem);
btn.setTitle("Hello",UIControlStateNormal);
btn.frame = CGRectMake(20,300,100,30);
btn.backgroundColor = UIColor.redColor();
keyWindow.addSubview(btn);
btn.addTarget(callback,callback.selector(),UIControlEventTouchDown);

*/