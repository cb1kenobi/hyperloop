/**
 * iOS packaging
 */
var Packager = require('../packager').Packager,
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	log = require('../log'),
	_ = require('underscore'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec,
	wrench = require('wrench'),
	buildlib = require('./buildlib'),
	util = require('../util'),
	async = require('async'),
	templateDir = path.join(__dirname,'templates'),
	xcodeTemplateDir = path.join(templateDir,'PRODUCTNAME');

function iOSPackager(options) {
	Packager.call(this,options);
};

// extend our base class
iOSPackager.prototype.__proto__ = Packager.prototype;

/**
 * launch the ios simulator
 */
function executeSimulator(name,build_dir,settings,callback,callback_logger,hide) {
	var ios_sim = path.join(__dirname,'..','..','node_modules','ios-sim','build','Release','ios-sim'),
		args = ['launch',build_dir];

	log.debug('launch ios-sim with args:',args.join(' ').grey);
	var simulator = spawn(ios_sim,args);

	var logOut = /^\[(INFO|DEBUG|WARN|TRACE|ERROR|FATAL)\] ([\s\S]*)/,
		prefix = name+'[';

	function splitLogs(buf,err) {
		buf.split(/\n/).forEach(function(line) {
			if (line.indexOf('\n')!=-1) {
				return splitLogs(line,err);
			}
			var m = line.indexOf(prefix);
			if (m != -1) {
				var e = line.indexOf(']',m);
				line = line.substring(e+2);
				var match = logOut.exec(line);
				if (match) {
					var label = match[1],
						content = match[2];
					// if our content still has an embedded log level, recurse to remove it
					if (logOut.test(content)) {
						return splitLogs(content);
					}
					switch(label) {
						case 'INFO': {
							if (callback_logger && callback_logger.info) {
								return content && callback_logger.info(content);
							}
							return log.info(content);
						}
						case 'TRACE':
						case 'DEBUG': {
							if (callback_logger && callback_logger.debug) {
								return content && callback_logger.debug(content);
							}
							return log.debug(content);
						}
						case 'WARN':
						case 'FATAL':
						case 'ERROR': {
							if (callback_logger && callback_logger.error) {
								return content && callback_logger.error(content);
							}
							return log.error(content);
						}
					}
				}
				else {
					if (callback_logger && callback_logger.info) {
						return line && callback_logger.info(line);
					}
					log.info(line);
				}
			}
			else if (err) {
				if (/AssertMacros: queueEntry/.test(line)) {
					return;
				}
				if (/Terminating in response to SpringBoard/.test(line)){
					return callback();
				}
				if (callback_logger && callback_logger.error) {
					callback_logger.error(line);
				}
				else {
					log.info(line);
				}
			}
		});
	}

	function logger(data,err) {
		var buf = String(data).trim();
		splitLogs(buf,err);
	}

	simulator.stderr.on('data',function(data){
		logger(data,true);
	});

	simulator.stdout.on('data',logger);

	simulator.on('close',function(code){
		callback && callback();
	});

	if (!hide) {
		// bring forward the simulator window
		var scpt = path.join(__dirname,'iphone_sim_activate.scpt'),
			asa = path.join(settings.xcodePath,'Platforms','iPhoneSimulator.platform','Developer','Applications','iPhone Simulator.app'),
			cmd = 'osascript "'+path.resolve(scpt)+'" "'+asa+'"';
		exec(cmd);
	}
}

Packager.prototype.validate = function(options,args,required) {
	required(options,'name','specify the name of the application');
	required(options,'appid','specify the application identifier (such as com.appcelerator.foo) of the application');
};

const ignoreList = /\.(CVS|svn|git|DS_Store)$/;
function copyFile(srcFile, destFile) {
	if (!ignoreList.test(srcFile)) {
	    var contents = fs.readFileSync(srcFile);
	    fs.writeFileSync(destFile, contents);
	    log.debug('copying',srcFile.cyan,'to',destFile.cyan);
	}
}

Packager.prototype.package = function(options,args,callback) {
	if (!options.main) {
		options.main = 'app';
	}

	options.main = options.main.replace(/\.hjs/g,'').replace(/\\/,'_');

	var libname = /^lib(\w+)\.a/.exec(options.libname || 'libapp.a')[1],
		arch = options.arch || 'i386',
		arch = /(i386|simulator)/.test(arch) ? 'i386' : 'armv7',
		platform = /(i386|simulator)/.test(arch) ? 'simulator' : 'os',
		appdir = path.join(options.dest,platform,options.name+'.app'),
		builddir = path.resolve(options.dest);

	if (!fs.existsSync(appdir)) {
		wrench.mkdirSyncRecursive(appdir);
	}

	if (!fs.existsSync(builddir)) {
		wrench.mkdirSyncRecursive(builddir);
	}

	var safeName = options.name.replace(/[\s\+\-\$\@\!\?\*\%\#\:\;\/]/g,'_'),
		main_js = options.main;

	var linkflags = options.linkflags || [],
		cflags = options.cflags || [],
		infoplist = options.infoplist || {},
		appdelegate = options.appdelegate || 'AppDelegate';


	linkflags.push('-L'+path.resolve(options.dest));
	linkflags.push('-l'+libname);
	linkflags.push('-lz');
	linkflags.push('-ObjC');

	cflags.forEach(function(flag){
		if (/^-F/.test(flag)) {
			linkflags.push(flag);
		}
	});

	var spacer = '\t\t\t\t\t';

	var copyValues = {
		PRODUCTNAME: safeName,
		LIBDIR: path.relative(builddir,options.dest),
		LIBNAME: libname,
		HYPERLOOP_OTHER_CFLAGS: cflags.map(function(k){return '"'+k+'"'}).join(',\n'+spacer),
		HYPERLOOP_OTHER_LDFLAGS: linkflags.map(function(k){return '"'+k+'"'}).join(',\n'+spacer)
	};

	var xcodeProjectTemplate = path.join(xcodeTemplateDir,'PRODUCTNAME.xcodeproj','project.pbxproj'),
		xcodeProjectDest = path.join(builddir,safeName+'.xcodeproj','project.pbxproj'),
		xcodeSrcDest = path.join(builddir,safeName),
		prefixTemplate = path.join(templateDir,'Prefix.pch'),
		prefixDest = path.join(xcodeSrcDest,safeName+'-Prefix.pch'),
		infoplistTemplate = path.join(templateDir,'info.plist'),
		infoplistDest = path.join(xcodeSrcDest,safeName+'-Info.plist');

	wrench.mkdirSyncRecursive(path.dirname(xcodeProjectDest));
	wrench.mkdirSyncRecursive(xcodeSrcDest);

	util.copyAndFilterString(xcodeProjectTemplate,xcodeProjectDest,copyValues);
	util.copyAndFilterString(prefixTemplate,prefixDest,copyValues);

	util.copyAndFilterEJS(path.join(templateDir,'HyperloopApp.h'),path.join(xcodeSrcDest,'HyperloopApp.h'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js,
		prefix: options.classprefix,
		appdelegate: appdelegate
	});
	util.copyAndFilterEJS(path.join(templateDir,'HyperloopApp.m'),path.join(xcodeSrcDest,'HyperloopApp.m'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js,
		prefix: options.classprefix,
		appdelegate: appdelegate
	});
	util.copyAndFilterEJS(path.join(templateDir,'AppDelegate.h'),path.join(xcodeSrcDest,'AppDelegate.h'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js,
		prefix: options.classprefix
	});
	util.copyAndFilterEJS(path.join(templateDir,'AppDelegate.m'),path.join(xcodeSrcDest,'AppDelegate.m'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js,
		prefix: options.classprefix
	});
	util.copyAndFilterEJS(path.join(templateDir,'main.m'),path.join(xcodeSrcDest,'main.m'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js,
		prefix: options.classprefix,
		appdelegate: appdelegate
	});
	util.copyAndFilterEJS(infoplistTemplate,infoplistDest,{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: main_js
	});

	// if we have any modifications to the info.plist, add them
	if (infoplist) {
		var jobs = [];
		Object.keys(infoplist).forEach(function(k){
			jobs.push(function(callback) {
				var entry = infoplist[k],
					type = entry.type
					value = entry.value,
					cmd = '/usr/libexec/PlistBuddy -c "add '+"'"+k+"' "+type+" '"+value+"'"+'" "'+infoplistDest+'"';
				log.debug(cmd);
				exec(cmd,callback);
			});
		});
		async.series(jobs,run);
	}
	else {
		run();
	}

	function run() {

		buildlib.getXcodeSettings(function(err,settings){
			if (err) return callback(err);

			var args = [
				'-sdk', 'iphone'+platform+''+settings.version,
				'VALID_ARCHS='+arch,
				'OTHER_LDFLAGS='+linkflags.join(' '),
				'OTHER_CFLAGS='+cflags.join(' ')
			];

			buildlib.xcodebuild(builddir,args,function(err,result){
				if (err) return callback(err);

				var appdir = path.join(builddir,'build','Release-iphone'+platform,safeName+'.app');

				if (!options.logger && (options.logger && !options.logger.info)) {
					log.info('Built application in',appdir.yellow);
				}

				// copy any third-party framework resources
				options.thirdparty_frameworks && Object.keys(options.thirdparty_frameworks).forEach(function(key){
					var headerdir = options.thirdparty_frameworks[key],
						resourcesDir = path.join(path.dirname(headerdir),'Resources');
					if (fs.existsSync(resourcesDir)) {
						var copyfiles = wrench.readdirSyncRecursive(resourcesDir);
						copyfiles.forEach(function(f){
							var fp = path.join(resourcesDir,f),
								isDir = fs.statSync(fp).isDirectory(),
								dest = path.join(appdir,f);
							if (isDir) {
								wrench.mkdirSyncRecursive(dest);
							}
							else {
								copyFile(fp,dest);
							}
						});
					}
				});

		        // copy any non-source files into destination
		    	if (options.src) {
					var copyfiles = wrench.readdirSyncRecursive(path.resolve(options.src));
					copyfiles.forEach(function(f){
						var fp = path.join(options.src,f),
							isDir = fs.statSync(fp).isDirectory(),
							dest = path.join(appdir,f);
						if (isDir) {
							wrench.mkdirSyncRecursive(dest);
						}
						else {
							if (!/\.(hjs|js|m|c|cpp|mm|h)$/.test(f)) {
								if (/\.xib$/.test(f)) {
									log.debug('running ibtool on',dest.cyan);
									exec('ibtool "'+dest+'" --compile "'+dest.replace('.xib','.nib')+'"');
								}
								else {
									copyFile(fp,dest);
								}
							}
						}
					});
				}

				if (options.launch && platform==='simulator') {
					executeSimulator(options.name,appdir,settings,callback,options.logger,options.hide);
				}
			});
		});

	}

	//TODO: OTHER_LDFLAGS for frameworks
	//TODO: handle launch images
};

exports.Packager = Packager;