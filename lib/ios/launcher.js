/**
 * iOS Launching
 */
var Launcher = require('../launcher').Launcher,
	path = require('path'),
	log = require('../log'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec,
	buildlib = require('./buildlib'),
	util = require('../util'),
	version = '1',
	checksum = 'c17d918f30c212e0642e4c33650bfb654493120b', // calculated sha1 on file buffer
	url = 'http://timobile.appcelerator.com.s3.amazonaws.com/ios-sim/ios-sim-' + version + '.zip';

function iOSLauncher(options) {
	Launcher.call(this, options);
}

// extend our base class
iOSLauncher.prototype.__proto__ = Launcher.prototype;

/**
 * launch the ios simulator
 */
function executeSimulator(name, build_dir, settings, callback, callback_logger, hide) {

	var homeDir = util.writableHomeDirectory();

	util.downloadResourceIfNecessary('ios-sim', version, url, checksum, homeDir, function(err) {
		if (err) {
			log.error('Failed to download ios-sim');
			log.fatal(err);
		}
		var ios_sim = path.join(homeDir, 'ios-sim', 'ios-sim'),
			args = ['launch', build_dir, '--sdk', settings.version, '--retina'];

		log.debug('launch ios-sim with args:', args.join(' ').grey);
		var simulator = spawn(ios_sim, args);

		var logOut = /^\[(INFO|DEBUG|WARN|TRACE|ERROR|FATAL)\] ([\s\S]*)/,
			prefix = name + '[';

		function splitLogs(buf, err) {
			buf.split(/\n/).forEach(function(line) {
				if (line.indexOf('\n') != -1) {
					return splitLogs(line, err);
				}
				var m = line.indexOf(prefix);
				if (m != -1) {
					var e = line.indexOf(']', m);
					line = line.substring(e + 2);
					var match = logOut.exec(line);
					if (match) {
						var label = match[1],
							content = match[2];
						// if our content still has an embedded log level, recurse to remove it
						if (logOut.test(content)) {
							return splitLogs(content);
						}
						switch (label) {
							case 'INFO':
							{
								if (callback_logger && callback_logger.info) {
									return content && callback_logger.info(content);
								}
								return log.info(content);
							}
							case 'TRACE':
							case 'DEBUG':
							{
								if (callback_logger && callback_logger.debug) {
									return content && callback_logger.debug(content);
								}
								return log.debug(content);
							}
							case 'WARN':
							case 'FATAL':
							case 'ERROR':
							{
								if (callback_logger && callback_logger.error) {
									return content && callback_logger.error(content);
								}
								return log.error(content);
							}
						}
					}
					else {
						if (callback_logger && callback_logger.info) {
							return line && callback_logger.info(line);
						}
						log.info(line);
					}
				}
				else if (err) {
					if (/AssertMacros: queueEntry/.test(line)) {
						return;
					}
					if (/Terminating in response to SpringBoard/.test(line)) {
						return callback();
					}
					if (callback_logger && callback_logger.error) {
						callback_logger.error(line);
					}
					else {
						log.info(line);
					}
				}
			});
		}

		function logger(data, err) {
			var buf = String(data).trim();
			splitLogs(buf, err);
		}

		simulator.stderr.on('data', function(data) {
			logger(data, true);
		});

		simulator.stdout.on('data', logger);

		simulator.on('close', function() {
			callback && callback();
		});

		if (!hide) {
			// bring forward the simulator window
			var scpt = path.join(__dirname, 'iphone_sim_activate.scpt'),
				asa = path.join(settings.xcodePath, 'Platforms', 'iPhoneSimulator.platform', 'Developer', 'Applications', 'iPhone Simulator.app'),
				cmd = 'osascript "' + path.resolve(scpt) + '" "' + asa + '"';
			exec(cmd);
		}
	});
}

Launcher.prototype.launch = function(options, args, callback) {
	var arch = /(i386|simulator)/.test(options.arch || 'i386') ? 'i386' : 'armv7',
		platform = /(i386|simulator)/.test(arch) ? 'simulator' : 'os',
		safeName = options.safeName,
		builddir = path.resolve(options.dest),
		appdir = path.join(builddir, 'build', 'Release-iphone' + platform, safeName + '.app');

	if (options.packageType === 'module') {
		log.fatal('launch command is not supported for modules, yet.');
	}
	if (platform !== 'simulator') {
		log.fatal('launch command is not supported for ' + platform.bold);
	}

	buildlib.getXcodeSettings(function(err, settings) {
		if (err) {
			return callback(err);
		}
		executeSimulator(options.name, appdir, settings, callback, options.logger, options.hide);
	});
};

exports.Launcher = iOSLauncher;