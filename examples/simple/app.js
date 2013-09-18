@import('Foundation/NSObject');
@import('Foundation/NSLog');
@import('Foundation/NSString');
@import('Foundation/NSSelectorFromString');

@import('UIKit/UIApplication');
@import('UIKit/UIWindow');
@import('UIKit/UIColor');
@import('UIKit/UIViewController');
@import('UIKit/UIScreen');
@import('UIKit/UIView');
@import('UIKit/UIButton');
@import('UIKit/UIButtonTypeSystem');
@import('UIKit/UIControlStateNormal');
@import('UIKit/UIControlEventTouchDown');
@import('UIKit/UIGestureRecognizerDelegate');
@import('UIKit/UIPanGestureRecognizer');
@import('UIKit/UIGestureRecognizerStateBegan');
@import('UIKit/UIGestureRecognizerStateChanged');

@import('CoreGraphics/CGRectMake');
@import('CoreGraphics/CGPointMake');
@import('CoreGraphics/CGPointZero');


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
var format = NSString.stringWithUTF8String('%@');

function adjustAnchorPointForGestureRecognizer(gview, gestureRecognizer)
{
    if (gestureRecognizer.state == UIGestureRecognizerStateBegan) {
        var locationInView = gestureRecognizer.locationInView(gview),
        	locationInSuperview = gestureRecognizer.locationInView(gview.superview);

        gview.layer.anchorPoint = CGPointMake(locationInView.x / view.bounds.size.width, locationInView.y / view.bounds.size.height);
        gview.center = locationInSuperview;
    }
}

@class('PanGestureRecognizer', NSObject, [], [
	{
		name: 'panView',
		returnType: 'void',
		arguments: [{type:'UIPanGestureRecognizer',name:'gestureRecognizer'}],
		action: function(params) {
			var gestureRecognizer = params.gestureRecognizer,
				state = gestureRecognizer.state;
			if (state == UIGestureRecognizerStateBegan || 
				state == UIGestureRecognizerStateChanged)
			{
				var gview = gestureRecognizer.view;
				adjustAnchorPointForGestureRecognizer(view,gestureRecognizer);
				var translation = gestureRecognizer.translationInView(gview.superview);
				gview.center = CGPointMake(gview.center.x + translation.x, gview.center.y + translation.y);
				gestureRecognizer.setTranslation(CGPointZero,gview.superview);
			}
		}
	}
]);


var panGestureRecognizerDelegate = new PanGestureRecognizer(),
	aobj = UIPanGestureRecognizer.alloc(),
	panGestureRecognizer = aobj.initWithTarget(panGestureRecognizerDelegate,'panView:');

view.addGestureRecognizer(panGestureRecognizer);
keyWindow.addSubview(view);

