/**
 * common utilities
 */
var _ = require('underscore'),
	fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	appc = require('node-appc'),
	uuid = require('node-uuid'),
	wrench = require('wrench'),
	log = require('./log'),
	crypto = require('crypto');

// module interface

exports.copyAndFilterEJS = copyAndFilterEJS;
exports.copyAndFilterString = copyAndFilterString;
exports.filterString = filterString;
exports.copyFileSync = copyFileSync;
exports.downloadResourceIfNecessary = downloadResourceIfNecessary;
exports.escapePaths = escapePaths;
exports.guid = guid;
exports.isDirectory = isDirectory;
exports.sha1 = sha1;
exports.writableHomeDirectory = writableHomeDirectory;
exports.setTemplateDefaultArgs = setTemplateDefaultArgs;
exports.renderTemplate = renderTemplate;
exports.writeIfDifferent = writeIfDifferent;

// implementation

const ignoreList = /\.(CVS|svn|git|DS_Store)$/;

function copyAndFilterEJS(from, to, obj) {
	obj = obj || {};
	if (!from || !to) {
		throw new TypeError('Bad arguments. from and to must be defined as strings.');
	}

	var content = fs.readFileSync(from).toString();
	writeIfDifferent(to, ejs.render(content, obj));
}

function copyAndFilterString(from, to, obj) {
	obj = obj || {};
	if (!from || !to) {
		throw new TypeError('Bad arguments. from and to must be defined as strings.');
	}
	var template = fs.readFileSync(from, 'utf8'),
		filtered = filterString(template, obj);
	writeIfDifferent(to, filtered);
}

function filterString(contents, obj) {
	Object.keys(obj).forEach(function(key) {
		var value = obj[key];
		contents = contents.replace(new RegExp(key, 'g'), value);
	});
	return contents;
}

/**
 * copy srcFile to destFile and optionally, filter based on function
 */
function copyFileSync(srcFile, destFile, filter) {
	if (!srcFile || !destFile) {
		throw new TypeError('Bad arguments. srcFile and destFile must be defined as strings.');
	}

	if (!ignoreList.test(srcFile)) {

		// if we have a filter and it passed or if we don't have one at all
		if (!filter || (typeof(filter)==='function' && filter(srcFile, destFile))) {

			// copy file
			var contents = fs.readFileSync(srcFile);
			fs.writeFileSync(destFile, contents);

			// set permissions to that of original file
			var stat = fs.lstatSync(srcFile);
			fs.chmodSync(destFile, stat.mode);

			log.debug('copying', srcFile.cyan, 'to', destFile.cyan);
		}
	}
}

