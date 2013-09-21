@import('Foundation/NSObject');
@import('Foundation/NSString');
@import('Foundation/NSLog');
@import('CoreGraphics/CGRectMake');

@import('UIKit/UIApplication');
@import('UIKit/UIWindow');
@import('UIKit/UIColor');
@import('UIKit/UIFont');
@import('UIKit/UILabel');
@import('UIKit/UILineBreakModeWordWrap');
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
label.frame = CGRectMake(20, 20, 280, 280);
label.font = UIFont.systemFontOfSize(72);
label.textAlignment = NSTextAlignmentCenter;
label.text = NSString.stringWithUTF8String('Loading...');
label.numberOfLines = 2;
label.lineBreakMode = UILineBreakModeWordWrap;
win.addSubview(label);

/*
 Distance calculation.
 */
var lastLocation,
	totalFeetTraveled = 0;

function handleNewPosition(params) {
	var locations = params.didUpdateLocations;
	for (var i = 0, iL = locations.count(); i < iL; i++) {
		var location = locations.objectAtIndex(i),
			coordinate = location.coordinate;
		console.log(location);
		if (lastLocation) {
			var lat1 = lastLocation.latitude, lon1 = lastLocation.longitude;
			var lat2 = coordinate.latitude, lon2 = coordinate.longitude;
			var kmTraveled = 3963.0 * Math.acos(
				Math.sin(lat1 / 57.2958) * Math.sin(lat2 / 57.2958)
					+ Math.cos(lat1 / 57.2958) * Math.cos(lat2 / 57.2958)
					* Math.cos(lon2 / 57.2958 - lon1 / 57.2958)
			);
			totalFeetTraveled += kmTraveled * 3280.8399;
			label.text = NSString.stringWithUTF8String('Traveled ' + totalFeetTraveled + 'ft!');
		}
		lastLocation = location.coordinate;
	}
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
var locationDelegate = new LocDelegate();
manager.delegate = locationDelegate;
@owner(manager,locationDelegate);

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