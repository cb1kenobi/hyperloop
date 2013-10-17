/**
 * Windows packaging
 */
var Packager = require('../packager').Packager,
	path = require('path'),
	fs = require('fs'),
	uuid = require('node-uuid'),
	wrench = require('wrench'),
	log = require('../log'),
	util = require('../util'),
	backend = 'wrl',
	templateDir = path.join(__dirname,backend,'templates'),
	jscVersion = '1',
	jscUrl = 'http://timobile.appcelerator.com.s3.amazonaws.com/jscore/JavaScriptCore-windows-'+jscVersion+'.zip';

exports.Packager = Packager;

function WinPackager(options) {
	Packager.call(this,options);
};

// extend our base class
WinPackager.prototype.__proto__ = Packager.prototype;

/**
 * download our JavaScriptCore pre-compiled package
 */
function downloadIfRequired(jscDir, callback) {

	var verFn = path.join(jscDir,'version.txt'),
		version = fs.existsSync(verFn) ? fs.readFileSync(verFn).toString() : null;

	if (version!==jscVersion) {
		var http = require('http'),
			url = require('url'),
			req = http.request(url.parse(jscUrl)),
			AdmZip = require('adm-zip'),
			ProgressBar = require('progress');

		if (!fs.existsSync(jscDir)) {
			fs.mkdir(jscDir);
		}

		req.on('response', function(res) {
			if (res.statusCode!=200) {
				return callback(new Error("error loading url: "+jscUrl+", status: "+res.statusCode));
			}
			var len = parseInt(res.headers['content-length'], 10),
				bar = new ProgressBar('  Downloading JavaScriptCore library'.magenta+' [:bar]'+' :percent :etas'.cyan, {
				complete: '=',
				incomplete: ' ',
				width: 50,
				total: len
			}),
			jsf = path.join(jscDir,'JavaScriptCore.tar.gz'),
			stream = fs.createWriteStream(jsf);
			bar.tick(0);

			res.on('data', function(chunk) {
				bar.tick(chunk.length);
				stream.write(chunk, encoding='binary');
			});

			res.on('end', function() {
				fs.writeFileSync(verFn,jscVersion);
				stream.close();
				log.info('extracting zip contents');
				var zip = new AdmZip(jsf);
				zip.extractAllTo(jscDir,true);
				fs.unlinkSync(jsf);
				callback();
			});
		});

		req.end();

	}
	else {
		callback();
	}
}

Packager.prototype.package = function(options,args,callback) {
	console.log(options);

	var destDir = path.resolve(options.dest),
		jscDir = path.join(destDir,'JavaScriptCore'),
		name = options.name,
		appDir = path.join(destDir,name),
		values = {
			APPNAME: name,
			APPGUID: uuid.v4().toUpperCase(),
			INCLUDEDIR: "..\\JavaScriptCore\\",
			CERTNAME: options.certname,
			PUBLISHERNAME: options.publisher
		};
	
	wrench.mkdirSyncRecursive(appDir);

	downloadIfRequired(jscDir,function(err){
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

Packager.prototype.validate = function(options,args,requiredFn) {
	requiredFn(options,'name','specify the name of the application');
	requiredFn(options,'thumbprint','specify the thumbprint');
	requiredFn(options,'certname','specify the CA Name (such as CN=Joe)');
	requiredFn(options,'pfx','specify the pfx file path');
	requiredFn(options,'publisher','specify the Publisher Display Name');

	if (!fs.existsSync(options.pfx)) {
		throw new Error("Couldn't find pfx file at "+options.pfx);
	}
};

