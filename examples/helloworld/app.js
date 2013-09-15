@import("Foundation/NSLog");
@import("Foundation/NSString");


var s1 = NSString.stringWithUTF8String('Hello %@'),
	s2 = NSString.stringWithUTF8String('world');

NSLog(s1,s2);

