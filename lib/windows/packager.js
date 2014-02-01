/**
 * Windows packaging
 */
var path = require('path'),
	ejs = require('ejs'),
	fs = require('fs'),
	appc = require('node-appc'),
	wrench = require('wrench'),
	crypto = require('crypto'),
	Packager = require('../packager').Packager,
	log = require('../log'),
	util = require('../util'),
	programs = require('./programs'),
	Paths = require('./paths'),
	sdkConfigs = {
		'8.0': {
			version: '1',
			checksum: '399ace9876be068c35a30fded0b78e5a9ab589e8'
		},
		'8.1': {
			version: '1',
			checksum: '17a1d3c3215e3672ccba7f5496277ecc24dde221'
		}
	},
	urlFormat = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-sdk%s-v%s.zip';

exports.Packager = WinPackager;

function WinPackager(options) {
	Packager.call(this, options);
}

// extend our base class
WinPackager.prototype.__proto__ = Packager.prototype;

WinPackager.prototype.package = function(options, args, callback) {
	var paths = Paths.fetch(options),
		name = options.name,
		values = {
			APPNAME: name,
			APPGUID: (fs.existsSync(paths.guidPath) && fs.readFileSync(paths.guidPath, 'utf8')) || util.guid(),
			LIBDIR: path.resolve(path.join(paths.jscDir)).replace('/', '\\'),
			INCLUDEDIR: path.resolve(path.join(paths.jscDir, 'include')).replace('/', '\\'),
			CERTNAME: options.certname,
			PFX: options.pfx,
			PUBLISHERNAME: options.publisher
		},
		config = JSON.parse(fs.readFileSync(path.join(paths.destDir, 'config.json'), 'utf8'));

	// Copy the current build's options in to the config.
	config.options = options;

	fs.writeFileSync(paths.guidPath, values.APPGUID);

	log.debug('writing JavaScriptCore into', paths.jscDir.cyan);
	wrench.mkdirSyncRecursive(paths.appDir);

	var sdkConfig = sdkConfigs[options.sdk],
		version = sdkConfig.version,
		checksum = sdkConfig.checksum,
		url = require('util').format(urlFormat, options.sdk, version);

	util.downloadResourceIfNecessary('JavaScriptCore' + options.sdk, version, url, checksum, paths.homeDir, copyResourcesIntoDestination);

	function copyResourcesIntoDestination(err) {
		if (err) {
			return callback(err);
		}

		if (util.isDirectory(paths.srcDir)) {
			var files = wrench.readdirSyncRecursive(paths.srcDir);
			files.forEach(function(f) {
				var fp = path.join(paths.srcDir, f),
					isDir = fs.statSync(fp).isDirectory(),
					dest = path.join(paths.appDir, f);
				if (fp.indexOf('/' + options.dest + '/') >= 0) {
					return;
				}

				// Recurse into directories.
				if (isDir) {
					return wrench.mkdirSyncRecursive(dest);
				}

				// Headers.
				if (/\.(h)$/i.test(f)) {
					config.headers.push(f);
				}
				// Implementations.
				else if (/\.(cpp)$/i.test(f)) {
					config.implementations.push(f);
				}
				// Shader and vertex files.
				else if (/\.(hlsl)$/i.test(f)) {
					config.fxCompile.push({
						file: f,
						type: fs.readFileSync(fp, 'utf8').match(/main\(([A-Z][a-z]+)/)[1]
					});
				}

				if (!/\.(hjs)$/i.test(f)) {
					util.copyFileSync(fp, dest);
				}
			});
		}

		fs.readdir(paths.templateDir, copyTemplatesIntoDestination);
	}

	function copyTemplatesIntoDestination(err, files) {
		if (err) {
			return callback(err);
		}

		files.forEach(function(file) {
			var from = path.join(paths.templateDir, file),
				to;
			if (!util.isDirectory(from)) {
				to = path.join(paths.appDir, file.replace('App', name));
				var template = fs.readFileSync(from, 'utf8'),
					filtered = util.filterString(template, values),
					templated = ejs.render(filtered, config);
				util.writeIfDifferent(to, templated);
			}
			else {
				to = path.join(paths.appDir, file);
				wrench.copyDirSyncRecursive(from, to);
			}
		});

		log.info(name.green + ' successfully packaged to:\n\t' + paths.solutionFile.green + '\n\n');
		callback();
	}
};

WinPackager.prototype.validate = function(options, args, requiredFn, proceed) {
	requiredFn(options, 'name', 'specify the name of the application');
	!options.certname && (options.certname = 'CN=Test');
	!options.publisher && (options.publisher = 'Test');

	var paths = Paths.fetch(options),
		name = options.name,
		pvkPath = path.join(paths.appDir, 'Test_Key.pvk'),
		pfxPath = options.pfx && path.join(paths.appDir, options.pfx);

	wrench.mkdirSyncRecursive(paths.appDir);

	if (!sdkConfigs[options.sdk]) {
		log.fatal("Please specify a --sdk of " + Object.keys(sdkConfigs).join(', ') + ".");
	}

	// Check if we have a PFX file.
	if (!options.pfx) {
		options.pfx = 'DevelopmentKey.pfx';
		pfxPath = path.join(paths.appDir, options.pfx);
		var globalTestPfxPath = path.join(paths.homeDir, options.pfx);
		if (fs.existsSync(pfxPath)) {
			proceed();
		}
		else if (fs.existsSync(globalTestPfxPath)) {
			log.info('Using test certificate at ' + globalTestPfxPath.yellow + '!');
			fs.linkSync(globalTestPfxPath, pfxPath);
			proceed();
		}
		else {
			log.info('Creating a temporary certificate for you.');
			log.info('If asked for a password, please hit "None" (do not specify a password).');
			programs.makecert('/r /h 0 /eku "1.3.6.1.5.5.7.3.3,1.3.6.1.4.1.311.10.3.13" /e "10/01/2014" /sv "' + pvkPath + '" "' + paths.cerFile + '"', function madeCert(err) {
				if (err && err.code !== 'OK') {
					log.error('Failed to makecert for you: makecert.exe failed.');
					log.fatal(err);
				}
				log.info('Converting the certificate for app signing...');
				programs.pvk2pfx('/pvk "' + pvkPath + '" /spc "' + paths.cerFile + '" /pfx "' + pfxPath + '"', function madePfx(err) {
					if (err && err.code !== 'OK') {
						log.error('Failed to generate a test certificate for you: pvk2pfx.exe failed.');
						log.fatal(err);
					}
					log.info('Certificate created at ' + pfxPath.yellow + '!');
					fs.createReadStream(pfxPath).pipe(fs.createWriteStream(globalTestPfxPath));
					proceed();
				});
			});
		}
	}
	else if (!fs.existsSync(options.pfx)) {
		log.fatal("No pfx file exists at " + options.pfx.yellow + ". " + "Hint: Omit --pfx if you want to use a test certificate.".green);
	}
	else {
		if (!fs.existsSync(pfxPath)) {
			// Copy the PFX in to the project.
			fs.createReadStream(options.pfx).pipe(fs.createWriteStream(pfxPath));
		}
		proceed();
	}
};