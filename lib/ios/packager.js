/**
 * iOS packaging
 */
var Packager = require('../packager').Packager,
	fs = require('fs'),
	path = require('path'),
	log = require('../log'),
	_ = require('underscore'),
	appc = require('node-appc'),
	exec = require('child_process').exec,
	wrench = require('wrench'),
	buildlib = require('./buildlib'),
	async = require('async'),
	util = require('../util'),
	templateDir = path.join(__dirname,'templates'),
	xcodeTemplateDir = path.join(templateDir,'PRODUCTNAME');

function iOSPackager(options) {
	Packager.call(this,options);
}

// extend our base class
iOSPackager.prototype.__proto__ = Packager.prototype;

function readLegacyManifest(file) {
	var contents = fs.readFileSync(file),
		manifest = {},
		r = contents.toString().split('\n').filter(function(l){
			return l!=='' && l.charAt(0)!=='#';
		}).map(function(l){
			var i = l.indexOf(':'),
				k = l.substring(0,i).trim(),
				v = l.substring(i+1).trim();
			manifest[k]=v;
		});
	return manifest;
}

iOSPackager.prototype.validate = function(options,args,required) {

	options.main = (options.main || 'app').replace(/\.hjs/g,'').replace(/\\/,'_');
	options.safeName = makeSafeName(options.name);

	var packageType = 'app';

	if (args.length!==0) {
		packageType = args[0];
	}
	options.packageType = packageType;

	switch (packageType) {
		case 'module': {
			var srcdir = appc.fs.resolvePath(options.src),
				manifestFile = path.join(srcdir,'manifest'),
				isLegacyModuledir = fs.existsSync(manifestFile);

			if (isLegacyModuledir) {
				options.ticurrent = true;
				options.manifest = readLegacyManifest(manifestFile);
				options.moduleid = options.manifest.moduleid;
				options.author = options.manifest.author;
				options.version = options.manifest.version;
				options.name = options.manifest.name;
				options.guid = options.manifest.guid;
				options.src = path.join(srcdir,'js');

				if (!fs.existsSync(options.src)) {
					throw new Error("Couldn't find module JS source directory at "+options.src.green);
				}
			}
			else {
				throw new Error("Directory: "+srcdir.yellow+" doesn't look like a Titanium module directory");
			}

			// switch out the main to be unique in case we compile multiple modules
			// which all have an app.hjs, we want to have a unique set of names
			options.classprefix = options.moduleid.replace(/\./g,'_')+'_';

			required(options,'name','specify the module name');
			required(options,'moduleid','specify the module identifier (such as com.module.id) for the module');
			required(options,'author','specify the module author');
			required(options,'version','specify the module version such as 1.0.0');

			options.guid = options.guid || util.guid();
			if (options.guid.split('-').length<4) {
				throw new Error("invalid module guid. should look something like: AAE42805-C190-441B-815E-B4BFC9E437C3. Try running `uuidgen`");
			}
			log.debug('using module guid:',options.guid.magenta);

			break;
		}
		case 'app': {
			required(options,'name','specify the name of the application');
			required(options,'appid','specify the application identifier (such as com.appcelerator.foo) of the application');
			break;
		}
		default: {
			throw new Error("Unknown package type: "+packageType.green);
		}
	}

	return true;
};

