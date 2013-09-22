/**
 * test for iOS Binding generation code
 */
var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    binding = require(path.join(__dirname,'..','..','lib','ios','jsc_oo','codegen.js')),
    buildlib = require(path.join(__dirname,'..','..','lib','ios','buildlib.js')),
    clangparser = require(path.join(__dirname,'..','..','lib','ios','clangparser.js')),
    genmetadata = require('./metadata'),
    metadata;

function shouldBeType(n,t,expect) {
    var result = binding.toValue(metadata,{name:n,type:t,subtype:t});
    result.should.be.a('string');
    result.should.equal(expect);
}

function shouldBeNumberType(t,numType,cast,cvalue) {
    var n = 'o',
        result = binding.toValue(metadata,{name:n,type:t,subtype:t}),
        cvalue = cvalue || t,
        cvalue = cast ? '('+cvalue+')' : '';
    result.should.be.a('string');
    result.should.equal('[NSNumber numberWith'+numType+':'+cvalue+n+']');
}

function shouldBeValueType(t, type) {
    delete metadata.generate; // clean up before generation
    var n = 'o',
        result = binding.toValue(metadata,{name:n,type:t,subtype:t});
    result.should.be.a('string');
    result.should.equal('[JSValue valueWith'+type+':'+n+' inContext:[JSContext currentContext]]');
}

function shouldBeEqual(n,t,eq) {
    var result = binding.toValue(metadata,{name:n,type:t,subtype:t});
    result.should.be.a('string');
    result.should.equal(eq);
}

function shouldBeSame(t) {
    return shouldBeType('o',t,'o');
}

describe("ios bindings",function(){
	
	before(function(done){

		genmetadata.getMetadata(function(err,m){
			if (err) return done(err);
			metadata = m;
			done();
		});

	});

	it("should exist",function(){
		should.exist(binding);
	});

	it("should makeBinding exist",function(){
		should.exist(binding.toValue);
	});

	it("should id be valid binding",function(){
		shouldBeSame('id');
	});
    
	it("should NSNull be valid binding",function(){
		shouldBeSame('NSNull');
	});
    
	it("should NSString be valid binding",function(){
		shouldBeSame('NSString');
	});
    
	it("should NSString* be valid binding",function(){
		shouldBeSame('NSString*');
	});

	it("should NSString * be valid binding",function(){
		shouldBeSame('NSString *');
	});

	it("should NSMutableString be valid binding",function(){
		shouldBeSame('NSMutableString');
	});

    it("should NSNumber be valid binding",function(){
		shouldBeSame('NSNumber');
	});

    it("should NSArray be valid binding",function(){
		shouldBeSame('NSArray');
	});

    it("should NSMutableArray be valid binding",function(){
		shouldBeSame('NSMutableArray');
	});

    it("should NSDictionary be valid binding",function(){
		shouldBeSame('NSDictionary');
	});

    it("should NSMutableDictionary be valid binding",function(){
		shouldBeSame('NSMutableDictionary');
	});

    it("should NSDate be valid binding",function(){
		shouldBeSame('NSDate');
	});

	it("should NSBlock be valid binding",function(){
		shouldBeSame('NSBlock');
	});

	it("should Class be valid binding",function(){
		shouldBeSame('Class');
	});

/*
	it("should Unknown be valid binding",function(){
        shouldBeValueType('Unknown *','Unknown');
	});

	it("should Unknown2 be valid binding",function(){
        shouldBeValueType('Unknown2 *','Unknown2');
	});
*/

    it("should UIView be valid binding",function(){
        shouldBeSame('UIView','UIView');
	});

	it("should void be valid binding",function(){
		shouldBeEqual('o','void','');
	});

    it("should CFTypeID be valid binding",function(){
		shouldBeNumberType('CFTypeID','UnsignedLong',true,'unsigned long');
	});

    it("should CFOptionFlags be valid binding",function(){
		shouldBeNumberType('CFOptionFlags','UnsignedLong',true,'unsigned long');
	});

    it("should CFHashCode be valid binding",function(){
		shouldBeNumberType('CFHashCode','UnsignedLong',true,'unsigned long');
	});

    it("should CFIndex be valid binding",function(){
		shouldBeNumberType('CFIndex','SignedLong',true,'signed long');
	});

    it("should float be valid binding",function(){
		shouldBeNumberType('float','Float',true);
	});

	it("should double be valid binding",function(){
		shouldBeNumberType('double','Double',true);
	});

	it("should long be valid binding",function(){
		shouldBeNumberType('long','Long',true);
	});

	it("should long long be valid binding",function(){
		shouldBeNumberType('long long','LongLong',true);
	});

    it("should short be valid binding",function(){
		shouldBeNumberType('short','Short',true);
	});

	it("should bool be valid binding",function(){
		shouldBeNumberType('bool','Bool',true);
	});

	it("should char be valid binding",function(){
		shouldBeNumberType('char','Char',true);
	});

	it("should int be valid binding",function(){
		shouldBeNumberType('int','Int',true);
	});

	it("should unsigned int be valid binding",function(){
		shouldBeNumberType('unsigned int','UnsignedInt',true);
	});

	it("should unsigned long be valid binding",function(){
		shouldBeNumberType('unsigned long','UnsignedLong',true);
	});

	it("should unsigned long long be valid binding",function(){
		shouldBeNumberType('unsigned long long','UnsignedLongLong',true);
	});

	it("should unsigned short be valid binding",function(){
		shouldBeNumberType('unsigned short','UnsignedShort',true);
	});

	it("should unsigned char be valid binding",function(){
		shouldBeNumberType('unsigned char','UnsignedChar',true);
	});

	it("should signed int be valid binding",function(){
		shouldBeNumberType('signed int','Int',true);
	});

	it("should signed long be valid binding",function(){
		shouldBeNumberType('signed long','Long',true);
	});

	it("should signed long long be valid binding",function(){
		shouldBeNumberType('signed long long','LongLong',true);
	});

	it("should signed short be valid binding",function(){
		shouldBeNumberType('signed short','Short',true);
	});

	it("should signed char be valid binding",function(){
		shouldBeNumberType('signed char','Char',true);
	});

	it("should char* be valid binding",function(){
		shouldBeType('o','char*','[NSString stringWithUTF8String:o]');
	});

	it("should CFStringRef be valid binding",function(){
		shouldBeType('o','CFStringRef','(__bridge id)o');
	});

	it("should CGFloat be valid binding",function(){
		shouldBeNumberType('CGFloat','Float');
	});
    
	it("should NSInteger be valid binding",function(){
		shouldBeNumberType('NSInteger','Integer');
	});

	it("should NSUInteger be valid binding",function(){
		shouldBeNumberType('NSUInteger','UnsignedInteger');
	});
    
	it("should NSTimeInterval be valid binding",function(){
		shouldBeNumberType('NSTimeInterval','Double');
	});
    
	it("should CGSize be valid binding",function(){
		shouldBeValueType('CGSize','Size');
	});

	it("should CGRect be valid binding",function(){
		shouldBeValueType('CGRect','Rect');
	});

	it("should CGPoint be valid binding",function(){
		shouldBeValueType('CGPoint','Point');
	});
	
    it("should NSRange be valid binding",function(){
		shouldBeValueType('NSRange','Range');
	});

    it("should int32_t be valid binding",function(){
		shouldBeValueType('int32_t','Int32');
	});
        
    it("should uint32_t be valid binding",function(){
		shouldBeValueType('uint32_t','UInt32');
	});
    
    it("should CVTime be not implemented binding",function() {
        shouldBeEqual('o','CVTime','//FIXME: CVTime not yet implemented for o');
    });

});
