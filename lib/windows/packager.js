/**
 * Windows packaging
 */
var Packager = require('../packager').Packager,
	path = require('path'),
	fs = require('fs'),
	uuid = require('node-uuid'),
	appc = require('node-appc'),
	wrench = require('wrench'),
	log = require('../log'),
	util = require('../util'),
	backend = 'wrl',
	templateDir = path.join(__dirname,backend,'templates'),
	version = '1',
	url = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-'+version+'.zip';

exports.Packager = WinPackager;

function WinPackager(options) {
	Packager.call(this,options);
};

// extend our base class
WinPackager.prototype.__proto__ = Packager.prototype;


WinPackager.prototype.package = function(options,args,callback) {
	console.log(options);

	var destDir = path.resolve(options.dest),
		name = options.name,
		appDir = path.join(destDir,name),
		homeDir = util.writableHomeDirectory(),
		jscDir = path.join(homeDir,'JavaScriptCore'),
		values = {
			APPNAME: name,
			APPGUID: uuid.v4().toUpperCase(),
			INCLUDEDIR: path.resolve(jscDir).jscDir.replace('/','\\'),
			CERTNAME: options.certname,
			PUBLISHERNAME: options.publisher
		},

	wrench.mkdirSyncRecursive(appDir);

	util.downloadResourceIfNecessary('JavaScriptCore', version, url, '', destDir, function(err) {
		if (err) return callback(err);

		fs.readdir(path.join(templateDir),function(err,files){
			files.forEach(function(file){
				var f = path.join(templateDir,file);
				if (!util.isDirectory(f)) {
					var t = path.join(appDir,file.replace('App',name));
					log.debug('creating',t);
					util.copyAndFilterString(f,t,values);
				}
				else {
					var t = path.join(appDir,file);
					log.debug('creating',t);
					wrench.copyDirSyncRecursive(f,t);
				}
			});
		});

		var pfx = fs.readFileSync(options.pfx),
			outfile = path.join(appDir,name+'_Key.pfx');
		fs.writeFileSync(outfile,pfx);

		callback();
	});
};

WinPackager.prototype.validate = function(options,args,requiredFn) {
	requiredFn(options,'name','specify the name of the application');
	requiredFn(options,'thumbprint','specify the thumbprint');
	requiredFn(options,'certname','specify the CA Name (such as CN=Joe)');
	requiredFn(options,'pfx','specify the pfx file path');
	requiredFn(options,'publisher','specify the Publisher Display Name');

	if (!fs.existsSync(options.pfx)) {
		throw new Error("Couldn't find pfx file at "+options.pfx);
	}
};