function makeSafeName (name) {
	return name.replace(/[\s\+\-\$\@\!\?\*\%\#\:\;\/]/g,'_');
}

/**
 * package an iOS application
 */
function packageApp(options,args,callback) {

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

	var safeName = options.safeName,
		main_js = options.main;

	var linkflags = options.linkflags || [],
		cflags = options.cflags || [],
		infoplist = options.infoplist || {},
		appdelegate = options.appdelegate || 'AppDelegate';


	linkflags.push('-L'+path.resolve(options.dest));
	linkflags.push('-l'+libname);
	linkflags.push('-lz');
	linkflags.push('-ObjC');

	// check to make sure we aren't disabling crash and if not, enable compiler/linker properties
	if (cflags.filter(function(f){ return f.indexOf('-DHL_DISABLE_CRASH')!==-1; }).length===0) {
		// these are for Crash detection library (KSCrash)
		linkflags.push('-lc++');
		linkflags.push('-framework KSCrash');
		linkflags.push('-framework SystemConfiguration');
		linkflags.push('-framework MessageUI');
		var libdir = path.join(util.writableHomeDirectory());
		linkflags.push('-F'+libdir);
		cflags.push('-F'+libdir);
	}

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
	util.copyAndFilterEJS(path.join(templateDir,'HyperloopApp.mm'),path.join(xcodeSrcDest,'HyperloopApp.mm'),{
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
	util.copyAndFilterEJS(path.join(templateDir,'main.mm'),path.join(xcodeSrcDest,'main.mm'),{
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

			// for any flag that might have a path in it, we need to make sure
			// that the path is quoted
			function quotePaths(flag) {
				if (/^-(F|I|L)/.test(flag)) {
					var path = flag.substring(2);
					if (path!='"') {
						return flag.substring(0,2)+'"'+flag.substring(2)+'"';
					}
				}
				return flag;
			}

			var args = [
				'-sdk', 'iphone'+platform+''+settings.version,
				'VALID_ARCHS='+arch,
				'OTHER_LDFLAGS='+linkflags.map(quotePaths).join(' '),
				'OTHER_CFLAGS='+cflags.map(quotePaths).join(' ')
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
							if (fp.indexOf('/' + options.dest + '/') >= 0) {
								return;
							}
							if (isDir) {
								wrench.mkdirSyncRecursive(dest);
							}
							else {
								util.copyFileSync(fp, dest);
							}
						});
					}
				});

		    // copy any non-source files into destination
		    if (options.src && util.isDirectory(options.src)) {
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
									var cmd = 'ibtool "'+fp+'" --compile "'+dest.replace('.xib','.nib')+'"';
									log.debug('running ibtool with command:',cmd.cyan);
									exec(cmd, function(err,stdout,stderr){
										stdout && log.debug(stdout);
										stderr && log.error(stderr);
									});
								}
								else {
									util.copyFileSync(fp, dest);
								}
							}
						}
					});
				}

				callback();
			});
		});

	}

	//TODO: OTHER_LDFLAGS for frameworks
	//TODO: handle launch images
}

/**
 * create a Ti.Current suitable module class name
 */
function makeModuleName(moduleid) {
	var toks = moduleid.split('.'),
		name = toks.map(function(e){ return e.charAt(0).toUpperCase()+e.substring(1)}).join('');
	return name + 'Module';
}

/**
 * package this app into a Ti.Current module
 */