function escapePaths(cmd) {
	cmd = cmd || '';
	if (!_.isString(cmd)) {
		throw new TypeError('Bad argument, must be a string');
	}
	return cmd.replace(/(["\s'$`\\])/g,'\\$1');
}

function guid() {
	return uuid.v4().toUpperCase();
}

/**
 * returns true if file path is a directory
 */
function isDirectory(file) {
	return fs.statSync(file).isDirectory();
}

/**
 * return the sha1 of the contents string
 */
function sha1(contents) {
	return crypto.createHash('sha1').update((contents || '').toString()).digest('hex');
}

/**
 * return a writeable home directory for hyperloop
 */
function writableHomeDirectory() {
	var dir;

	if (process.platform === 'darwin') {
		dir = path.join(process.env.HOME,'Library','Application Support','org.appcelerator.hyperloop');
	}
	else {
		dir = path.join(appc.fs.home(),'hyperloop');
	}
	if (!fs.exists(dir)) {
		wrench.mkdirSyncRecursive(dir);
	}
	return dir;
}

/**
 * download a pre-build third-party tool / library
 */
function downloadResourceIfNecessary(name, version, url, checksum, dir, callback) {

	if (!name || !version || !url || !checksum || !dir) {
		throw new TypeError('Bad argument. name, version, url, checksum, and dir are not optional and must be a defined');
	}

	var verFn = path.join(dir,name+'-version.txt'),
		zf = path.join(dir,name+'.zip'),
		zipdir = path.join(dir,name),
		localVersion = fs.existsSync(verFn) ? fs.readFileSync(verFn).toString() : null,
		resultExists = name !== 'ios-sim' || fs.existsSync(path.join(zipdir, name));

	if (version !== localVersion || !resultExists) {
		var http = require('http'),
			urllib = require('url'),
			req = http.request(urllib.parse(url)),
			hash = crypto.createHash('sha1');

		if (!fs.existsSync(zipdir)) {
			wrench.mkdirSyncRecursive(zipdir);
		}

		req.on('response', function(res) {
			if (res.statusCode !== 200) {
				return callback(new Error("error loading url: "+url+", status: "+res.statusCode));
			}
			var len = parseInt(res.headers['content-length'], 10),
				stream = fs.createWriteStream(zf),
				bar;

			// workaround appc.progressbar's lack of a quiet option
			var msgRaw = '  Downloading ' + name + ' library' + ' [] ' + ' :percent :etas',
				msg = '  Downloading ' + name + ' library'.magenta + ' [:bar]' + ' :percent :etas'.cyan,
				originalMsg = msg,
				progressWidth = process.stdout.columns - msgRaw.length;
			if (progressWidth <= 5) {
				msgRaw = '  Downloading ' + ' :percent :etas';
				msg = '  Downloading [:bar]' + ' :percent :etas'.cyan;
				progressWidth = process.stdout.columns - msgRaw.length;
			}
			if (progressWidth <= 5) {
				log.info(originalMsg.split('[:bar')[0]);
				msg = ':bar';
				progressWidth = process.stdout.columns - 5;
			}
			// TODO: send PR to node-appc to add quiet option to progressbar
			if (log.level !== 'quiet') {
				bar = new appc.progress(msg, {
					complete: '=',
					incomplete: ' ',
					width: progressWidth,
					total: len
				});
			} else {
				bar = { tick: function(){} };
			}

			bar.tick(0);

			res.on('data', function(chunk) {
				bar.tick(chunk.length);
				hash.update(chunk);
				stream.write(chunk, 'binary');
			});
			
			var closed = false,
				checked = false;
			stream.once('close', function() {
				closed = true;
				performChecks();
			});

			res.on('end', function() {
				if (!closed) {
					stream.once('drain', performChecks);
					stream.end();
				}
				else {
					performChecks();
				}
			});
			
			function performChecks() {
				if (checked) {
					return;
				}
				checked = true;
				stream.close();
				if (log.level !== 'quiet') {
					process.stdout.clearLine && process.stdout.clearLine();  // clear current text
					process.stdout.cursorTo && process.stdout.cursorTo(0);  // move cursor to beginning of line
					process.stdout.write(process.platform === 'win32' ? '\r\n\r\n' : '\n');
				}

				var checkChecksum = hash.digest('hex');
				if (checkChecksum !== checksum) {
					return callback(new Error("Invalid checksum (" + checkChecksum + ") received, expected (" + checksum + ") for " + url));
				}
				log.info('extracting zip contents');
				appc.zip.unzip(zf, zipdir, function(err) {
					if (err) { return callback(err); }
					log.debug('unzip completed, contents should be in', zipdir);
					fs.writeFileSync(verFn, version);
					fs.unlink(zf, callback);
				});
			}
		});

		req.end();

	}
	else {
		callback();
	}
}

/*
 Variable state for setTemplateDefaultArgs and renderTemplate.
 */
var templateCache = {},
	templateDefaultArgs = {};

/**
 *
 * @param args
 */
function setTemplateDefaultArgs(args) {
	templateDefaultArgs = args;
}

/**
 * Flexibly renders an EJS template, such that the template can render other templates relative to its directory, and
 * using the args passed in plus the args passed once to this module's 'setTemplateDefaultArgs' method.
 * @param name The string name of the template, relative to the current directory, such as "templates/class_header.ejs"
 * @param args The args dictionary to pass to the template renderer, which will be mixed with the template defaults.
 * @param dirname The optional current dirname of the script. Defaults to the parent template's provided dirname, or
 *                __dirname, which will be relative to this util module. (Generally, you want to pass this if you're
 *                calling this from a JS file, and don't pass it if calling from an EJS.)
 * @param nameIsTemplateContents If true, the "name" param will be treated as a string template instead of as a path to
 *                               the template.
 */
function renderTemplate(name, args, dirname, nameIsTemplateContents) {
	args = _.defaults(args || {}, this.renderTemplateArgs || {}, templateDefaultArgs);
	var template;
	if (nameIsTemplateContents) {
		template = name;
	} else {
		template = templateCache[name];
		if (!template) {
			template = templateCache[name] = fs.readFileSync(path.join(dirname
				|| this.renderTemplateDirName
				|| __dirname, name)).toString();
		}
	}
	args.renderTemplate = renderTemplate;
	args.renderTemplateArgs = args;
	args.renderTemplateDirName = dirname;
	var result = ejs.render(template, args);
	if (!nameIsTemplateContents && log.shouldLog('debug') && name.indexOf('.ejs') >= 0) {
		result = '/* START ' + name + ' */\n'
			+ result
			+ '\n/* END ' + name + ' */';
	}
	return result;
}

/**
 * If the file at path contains different contents than the supplied "contents" string, or if it doesn't exist, write.
 * @param path
 * @param contents
 */
function writeIfDifferent(path, contents) {
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, contents);
		log.debug('created', path.white);
		return true;
	}
	else if (fs.readFileSync(path, 'utf8') != contents) {
		fs.writeFileSync(path, contents);
		log.debug('modified', path.white);
		return true;
	}
	return false;
}