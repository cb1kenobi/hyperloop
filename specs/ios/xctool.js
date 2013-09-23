/**
 * ios xctool tests
 */
var should = require('should'),
	path = require('path'),
	fs = require('fs'),
	temp = require('temp'),
	buildlib = require('../../lib/ios/buildlib'),
	typegenerator = require('../../lib/ios/jsc/typegenerator'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,
    genmetadata = require('./metadata');

describe("ios xctool", function(){

	it("should checkout submodule", function(done){
		exec('git submodule init && git submodule update',done);
	});

	it("should run xctool", function(done){
		var dir = path.join(__dirname,'testsuite'),
			cmd = 'xcodebuild',
			env = {cwd:dir};
		exec(cmd,env,done);
	});

	it("should run xctool tests", function(done){
		var dir = path.join(__dirname,'testsuite'),
			genfile = path.join(dir, 'testsuite','compile.m'),
			xctool = path.join(__dirname,'../../tools/xctool/xctool.sh'),
			project = path.join(dir, 'testsuite.xcodeproj'),
			args = ['-project',project,'-scheme', 'testsuite', '-sdk', 'iphonesimulator', '-reporter', 'pretty', 'clean', 'test'],
			env = {cwd:dir},
			completed = false,
			failure = false;

		genmetadata.getMetadata(function(err,m){
			if (err) return done(err);
			metadata = m;

			temp.mkdir('hltest', function(err, dirPath) {
				if (err) return done(err);
			
				typegenerator.generateOutput(metadata,function(err,buf){
					if (err) return done(err);

					var testsrc = path.join(__dirname,"testsuite","testsuite","compile.m"),
						testlibdir = path.join(__dirname,"testsuite","testsuite");

					fs.writeFileSync(testsrc,buf);

					var headerPath = path.join(__dirname,"../../lib/ios/jsc/templates/source"),
						options = {
							minVersion : "7.0",
							libname: "libhyperloop.a",
							srcfiles: [path.join(headerPath,"JSBuffer.c"),path.join(headerPath,"hyperloop.m")],
							outdir: dirPath,
							cflags: ["-I"+headerPath],
							linkflags: ['-framework JavaScriptCore'],
							name: 'hyperloop',
							dest: dirPath,
							debug: true,
							launch: true,
							no_arc: true,
							hide: true 
						};

					buildlib.compileAndMakeStaticLib(options, function(err,results){
						if (err) return done(err);

						// copy libfile into path so that we can still run inside xcode as well
						fs.writeFileSync(path.join(testlibdir,options.libname),fs.readFileSync(results.libfile));

						var timer = function() {
							if (!completed) {
								completed=true;
								done(failure?new Error('testsuite test(s) failed') : null);
							}
						}
						var process = spawn(xctool,args,{env:env});
						process.stdout.on('data',function(buf){
							buf = buf.toString();
							console.log(buf);
							// seems like sometimes xctool will hang and this will attempt to auto-exit
							if (buf.indexOf('** TEST SUCCEEDED')>=0) {
								failure = false;
								setTimeout(timer,500);
							}
							if (buf.indexOf('** TEST FAILED')>=0) {
								failure = true;
								setTimeout(timer,500);
							}
						});
						process.stderr.on('data',function(buf){
							console.log(buf.toString());
						});
						process.on('close',function(exitCode){
							console.log('exitCode',exitCode);
							completed = true;
							done(exitCode!=0 ? new Error('testsuite test(s) failed') : null);
						});

					});
				});	
			});
		});
	});
});
