@import('Foundation/NSObject');
@import('Foundation/NSString');
@import('Foundation/NSLog');
@import('CoreGraphics/CGRectMake');

@import('UIKit/UIApplication');
@import('UIKit/UIWindow');
@import('UIKit/UIColor');
@import('UIKit/UIFont');
@import('UIKit/UILabel');
@import('UIKit/NSTextAlignmentCenter');

@import("CoreLocation/CLLocationManager");
@import("CoreLocation/CLLocation");
@import("CoreLocation/CLHeading");
@import("CoreLocation/kCLDistanceFilterNone");
@import("CoreLocation/kCLLocationAccuracyBest");


/*
 Create our simple UI.
 */
var win = UIApplication.sharedApplication().keyWindow,
	label = new UILabel();
//initWithRed:green:blue:alpha
label.textColor = UIColor.darkTextColor;
label.frame = CGRectMake(0, 0, 320, 320);
label.font = UIFont.systemFontOfSize(72);
label.textAlignment = NSTextAlignmentCenter;
label.text = NSString.stringWithUTF8String('Loading...');
win.addSubview(label);

/*
 Distance calculation.
 */
var lastLocation,
	totalMetersTraveled = 0;

function handleNewPosition(params) {
	var format = NSString.stringWithUTF8String('%@');
	NSLog(format, params);
	label.text = NSString.stringWithUTF8String('5');
	var locations = params && params.didUpdateLocations || [];
	for (var i = 0, iL = locations.length; i < iL; i++) {
		var location = locations[i];
		if (lastLocation) {
			totalMetersTraveled += location.distanceFromLocation(lastLocation);
		}
		lastLocation = location;
	}
	label.text = NSString.stringWithUTF8String('Traveled\n' + (totalMetersTraveled * 3.28084) + 'ft!');
}

/*
 Location manager hooks.
 */
var manager = new CLLocationManager();
manager.purpose = NSString.stringWithUTF8String('To track how far you have traveled, of course!');
manager.distanceFilter = kCLDistanceFilterNone;
manager.desiredAccuracy = kCLLocationAccuracyBest;
@class('LocDelegate', NSObject, [ 'CLLocationManagerDelegate' ], [
	{
		name: 'locationManager',
		returnType: 'void',
		arguments: [
			{type: 'CLLocationManager', name: 'locationManager'},
			{type: 'NSArray', name: 'didUpdateLocations'}
		],
		action: handleNewPosition
	}
]);
manager.delegate = new LocDelegate();

/*
 We're all set. Go for it!
 */
manager.startUpdatingLocation();
if (CLLocationManager.locationServicesEnabled()) {
	label.text = NSString.stringWithUTF8String('RUN!');
}
else {
	label.text = NSString.stringWithUTF8String('Please enable GPS for this app!');
}