/**
 * Windows packaging
 */
var Packager = require('../packager').Packager,
	path = require('path'),
	ejs = require('ejs'),
	fs = require('fs'),
	appc = require('node-appc'),
	wrench = require('wrench'),
	log = require('../log'),
	util = require('../util'),
	programs = require('./programs'),
	backend = 'wrl',
	templateDir = path.join(__dirname, backend, 'templates'),
	homeDir = util.writableHomeDirectory(),
	versions = {
		'8.0': '1',
		'8.1': '1'
	},
	checksums = {
		'8.0': '399ace9876be068c35a30fded0b78e5a9ab589e8',
		'8.1': 'TODO'
	},
	urlFormat = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-sdk%s-v%s.zip';

exports.Packager = WinPackager;

function WinPackager(options) {
	Packager.call(this, options);
}

// extend our base class
WinPackager.prototype.__proto__ = Packager.prototype;

WinPackager.prototype.package = function(options, args, callback) {
	var destDir = path.resolve(options.dest),
		name = options.name,
		appDir = path.join(destDir, name),
		jscDir = path.join(homeDir, 'JavaScriptCore' + options.sdk),
		guidPath = path.join(destDir, 'guid'),
		values = {
			APPNAME: name,
			APPGUID: (fs.existsSync(guidPath) && fs.readFileSync(guidPath, 'utf8')) || util.guid(),
			LIBDIR: path.resolve(path.join(jscDir)).replace('/', '\\'),
			INCLUDEDIR: path.resolve(path.join(jscDir, 'include')).replace('/', '\\'),
			CERTNAME: options.certname,
			PFX: options.pfx,
			PUBLISHERNAME: options.publisher
		};

	fs.writeFileSync(guidPath, values.APPGUID);

	log.debug('writing JavaScriptCore into', jscDir.cyan);
	wrench.mkdirSyncRecursive(appDir);
	
	var version = versions[options.sdk],
		checksum = checksums[options.sdk],
		url = require('util').format(urlFormat, options.sdk, version);
	
	// TODO: We need to build JSC with VS2013 targeting WP8.1, and upload it as JavaScriptCore-windows-sdk8.1-v1.zip.
	url = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-' + version + '.zip';

	util.downloadResourceIfNecessary('JavaScriptCore' + options.sdk, version, url, checksum, homeDir, function(err) {
		if (err) {
			return callback(err);
		}

		fs.readdir(path.join(templateDir), function(err, files) {

			var config = JSON.parse(fs.readFileSync(path.join(destDir, 'config.json'), 'utf8'));
			config.options = options;
			files.forEach(function(file) {
				var from = path.join(templateDir, file),
					to;
				if (!util.isDirectory(from)) {
					to = path.join(appDir, file.replace('App', name));
					var template = fs.readFileSync(from, 'utf8'),
						filtered = util.filterString(template, values),
						templated = ejs.render(filtered, config);
					util.writeIfDifferent(to, templated);
				}
				else {
					to = path.join(appDir, file);
					wrench.copyDirSyncRecursive(from, to);
				}
			});

			callback();
		});
	});
};

WinPackager.prototype.validate = function(options, args, requiredFn, proceed) {
	requiredFn(options, 'name', 'specify the name of the application');
	!options.certname && (options.certname = 'CN=Test');
	!options.publisher && (options.publisher = 'Test');

	var destDir = path.resolve(options.dest),
		name = options.name,
		appDir = path.join(destDir, name),
		pvkPath = path.join(appDir, 'Test_Key.pvk'),
		cerPath = path.join(appDir, 'Test_Key.cer'),
		pfxPath = options.pfx && path.join(appDir, options.pfx);
	
	wrench.mkdirSyncRecursive(appDir);
	
	// TODO: Once we've uploaded an 8.1 JSC, we can targeting 8.1 with hyperloop.
	if (!{ '8.0': true, '8.1': false }[options.sdk]) {
		log.fatal("Please specify a --sdk of " + '8.0'.yellow + ".");
	}

	// Check if we have a PFX file.
	if (!options.pfx) {
		options.pfx = 'Test_Key.pfx';
		pfxPath = path.join(appDir, options.pfx);
		var globalTestPfxPath = path.join(homeDir, options.pfx);
		if (fs.existsSync(pfxPath)) {
			proceed();
		}
		else if (fs.existsSync(globalTestPfxPath)) {
			log.info('Using test certificate at ' + globalTestPfxPath.yellow + '!');
			fs.createReadStream(globalTestPfxPath).pipe(fs.createWriteStream(pfxPath));
			proceed();
		}
		else {
			log.info('Creating a temporary certificate for you. Please follow the prompts.');
			programs.makecert('-sv "' + pvkPath + '" -n "' + options.certname + '" "' + cerPath + '"', function madeCert(err) {
				if (err && err.code !== 'OK') {
					log.error('Failed to makecert for you: makecert.exe failed.');
					log.fatal(err);
				}
				log.info('Converting the certificate for app signing...');
				programs.pvk2pfx('-pvk "' + pvkPath + '" -spc "' + cerPath + '" -pfx "' + pfxPath + '" -po toto', function madePfx(err) {
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