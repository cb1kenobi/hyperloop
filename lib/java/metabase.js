/**
 * wrapper around the Java metabase generator
 */
var fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn,
	wrench = require('wrench'),
	log = require('../log'),
	metabase;

function getTargetClassDir() {
	var dir;
	switch(process.platform) {
		case 'darwin': {
			dir = path.join(process.env.HOME,'Library','Application Support','org.appcelerator.hyperloop');
			break;
		}
		case 'win32': {
			dir = path.join(process.env.HOMEPATH || process.env.USERPROFILE,'.hyperloop');
			break;
		}
		default: {
			dir = path.join(process.env.HOME,'.hyperloop');
			break;
		}
	}
	wrench.mkdirSyncRecursive(dir);
	return dir;
}

function compileIfNecessary(cp, callback) {
	var outdir = getTargetClassDir(),
		classFile = path.join(outdir,'JavaMetabaseGenerator.class');
	if (fs.existsSync(classFile)) {
		return callback(null);
	}
	else {
		var p = spawn('javac',['-source','1.6','-target','1.6','-cp',cp,path.join(__dirname,'JavaMetabaseGenerator.java'),'-d',outdir],{env:process.env}),
			err = '';

		p.stderr.on('data', function(buf){
			err+=buf.toString();
		});
		p.on('close',function(exitCode){
			callback(exitCode===0 ? null : err);
		});
	}
}

/**
 * generate a buffer
 */
function generate(classPath, callback) {

	// cache it in memory
	if (metabase) return callback(null, metabase);

	classPath = typeof(classPath)==='string' ? [classPath] : classPath;

	var cp = [path.join(__dirname,'bcel-5.2.jar'),path.join(__dirname,'json.jar'),path.join(__dirname), getTargetClassDir()].concat(classPath).join(path.delimiter);

	compileIfNecessary(cp, function(err){
		if (err) return callback(err);
		var p = spawn('java',['-Xmx1G','-classpath',cp,'JavaMetabaseGenerator'],{env:process.env}),
			out = '',
			err = '';
		p.stdout.on('data',function(buf){
			out+=buf.toString();
		});

		p.stderr.on('data',function(buf){
			err+=buf.toString();
		});

		p.on('close',function(exitCode){
			metabase = out;
			callback(exitCode===0 ? null : err, out);
		});
	});
}

/**
 * generate a JSON object
 */
function generateJSON(classPath, callback) {
	generate(classPath,function(err,buffer){
		if (err) return callback(err);
		return callback(null, JSON.parse(buffer));
	});
}

/**
 * generate a File
 */
function generateFile(classPath, file, callback) {
	generate(classPath,function(err,buffer){
		if (err) return callback(err);
		fs.writeFileSync(file, buffer);
		callback(null, file);
	});
}

exports.generate = generate;
exports.generateJSON = generateJSON;
exports.generateFile = generateFile;

if (module.id===".") {
	var androidPath = '/opt/android/platforms/android-17/android.jar';
	generate(androidPath, function(err,buf){
		if (err) {
			log.fatal(err);
		}
		log.log(buf);
		process.exit(0);
	});
}
