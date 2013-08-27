/**
 * wrapper around the Java metabase generator
 */
var fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn,
	metabase;


function compileIfNecessary(cp, callback) {
	var classFile = path.join(__dirname,'JavaMetabaseGenerator.class');
	if (fs.existsSync(classFile)) {
		return callback(null);
	}
	else {
		var process = spawn('javac',['-cp',cp,path.join(__dirname,'JavaMetabaseGenerator.java'),'-d',__dirname]),
			err = '';

		process.stderr.on('data', function(buf){
			err+=buf.toString();
		});
		process.on('close',function(exitCode){
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

	var cp = [path.join(__dirname,'bcel-5.2.jar'),path.join(__dirname,'json.jar'),path.join(__dirname)].concat(classPath).join(path.delimiter);

	compileIfNecessary(cp, function(err){
		if (err) return callback(err);
		var process = spawn('java',['-classpath',cp,'JavaMetabaseGenerator']),
			out = '',
			err = '';
		process.stdout.on('data',function(buf){
			out+=buf.toString();
		});

		process.stderr.on('data',function(buf){
			err+=buf.toString();
		});

		process.on('close',function(exitCode){
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
			console.error(err);
			process.exit(1);
		}
		console.log(buf);
		process.exit(0);
	});
}