function packageModule (options, args, callback) {
	var name = makeModuleName(options.moduleid),
		copyValues = _.extend(options.manifest, {
			modulename: name,
			app: options.main,
			prefix: options.prefix
		}),
		srcdir = path.join(options.dest,'src'),
		templateDir = path.join(__dirname,'templates'),
		srcs = [];

	util.copyAndFilterEJS(path.join(templateDir,'module.h'),path.join(srcdir,name+'.h'),copyValues);
	util.copyAndFilterEJS(path.join(templateDir,'module.m'),path.join(srcdir,name+'.m'),copyValues);
	util.copyAndFilterEJS(path.join(templateDir,'module_assets.h'),path.join(srcdir,name+'Assets.h'),copyValues);
	util.copyAndFilterEJS(path.join(templateDir,'module_assets.m'),path.join(srcdir,name+'Assets.m'),copyValues);

	srcs.push(path.join(srcdir,name+'.m'));
	srcs.push(path.join(srcdir,name+'Assets.m'));

	var libname = options.libname.replace(/^lib/,'').replace(/\.a$/,'').trim(),
		libdir = util.escapePaths(path.resolve(options.dest)),
		includedir = util.escapePaths(path.resolve(srcdir)),
		hllib = util.escapePaths(path.join(options.dest,options.libname)),
		finallib = util.escapePaths(path.join(options.dest,'lib'+options.moduleid+'.a')),
		buildoptions = {
			no_arc: true,
			minVersion: options['min-version'] || '7.0',
			libname: 'lib'+options.moduleid+'module.a',
			srcfiles: srcs,
			outdir: options.dest,
			cflags: options.cflags.concat(['-I'+includedir]),
			linkflags: options.linkflags.concat(['-L'+libdir,'-l'+libname])
		};

	buildlib.compileAndMakeStaticLib(buildoptions,function(err,results){
		if (err) return callback(err);
		buildlib.getXcodeSettings(function(err,settings){
			var jobs = [],
				libs = [],
				removal = [hllib, path.join(options.dest,buildoptions.libname)];

			// we need to merge together the hyperloop generated libs and our module libs
			Object.keys(results.libfiles).forEach(function(key) {
				var lib1 = finallib.replace(/\.a$/,'-'+key+'.a'),
					lib2 = util.escapePaths(results.libfiles[key]),
					lib3 = hllib.replace(/\.a$/,'-'+key+'.a'),
					cmd = settings.libtool+' -static -o '+lib1+' '+lib2+' '+lib3;

				libs.push(lib1);
				removal.push(lib1);
				removal.push(lib2);
				removal.push(lib3);

				jobs.push(function(next) {
					log.debug(cmd);
					exec(cmd,next);
				});
			});

			// now recreate the lipo of the merged libraries for all archs
			jobs.push(function(next){
				var cmd = settings.lipo+' -output '+finallib+' -create '+libs.join(' ');
				log.debug(cmd);
				exec(cmd,next);
			});

			// cleanup our temp libs
			removal.forEach(function(lib){
				jobs.push(function(next){
					log.debug('removing',lib);
					fs.unlink(lib,next);
				});
			});

			async.series(jobs,function(err,results){
				if (err) return callback(err);

				log.info('Creating module zip distribution');

				var Zipper = require('zipper').Zipper,
					basedir = 'modules/iphone/'+options.moduleid+'/'+options.manifest.version+'/',
					files = [],
					finalzip = path.join(options.dest,options.moduleid+'-iphone-'+options.manifest.version+'.zip'),
					zipfile = new Zipper(finalzip),
					tasks = [];

				if (fs.existsSync(finalzip)) {
					fs.unlinkSync(finalzip);
				}

				files.push([finallib,basedir+path.basename(finallib)]);
				// directories & files we want to include in the module zip
				['assets','platform','hooks','manifest','module.xcconfig','timodule.xml','LICENSE','metadata.json'].forEach(function(fn){
					var rd = path.join(options.src,'..'),
						f = path.join(rd,fn);
					if (fs.existsSync(f)) {
						if (util.isDirectory(f)) {
							wrench.readdirSyncRecursive(f).forEach(function(nf){
								var zfn = path.join(f,nf);
								files.push([zfn,basedir+path.relative(rd,zfn)]);
							});
						}
						else {
							//special hack to make sure we indicate this module is a hyperloop module
							if (fn=='manifest') {
								var c = fs.readFileSync(f).toString();
								if (c.indexOf('hyperloop: true')===-1) {
									c+='\n# added to indicate hyperloop compiled module\nhyperloop: true\n';
									fs.writeFileSync(f,c);
								}
							}
							files.push([f,basedir+path.relative(rd,f)]);
						}
					}
				});

				// create a zip task for each file
				files.forEach(function(entry){
					tasks.push(function(callback){
						zipfile.addFile(entry[0],entry[1],callback);
					});
				});

				// run the zip tasks
				async.series(tasks,function(err){
					if (err) return callback(err);
					log.info('Created module distribution:',finalzip.yellow.bold);
					callback();
				});
			});
		});
	});
}

iOSPackager.prototype.package = function(options,args,callback) {
	if (!options.main) {
		options.main = 'app';
	}

	switch (options.packageType) {
		case 'module': {
			return packageModule(options,args,callback);
		}
		case 'app':
		default: {
			return packageApp(options,args,callback);
		}
	}
};

exports.Packager = iOSPackager;
