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
	version = '1',
	checksum = '399ace9876be068c35a30fded0b78e5a9ab589e8',
	url = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-' + version + '.zip';

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
		homeDir = util.writableHomeDirectory(),
		jscDir = path.join(homeDir, 'JavaScriptCore'),
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

	util.downloadResourceIfNecessary('JavaScriptCore', version, url, checksum, homeDir, function(err) {
		if (err) {
			return callback(err);
		}

		fs.readdir(path.join(templateDir), function(err, files) {

			var config = JSON.parse(fs.readFileSync(path.join(destDir, 'config.json'), 'utf8'));
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

			//var pfx = fs.readFileSync(options.pfx),
			//	outfile = path.join(appDir,name+'_Key.pfx');
			//fs.writeFileSync(outfile,pfx);

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

	// Finally, check if we have a PFX file.
	if (!options.pfx) {
		options.pfx = 'Test_Key.pfx';
		pfxPath = path.join(appDir, options.pfx);
		if (fs.existsSync(pfxPath)) {
			proceed && proceed();
		}
		else {
			console.log('Creating a temporary certificate for you. Please follow the prompts.');
			programs.makecert('-sv "' + pvkPath + '" -n "' + options.certname + '" "' + cerPath + '"', function madeCert(err) {
				if (err && err.code !== 'OK') {
					console.error(err);
					throw 'Failed to makecert for you: ' + err;
				}
				console.log('Converting the certificate for app signing...');
				programs.pvk2pfx('-pvk "' + pvkPath + '" -spc "' + cerPath + '" -pfx "' + pfxPath + '" -po toto', function madePfx(err) {
					if (err && err.code !== 'OK') {
						console.error(err);
						throw 'Failed to generate a test certificate for you: ' + err;
					}
					proceed && proceed();
				});
			});
		}
	}
	else if (!fs.existsSync(options.pfx)) {
		throw new Error("Couldn't find pfx file at " + options.pfx);
	}
	else {
		fs.createReadStream(options.pfx).pipe(fs.createWriteStream(pfxPath));
	}
};