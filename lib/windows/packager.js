/**
 * Windows packaging
 */
var path = require('path'),
	ejs = require('ejs'),
	fs = require('fs'),
	os = require('os'),
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
			version: '3',
			checksum: 'ff61004236fc1141fdcf1a133c300f3deb70fdc1'
		}
	},
	urlFormat = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-sdk%s-v%s.zip';

exports.Packager = WinPackager;

function WinPackager(options) {
	Packager.call(this, options);
}
WinPackager.prototype.__proto__ = Packager.prototype;
WinPackager.prototype.validate = validate;
WinPackager.prototype.package = pkg;

/*
 Implementation.
 */
function validate(options, args, requiredFn, proceed) {
	!options.certname && (options.certname = 'CN=Test');
	!options.publisher && (options.publisher = 'Test');

	if (process.platform !== 'win32') {
		log.fatal('Packaging a Windows app requires being run on Windows.');
	}
	var osVersion = +os.release().split('.').slice(0, -1).join('.');
	if (osVersion < 6.2) {
		log.fatal('Packaging a Windows app requires Windows 8.0 or higher.');
	}
	var foundVisualStudio = false;
	for (var key in process.env) {
		if (process.env.hasOwnProperty(key)) {
			var match = key.match(/^VS(\d+)COMNTOOLS$/i);
			if (match && +match[1] >= 110) {
				foundVisualStudio = true;
				break;
			}
		}
	}
	if (!foundVisualStudio) {
		log.fatal('Packaging a Windows app requires Visual Studio 2012 or higher.');
	}

	var paths = Paths.fetch(options),
		pvkPath = path.join(paths.appDir, 'Test_Key.pvk'),
		pfxPath = options.pfx && path.join(paths.appDir, options.pfx);

	wrench.mkdirSyncRecursive(paths.appDir);

	if (!sdkConfigs[options.sdk]) {
		log.fatal("Please specify a --sdk of " + Object.keys(sdkConfigs).join(', ') + ".");
	}

	var count = 0;
	function initPfx() {
		// if after 3 tries we can't create a valid cert, give up
		if (count++ >= 3) {
			log.fatal('Unable to create a valid test certificate.');
		}

		// get potential cert paths
		pfxPath = path.join(paths.appDir, options.pfx);
		var globalTestPfxPath = path.join(paths.homeDir, options.pfx);

		// do we have a valid test cert in the build folder
		if (fs.existsSync(pfxPath) && fs.statSync(pfxPath).size > 0) {
			return proceed();
		}

		// if we have a valid global test cert, copy it in to the build folder
		else if (fs.existsSync(globalTestPfxPath) && fs.statSync(globalTestPfxPath).size > 0) {
			log.info('Using test certificate at ' + globalTestPfxPath.yellow + '!');
			util.copyFileSync(globalTestPfxPath, pfxPath);
			return proceed();
		}

		// if there's no valid test cert, create one
		else {

			// remove old/corrupt certs
			if (fs.existsSync(pfxPath)) { fs.unlinkSync(pfxPath); }
			if (fs.existsSync(globalTestPfxPath)) { fs.unlinkSync(globalTestPfxPath); }

			// create a cert
			log.info('Creating a temporary certificate for you.');
			log.info('If asked for a password, please hit "None" (do not specify a password).');
			programs.makecert('/r /h 0 /eku "1.3.6.1.5.5.7.3.3,1.3.6.1.4.1.311.10.3.13" /e "10/01/2014" /sv "' + pvkPath + '" "' + paths.cerFile + '"', function madeCert(err) {
				if (err && err.code !== 'OK') {
					log.error('Failed to makecert for you: makecert.exe failed.');
					log.fatal(err);
				}

				// convert the cert
				log.info('Converting the certificate for app signing...');
				programs.pvk2pfx('/pvk "' + pvkPath + '" /spc "' + paths.cerFile + '" /pfx "' + pfxPath + '"', function madePfx(err) {
					if (err && err.code !== 'OK') {
						log.error('Failed to generate a test certificate for you: pvk2pfx.exe failed.');
						log.fatal(err);
					}
					log.info('Certificate created at ' + pfxPath.yellow + '!');
					fs.createReadStream(pfxPath).pipe(fs.createWriteStream(globalTestPfxPath));

					// run this function again to assert the cert creation succeeded
					return initPfx();
				});
			});
		}
	}

	// Check if we have a PFX file.
	if (!options.pfx) {
		options.pfx = 'DevelopmentKey.pfx';
		return initPfx();
	}
	else if (!fs.existsSync(options.pfx)) {
		log.fatal("No pfx file exists at " + options.pfx.yellow + ". " + "Hint: Omit --pfx if you want to use a test certificate.".green);
	}
	else {
		if (!fs.existsSync(pfxPath)) {
			// Copy the PFX in to the project.
			fs.createReadStream(options.pfx).pipe(fs.createWriteStream(pfxPath));
		}
		return proceed();
	}
}

function pkg(options, args, callback) {
	log.info('Packaging...');
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
		config = JSON.parse(fs.readFileSync(path.join(paths.destDir, 'config.json'), 'utf8')),
		packageJSONPath = path.join(paths.srcDir, 'package.json'),
		packageJSON = !fs.existsSync(packageJSONPath) ? {} : JSON.parse(fs.readFileSync(packageJSONPath, 'utf8'));

	values.IDENTITY_NAME = options['identity-name'] || 'hyperlooptest.' + name;

	// Copy the current build's options in to the config.
	config.options = options;
	options.config = config;

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
			log.error('Downloading and extracting JavaScriptCore' + options.sdk + ' failed.');
			log.fatal(err);
		}

		if (util.isDirectory(paths.srcDir)) {
			var files = wrench.readdirSyncRecursive(paths.srcDir);
			config.hyperloopFiles = [];

			files.forEach(function(f) {
				if (f.indexOf('.') === 0 || f.indexOf(path.sep + '.') !== -1) {
					log.trace('Skipping ' + f);
					return;
				}
				var fp = path.join(paths.srcDir, f),
					isDir = fs.statSync(fp).isDirectory(),
					dest = path.join(paths.appDir, f);
				if (fp.indexOf(options.dest + path.sep) === 0 || fp.indexOf(path.sep + options.dest + path.sep) >= 0) {
					return;
				}

				// Recurse into directories.
				if (isDir) {
					return wrench.mkdirSyncRecursive(dest);
				}

				// track the source files
				if (!isDir && /\.(?:hjs|js|json)$/i.test(f) && f.indexOf('build\\' !== 0)) {
					config.hyperloopFiles.push(f);
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
				config.main_js = 'app.hjs';
				config.prefix = 'hl_';
				config.packageJSON = packageJSON;
				var template = fs.readFileSync(from, 'utf8'),
					filtered = util.filterString(template, values),
					templated = util.renderTemplate(filtered, config, __dirname, true);
				util.writeIfDifferent(to, templated);
			}
			else {
				to = path.join(paths.appDir, file);
				wrench.copyDirSyncRecursive(from, to);
			}
		});

		log.info(name.green + ' successfully packaged to:\n\t' + paths.solutionFile.green + '\n\n');
		if (options.launchide) {
			programs.start('"Visual Studio" /B "' + paths.solutionFile + '"', callback);
		}
		else {
			callback();
		}
	}
}
