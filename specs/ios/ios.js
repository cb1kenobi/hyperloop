/**
 * ios buildlib tests
 */
var should = require('should'),
	path = require('path'),
	fs = require('fs'),
	temp = require('temp'),
	exec = require('child_process').exec,
	buildlib = require('../../lib/ios/buildlib'),
	settings;

describe("ios buildlib", function(){

	before(function(done){
		buildlib.getXcodeSettings(function(err,xcode){
			settings = xcode;

			settings.should.have.property('version');
			settings.should.have.property('libtool');
			settings.should.have.property('otool');
			settings.should.have.property('clang');
			settings.should.have.property('lipo');
			settings.should.have.property('xcodePath');
			settings.should.have.property('simSDKPath');
			settings.should.have.property('deviceSDKPath');

			fs.existsSync(settings.libtool).should.be.true;
			fs.existsSync(settings.otool).should.be.true;
			fs.existsSync(settings.clang).should.be.true;
			fs.existsSync(settings.lipo).should.be.true;
			fs.existsSync(settings.xcodePath).should.be.true;
			fs.existsSync(settings.simSDKPath).should.be.true;
			fs.existsSync(settings.deviceSDKPath).should.be.true;

			done();
		});
	});

	it("should be able to find valid Xcode path", function(done){

		buildlib.getXcodePath(function(err,xcode){
			err && done(err);

			fs.existsSync(xcode).should.be.true;

			done();
		});
	});

	it("should be able to find valid Xcode path and have them cached", function(done){

		buildlib.getXcodeSettings(function(err,xcode){
			should.exist(xcode);
			// make sure they are the same since they should be cached
			xcode.should.eql(settings);
			done();
		});
	});

	it("should be able to compile basic code", function(done) {

		var src = [
			"@import Foundation;",
			"@import UIKit;",
			"@interface TestButton : UIButton",
			"#ifdef FOO",
			"-(void)bar;",
			"#endif",
			"@end",
			"@implementation TestButton",
			"#ifdef FOO",
			"-(void)bar {",
			"}",
			"#endif",
			"@end"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.m");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			var options = {
				minVersion : "7.0",
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build,
				cflags: [],
				linkflags: []
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				if (err) return done(err);

				should.exist(results);

				results.should.have.property('objfiles');
				results.should.have.property('libfile');
				results.should.have.property('libfiles');
				results.objfiles.should.have.property('i386');
				results.objfiles.should.have.property('armv7s');
				results.objfiles.should.have.property('arm64');
				results.libfiles.should.have.property('i386');
				results.libfiles.should.have.property('armv7s');
				results.libfiles.should.have.property('arm64');

				exec(settings.otool+' -o "'+results.libfile+'"', function(err,stdout){
					if (err) return done(err);
					stdout.should.match(/name (0x[\w]+) TestButton/);
					stdout.should.not.match(/name (0x[\w]+) bar/);
					stdout.should.not.match(/types (0x[\w]+) v8@0:4/);
					done();
				});

			});
		});

	});

	it("should be able to compile code with CFLAGS", function(done) {

		var src = [
			"@import Foundation;",
			"@import UIKit;",
			"@interface TestButton : UIButton",
			"#ifdef FOO",
			"-(void)bar;",
			"#endif",
			"@end",
			"@implementation TestButton",
			"#ifdef FOO",
			"-(void)bar {",
			"}",
			"#endif",
			"@end"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.m");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			// test conditional compiling with -D which should compile in a function if
			// #ifdef FOO is compiled

			var options = {
				minVersion : "7.0",
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build,
				cflags: ['-DFOO'],
				linkflags: []
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				if (err) return done(err);
				should.exist(results);
				should.exist(results.libfile);

				exec(settings.otool+' -o "'+results.libfile+'"', function(err,stdout){
					if (err) return done(err);
					stdout.should.match(/name (0x[\w]+) TestButton/);
					stdout.should.match(/name (0x[\w]+) bar/);
					stdout.should.match(/types (0x[\w]+) v8@0:4/);
					done();
				});

			});
		});

	});

	it("should be able to support min-ios during compile", function(done) {

		var src = [
			"@import Foundation;",
			"@import UIKit;",
			"@import iAd;",
			"#if __IPHONE_OS_VERSION_MIN_REQUIRED < 70000",
			"#error The iOS min-version flag is not correct!",
			"#endif",
			"@interface TestButton : UIButton",
			"@end",
			"@implementation TestButton",
			"@end"
		];


		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.m");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			// test that our conditional macro is set (by ios) to the right min version

			var options = {
				minVersion : "7.0",
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build,
				cflags: ['-DFOO'],
				linkflags: []
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				if (err) return done(err);
				should.exist(results);
				should.exist(results.libfile);

				exec(settings.otool+' -o "'+results.libfile+'"', function(err,stdout){
					if (err) return done(err);
					stdout.should.match(/name (0x[\w]+) TestButton/);
					done();
				});

			});
		});

	});

	it("should fail if compiling for the wrong min version", function(done) {

		var src = [
			"@import Foundation;",
			"@import UIKit;",
			"@import iAd;",
			"#if __IPHONE_OS_VERSION_MIN_REQUIRED < 70000",
			"#error Wahoo, this worked",
			"#endif",
			"@interface TestButton : UIButton",
			"@end",
			"@implementation TestButton",
			"@end"
		];


		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.m");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			// test that our conditional macro is set (by ios) to the right min version

			var options = {
				minVersion : "5.0",
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build,
				cflags: ['-DFOO'],
				linkflags: []
			};

			buildlib.compileAndMakeStaticLib(options,function(err){
				should.exist(err);
				err.should.match(/Wahoo, this worked/);
				done();
			});
		});

	});

	it("should fail if source doesn't exist", function(done) {
		var build = __dirname;
		var options = {
			minVersion : "5.0",
			libname: "libtest.a",
			srcfiles: ['foo.m'],
			outdir: build,
			cflags: ['-DFOO'],
			linkflags: []
		};

		buildlib.compileAndMakeStaticLib(options,function(err,results){
			try { fs.rmdirSync(path.join(__dirname,'i386'))} catch (E){}
			try { fs.rmdirSync(path.join(__dirname,'armv7'))} catch (E){}
			should.exist(err);
			err.should.match(/couldn't find source file: foo.m/);
			done();
		});
	});

	it("should fail if source array is empty", function(done) {
		var build = __dirname;
		var options = {
				minVersion : "7.0",
				libname: "libtest.a",
				srcfiles: [],
				outdir: build,
				cflags: ['-DFOO'],
				linkflags: []
			};

		buildlib.compileAndMakeStaticLib(options,function(err){
			should.exist(err);
			err.should.match(/no source\(s\) specified/);
			done();
		});
	});

	it("should use xcode version (latest) if minVersion not specified", function(done) {

		var version = settings.version,
			versionStr = version.replace('.','0')+'00';

		var src = [
			"@import Foundation;",
			"@import UIKit;",
			"@import iAd;",
			"#if __IPHONE_OS_VERSION_MIN_REQUIRED < "+versionStr,
			"#error expected: "+version,
			"#endif",
			"#if __IPHONE_OS_VERSION_MIN_REQUIRED > "+versionStr,
			"#error expected: "+version,
			"#endif",
			"#error Wahoo, this worked",
			"@interface TestButton : UIButton",
			"@end",
			"@implementation TestButton",
			"@end"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.m");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			// test that our conditional macro is set (by ios) to the right min version

			var options = {
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build
			};

			buildlib.compileAndMakeStaticLib(options,function(err){
				should.exist(err);
				err.should.match(/Wahoo, this worked/);
				done();
			});
		});

	});

	it("should be able to compile objective c++ files", function(done) {

		// create a C++ class that mixes in Objective-C and make sure that compiles
		var src = [
			"#import <Foundation/Foundation.h>",
			"class CPlus {",
			" public:",
			"   CPlus();",
			" private:",
			"   NSObject *o;",
			"}; ",
			"CPlus::CPlus() {",
			"   o = [[NSObject alloc] init];",
			"}"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.mm");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			var options = {
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				err && done(err);
				should.exist(results);
				should.exist(results.libfile);
				fs.existsSync(results.libfile).should.be.true;
				done();
			});
		});

	});

	it("should be able to compile c++ files", function(done) {

		var src = [
			"#include <iostream>",
			"using namespace std;",
			"class CRectangle {",
			"    int width, height;",
			"  public:",
			"    CRectangle (int,int);",
			"    int area () {return (width*height);}",
			"};",
			"CRectangle::CRectangle (int a, int b) {",
			"  width = a;",
			"  height = b;",
			"}"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.cpp");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			var options = {
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				err && done(err);
				should.exist(results);
				should.exist(results.libfile);
				fs.existsSync(results.libfile).should.be.true;
				done();
			});
		});

	});

	it("should be able to compile C files", function(done) {

		var src = [
			"#include <stdio.h>",
			"extern void Foo();",
			"void Foo() {",
			'   printf("Foo bar");',
			"}"
		];

		temp.mkdir('hltest', function(err, dirPath) {
			if (err) return done(err);

			var srcdir = path.join(dirPath,"src"),
				build = path.join(dirPath,"build"),
				srcfile = path.join(srcdir,"testbutton.c");

			fs.mkdirSync(srcdir);
			fs.mkdirSync(build);

			fs.writeFileSync(srcfile, src.join("\n"));

			var options = {
				libname: "libtest.a",
				srcfiles: [srcfile],
				outdir: build
			};

			buildlib.compileAndMakeStaticLib(options,function(err,results){
				err && done(err);
				should.exist(results);
				should.exist(results.libfile);
				fs.existsSync(results.libfile).should.be.true;
				done();
			});
		});

	});

});