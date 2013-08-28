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
	templateDir = path.join(__dirname,'templates'),
	xcodeTemplateDir = path.join(templateDir,'PRODUCTNAME');

function iOSPackager(options) {	
	Packager.call(this,options);
};

// extend our base class
iOSPackager.prototype.__proto__ = Packager.prototype;

function copyAndFilterEJS(from, to, obj) {
	var f = fs.readFileSync(from).toString(),
		o = ejs.render(f,obj);
	fs.writeFileSync(to, o);
}

function copyAndFilterString(from, to, obj) {
	var f = fs.readFileSync(from).toString();
	Object.keys(obj).forEach(function(key){
		var value = obj[key];
		f = f.replace(new RegExp(key,'g'),value);
	});
	fs.writeFileSync(to, f);
}

/**
 * launch the ios simulator
 */
function executeSimulator(name,build_dir,settings,callback) {
	var ios_sim = path.join(__dirname,'..','..','node_modules','ios-sim','build','Release','ios-sim'),
		args = ['launch',build_dir,'--tall','--retina','--sdk','7.0'];

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
							return log.info(content);
						}
						case 'TRACE':
						case 'DEBUG': {
							return log.debug(content);
						}
						case 'WARN':
						case 'FATAL':
						case 'ERROR': {
							return log.error(content);
						}
					}
				}
				else {
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
				log.error(line);
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

	// bring forward the simulator window
	var scpt = path.join(__dirname,'iphone_sim_activate.scpt'),
		asa = path.join(settings.xcodePath,'Platforms','iPhoneSimulator.platform','Developer','Applications','iPhone Simulator.app'),
		cmd = 'osascript "'+path.resolve(scpt)+'" "'+asa+'"';
	exec(cmd);
}

Packager.prototype.package = function(options,args,callback) {
	if (!options.name) {
		return callback(new Error('missing required option --name'));
	}
	if (!options.appid) {
		return callback(new Error('missing required option --appid'));
	}
	if (!options.main) {
		options.main = 'app';
	}

	options.main = (options.classprefix||'') + options.main.replace(/\.js/g,'').replace(/\\/,'_');

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

	var safeName = options.name.replace(/[\s\+\-\$\@\!\?\*\%\#\:\;\/]/g,'_');

	var copyValues = {
		PRODUCTNAME: safeName,
		LIBDIR: path.relative(builddir,options.dest),
		LIBNAME: libname
	};

	var xcodeProjectTemplate = path.join(xcodeTemplateDir,'PRODUCTNAME.xcodeproj','project.pbxproj'),
		xcodeProjectDest = path.join(builddir,safeName+'.xcodeproj','project.pbxproj'),
		xcodeSrcDest = path.join(builddir,safeName),
		infoPlistTemplate = path.join(templateDir,'Prefix.pch'),
		infoPlistDest = path.join(xcodeSrcDest,safeName+'-Prefix.pch');

	wrench.mkdirSyncRecursive(path.dirname(xcodeProjectDest));
	wrench.mkdirSyncRecursive(xcodeSrcDest);

	copyAndFilterString(xcodeProjectTemplate,xcodeProjectDest,copyValues);
	copyAndFilterString(infoPlistTemplate,infoPlistDest,copyValues);

	copyAndFilterEJS(path.join(templateDir,'AppDelegate.h'),path.join(xcodeSrcDest,'AppDelegate.h'),{
		product_name: safeName,
		bundle_id: options.appid
	});
	copyAndFilterEJS(path.join(templateDir,'AppDelegate.m'),path.join(xcodeSrcDest,'AppDelegate.m'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: options.main
	});
	copyAndFilterEJS(path.join(templateDir,'main.m'),path.join(xcodeSrcDest,'main.m'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: options.main
	});
	copyAndFilterEJS(path.join(templateDir,'info.plist'),path.join(xcodeSrcDest,safeName+'-Info.plist'),{
		product_name: safeName,
		bundle_id: options.appid,
		main_js: options.main
	});

	buildlib.getXcodeSettings(function(err,settings){
		if (err) return callback(err);

		var args = [
			'-sdk', 'iphone'+platform+''+settings.version,
			'VALID_ARCHS='+arch,
			'OTHER_LDFLAGS=-L'+path.resolve(options.dest)+' -l'+copyValues.LIBNAME+' -lz -ObjC'
		];

		buildlib.xcodebuild(builddir,args,function(err,result){
			if (err) return callback(err);

			var appdir = path.join(builddir,'build','Release-iphone'+platform,safeName+'.app');

			log.info('Build application in',appdir.yellow);

			if (options.launch && platform==='simulator') {
				executeSimulator(options.name,appdir,settings,callback);
			}
		});
	});

	//TODO: OTHER_LDFLAGS for frameworks
	//TODO: copy non-JS resources
	//TODO: handle launch images
};

exports.Packager = Packager;