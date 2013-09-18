@import("CoreLocation/CLLocationManager");
@import("UIKit/UIApplication");
@import("Foundation/NSLog");
@import("Foundation/NSString");

var format = NSString.stringWithUTF8String('Type: %@');

// - (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations

@class('LocDelegate', NSObject, [ 'CLLocationManagerDelegate' ], [
	{
		name: 'locationManager',
		returnType: 'void',
		arguments: [
			{type:'CLLocationManager',name:'manager'},
			{type:'NSArray',name:'didUpdateLocations'}
		],
		action: function(params) {
			NSLog(format, 'locationServices WIN!');
		}
	}
]);



var manager = new CLLocationManager();
manager.delegate = new LocDelegate();
manager.startUpdatingLocation();

if (CLLocationManager.locationServicesEnabled()) {
	NSLog(format, 'locationServices ENABLED!');
}
else {
	NSLog(format, 'locationServices DISABLED!');
}