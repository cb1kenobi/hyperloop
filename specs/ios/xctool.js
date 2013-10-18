/**
 * ios xctool tests
 */
var should = require('should'),
	path = require('path'),
	fs = require('fs'),
	temp = require('temp'),
	codegen = require('../../lib/ios/jsc/codegen'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,
  metabase = require('../../lib/ios/metabase');

describe("ios xctool", function(){

	it("should checkout submodule", function(done) {
		//https://github.com/ryanrhee/xctool
		var folder = path.join(__dirname,'..','..','tools','xctool');
		if (!fs.existsSync(folder)) {
			console.log('cloning xctool into',folder);
			exec('git clone https://github.com/ryanrhee/xctool',{
				cwd: path.dirname(folder),
				env: process.env
			},done);
		}
		else {
			done();
		}
	});

	it("should run xctool", function(done){
		var dir = path.join(__dirname,'testsuite'),
			cmd = 'xcodebuild',
			env = {cwd:dir};
		exec(cmd,env,done);
	});

	it("should run xctool tests", function(done){
		var dir = path.join(__dirname,'testsuite'),
			xctool = path.join(__dirname,'../../tools/xctool/xctool.sh'),
			project = path.join(dir, 'testsuite.xcodeproj'),
			args = ['-project',project,'-scheme', 'testsuite', '-sdk', 'iphonesimulator', '-reporter', 'pretty', 'clean', 'test'],
			env = {cwd:dir, env:process.env},
			headerfile = path.join(__dirname, 'src', 'header.h'),
			TMPDIR = process.env.TMPDIR || '/tmp/',
			cachedAST = path.join(TMPDIR,'clangout_false.ast'),
			completed = false,
			failure = false;

		metabase.loadMetabase(
			headerfile,
			{
				arc: false,
				minVersion: '7.0',
				cacheFile: cachedAST,
				nativeArgs: []
			},
			function(err, m) {
				if (err) return done(err);
				metadata = m;

				var types = ['UIView',
							'char [32]',
							'char [37]',
							'char [4096]',
							'char [512]',
							'int *',
							'int []',
							'int [1024]',
							'int [8]',
							'int [18]',
							'int [19]',
							'integer_t *',
							'integer_t[1024]',
							'CGFloat',
							'EAGLGetVersion',
							'CGPathCreateMutable',
							'NSMutableAttributedString'
				];

				temp.mkdir('hltest', function(err, dirPath) {
					if (err) return done(err);
					var sourcedir = path.join(__dirname,"testsuite","source");
					var config = {
						version: '7.0',
						types: types,
						builddir: dirPath,
						outdir: sourcedir,
						libname: 'libhyperloop.a'
					};
					codegen.compile(metadata, config, function(err,results){
						if (err) return done(err);

						var testlibdir = path.join(__dirname,"testsuite","testsuite");


						// copy libfile into path so that we can still run inside xcode as well
						fs.writeFileSync(path.join(testlibdir,config.libname),fs.readFileSync(results.libfile));

						var timer = function() {
							if (!completed) {
								completed=true;
								done(failure?new Error('testsuite test(s) failed') : null);
							}
						}
						var process = spawn(xctool,args,env);
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
							completed = true;
							done(exitCode!=0 ? new Error('testsuite test(s) failed') : null);
						});

					});
				});
			}
		);
	});
});
