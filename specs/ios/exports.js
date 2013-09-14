/**
 * test for iOS exports generation code
 */
var should = require('should'),
    path = require('path'),
    binding = require(path.join(__dirname,'..','..','lib','ios','jsc_oo','codegen.js'));


describe("ios exports",function(){
	
	it("should exist",function(){
		should.exist(binding);
	});

	it("should makeExport exist",function(){
		should.exist(binding.makeExport);
	});
    
    it("it should generate static method with no args and void return", function() {
        
        var f = {
            args: [],
            instance: false,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('+(void)foo;\n');
    });

    it("it should generate instance method with no args and void return", function() {
        
        var f = {
            args: [],
            instance: true,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('-(void)foo;\n');
    });
    
    it("it should generate static method with no args and int return", function() {
        
        var f = {
            args: [],
            instance: false,
            name: 'foo',
            returnType: 'int'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('+(int)foo;\n');
    });

    it("it should generate instance method with no args and int return", function() {
        
        var f = {
            args: [],
            instance: true,
            name: 'foo',
            returnType: 'int'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('-(int)foo;\n');
    });

    it("it should generate static method with 1 arg and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'}
            ],
            instance: false,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('+(void)foo:(NSString*)bar;\n');
    });

    it("it should generate instance method with 1 arg and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'}
            ],
            instance: true,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('-(void)foo:(NSString*)bar;\n');
    });

    it("it should generate static method with 2 args and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'},
                {name:'baz',type:'NSNumber*'}
            ],
            selector:'foo:baz',
            instance: false,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('JSExportAs(foo,\n   +(void)foo:(NSString*)bar baz:(NSNumber*)baz\n);\n');
    });

    it("it should generate instance method with 2 args and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'},
                {name:'baz',type:'NSNumber*'}
            ],
            selector:'foo:baz',
            instance: true,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('JSExportAs(foo,\n   -(void)foo:(NSString*)bar baz:(NSNumber*)baz\n);\n');
    });

    it("it should generate static method with 2 args with different receiver name and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'},
                {name:'baz',type:'NSNumber*'}
            ],
            selector:'foo:yo',
            instance: false,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('JSExportAs(foo,\n   +(void)foo:(NSString*)bar yo:(NSNumber*)baz\n);\n');
    });
    
    it("it should generate instance method with 2 args with different receiver name and void return", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'},
                {name:'baz',type:'NSNumber*'}
            ],
            selector:'foo:yo',
            instance: true,
            name: 'foo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('JSExportAs(foo,\n   -(void)foo:(NSString*)bar yo:(NSNumber*)baz\n);\n');
    });

    it("it should generate instance method with different implname than the exported name", function() {
        
        var f = {
            args: [
                {name:'bar',type:'NSString*'},
                {name:'baz',type:'NSNumber*'}
            ],
            selector:'foo:yo',
            instance: true,
            name: 'foo',
            implname: 'woofoo',
            returnType: 'void'
        };
        
        var result = binding.makeExport(f);
        should.exist(result);
        result.should.be.a('string');
        result.should.be.equal('JSExportAs(foo,\n   -(void)woofoo:(NSString*)bar yo:(NSNumber*)baz\n);\n');
    });
    
});
