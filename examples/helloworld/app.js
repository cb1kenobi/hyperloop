@import("Foundation/NSLog");
@import("Foundation/NSString");

// create a NSString from JS string
var format = NSString.stringWithUTF8String('Hello %@');

// create a direct memory buffer
var buffer = @memory();

// write a string into the buffer
buffer.putString('world');

// create an NSString from the buffer
var message = NSString.stringWithUTF8String(buffer);

// log
NSLog(format,message);

