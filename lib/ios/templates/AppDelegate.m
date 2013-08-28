#import "AppDelegate.h"
#import <zlib.h>


NSData* decompressBuffer (NSData*  _data) {
    
    NSUInteger dataLength = [_data length];
    NSUInteger halfLength = dataLength / 2;
    
#ifdef DEBUG_COMPRESS
    NSLog(@"decompress called with %d bytes",dataLength);
#endif
    
    NSMutableData *decompressed = [NSMutableData dataWithLength: dataLength + halfLength];
    BOOL done = NO;
    int status;
    
    z_stream strm;
    strm.next_in = (Bytef *)[_data bytes];
    strm.avail_in = (uInt)dataLength;
    strm.total_out = 0;
    strm.zalloc = Z_NULL;
    strm.zfree = Z_NULL;
    
    // inflateInit2 knows how to deal with gzip format
    if (inflateInit2(&strm, (15+32)) != Z_OK)
    {
#ifdef DEBUG_COMPRESS
        NSLog(@"decompress inflateInit2 failed");
#endif
        return nil;
    }
    
    while (!done)
    {
        // extend decompressed if too short
        if (strm.total_out >= [decompressed length])
        {
            [decompressed increaseLengthBy: halfLength];
        }
        
        strm.next_out = [decompressed mutableBytes] + strm.total_out;
        strm.avail_out = (uInt)[decompressed length] - (uInt)strm.total_out;
        
        // Inflate another chunk.
        status = inflate (&strm, Z_SYNC_FLUSH);
        
        if (status == Z_STREAM_END)
        {
            done = YES;
        }
        else if (status != Z_OK)
        {
            break;
        }
    }
    
    if (inflateEnd (&strm) != Z_OK || !done)
    {
#ifdef DEBUG_COMPRESS
        NSLog(@"decompress inflateEnd failed");
#endif
        return nil;
    }
    
    // set actual length
    [decompressed setLength:strm.total_out];
    
#ifdef DEBUG_COMPRESS
    NSLog(@"decompress returning %ld bytes",strm.total_out);
#endif
    return decompressed;
}

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    JSVirtualMachine *vm = [[JSVirtualMachine alloc] init];
    self.context = [[JSContext alloc] initWithVirtualMachine:vm];
    
    // setup the root window and root view controller
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    self.window.backgroundColor = [UIColor whiteColor];
    self.window.rootViewController = [[UIViewController alloc] init];
    [self.window makeKeyAndVisible];

    // load our application
    Class cls = NSClassFromString(@"<%=main_js%>");
    [cls performSelector:NSSelectorFromString(@"load:") withObject:self.context];

    return YES;
}

@end
