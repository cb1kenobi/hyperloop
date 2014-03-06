/**
 * Windows launching.
 */
var fs = require('fs'),
	path = require('path'),
	os = require('os'),
	appc = require('node-appc'),
	wrench = require('wrench'),
	Launcher = require('../launcher').Launcher,
	log = require('../log'),
	programs = require('./programs'),
	Paths = require('./paths');

exports.Launcher = WinLauncher;

function WinLauncher(options) {
	Launcher.call(this, options);
}

// extend our base class
WinLauncher.prototype.__proto__ = Launcher.prototype;

WinLauncher.prototype.launch = function(options, args, callback) {
	var paths = Paths.fetch(options),
		filesToCompile = options.config.implementationsDelta.slice(0),
		total = filesToCompile.length,
		bar,
		msBuildStdOut,
		appPackages = path.join(paths.appDir, 'AppPackages'),
		name = options.name;

	log.info(name.green + ' is now being compiled...');
	if (log.level !== 'quiet' && !log.shouldLog('debug') && total) {
		log.info('(progress bar is only an estimate)');
		bar = new appc.progress('Compiling [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: process.stdout.columns - 19,
			total: total
		});
		msBuildStdOut = function() {
			log.debug.apply(log, arguments);
			var lines = arguments[0].trim().split('\n');
			for (var i = 0, iL = lines.length; i < iL; i++) {
				var line = lines[i].trim();
				if (filesToCompile.indexOf(line) >= 0) {
					bar.tick();
				}
			}
		};
	}

	return programs.msbuild('"' + paths.solutionFile + '" /p:Platform="Win32";Configuration=' + options.configuration, function didBuild(err) {
		if (err) {
			log.error('Project failed to build: msbuild returned an error.');
			log.fatal(err);
		}
		else {
			// Wait for the bar to finish writing.
			return uninstallApp();
		}
	}, { sdk: options.sdk, stdOut: msBuildStdOut });

	function uninstallApp() {
		if (fs.existsSync(paths.guidPath)) {
			var guid = fs.readFileSync(paths.guidPath),
				identityName = options['identity-name'] || 'hyperlooptest.' + options.name,
				cmd = '"get-appxpackage \'' + identityName + '*\' | remove-appxpackage"';

			programs.powershell(cmd, function(err) {
				if (err) {
					log.error('Failed to install the app.');
					log.fatal(err);
				}
				return findPackagePs1();
			});
		} else {
			return findPackagePs1();
		}
	}

	function findPackagePs1() {
		var canForce = false;
		var files = wrench.readdirSyncRecursive(appPackages).filter(function(f) {
			return f.match(/Add\-AppDevPackage\.ps1$/);
		});

		// did we find it?
		if (!files || !files.length) {
			log.debug('Could not find Add-AppDevPackage., trying AppX...');
			return findAppX();
		}
		var ps1File = path.join(appPackages, files[0]);

		programs.powershell(
			// make sure there's a valid dev license
			'"(Get-WindowsDeveloperLicense | Where-Object { $_.IsValid }).Count -gt 0 -and ' +
			// make sure there's a signed dev cert
			'(Get-AuthenticodeSignature (gci (Join-Path \'' + path.dirname(ps1File) + '\' \'*.appx\'))[0]).Status -eq \'Valid\'',
			function(err) {
				if (err) {
					canForce = false;
				}

				var cmd = '-ExecutionPolicy Unrestricted "& \'' + ps1File + '\'' + (canForce ? ' -Force' : '') + '"';
				programs.powershell(cmd, function(err) {
					if (err) {
						log.error('Failed to install the app.');
						log.fatal(err);
					}
					log.debug('App installed.');
					runAppX();
				});
			},
			{
				stdOut: function(data) {
					if (/True/.test(data)) {
						canForce = true;
					}
				},
				stdErr: function(data){}
			}
		);
	}

	function findAppX() {
		if (bar) {
			process.stdout.clearLine && process.stdout.clearLine();  // clear current text
			process.stdout.cursorTo && process.stdout.cursorTo(0);  // move cursor to beginning of line
		}
		log.info('Compilation finished!');

		var files = wrench.readdirSyncRecursive(appPackages).filter(function(f) {
			return f.match(/Debug\.appx$/);
		});
		if (!files || !files.length) {
			log.fatal('Could not find a generated Debug.AppX for your app.');
		}
		else {
			addAppX(path.join(appPackages, files[0]));
		}
	}

	function addAppX(at) {
		log.debug('Installing the app...');
		programs.powershell('"& Add-AppxPackage \'' + at + '\'"', function ran(err) {
			if (err) {
				var strErr = String(err).replace(/[\r\n]/g, ''),
					alreadyInstalled = strErr.match('Remove package ([^ ]+) before installing')
						|| strErr.match('Deployment of package ([^ ]+) was blocked because the provided package has the same identity')
						|| strErr.match('The conflicting package is ([^ ]+) and it was published by'),
					notTrusted = strErr.match('The root certificate of the signature in the app package or bundle must be trusted'),
					needsSideloading = strErr.match('or a sideloading-enabled system');
				if (notTrusted) {
					openPVK();
				}
				else if (needsSideloading) {
					askForSideloading();
				}
				else if (alreadyInstalled) {
					removeAppX(at, alreadyInstalled[1].trim());
				}
				else {
					log.error('Failed to install the app.');
					log.fatal(err);
				}
			}
			else {
				log.debug('App installed.');
				runAppX();
			}
		});
	}

	function openPVK() {
		var pfx = path.join(paths.appDir, options.pfx);
		log.error('You need to import the .pfx to LOCAL MACHINE in to the TRUSTED ROOT CERTIFICATION AUTHORITIES store.\n');
		log.error('\t1. For "Store Location" choose "Local Machine" and click "Next".');
		log.error('\t2. Approve any User Access Control prompts you receive.');
		log.error('\t3. For "File to Import" and "Private key protection", no changes are necessary. Click "Next" twice.');
		log.error('\t4. For "Certificate Store", choose "Place all certificates in the following store".');
		log.error('\t5. Click "Browse...".');
		log.error('\t6. Select "Trusted Root Certification Authorities" and click "OK".');
		log.error('\t7. Click "Next" then "Finish".\n');
		log.error('Opening the wizard for ' + pfx.bold);
		programs.explorer('"' + pfx + '"', function ran() {
			log.fatal('Please re-run hyperloop after successfully following the above instructions.');
		});
	}

	function askForSideloading() {
		var pfx = path.join(paths.appDir, options.pfx);
		log.error('You need to enable application sideloading on this machine.\n');
		log.error('In a moment, your Local Group Policy Editor should open..\n');
		log.error('\t1. Click to expand ' + 'Computer Configuration'.bold + ', ' + 'Administrative Templates'.bold + ', ' + 'Windows Components'.bold + ', and then ' + 'App Package Deployment'.bold + '.');
		log.error('\t2. Double-click the ' + 'Allow development of Windows Store apps without installing a developer license'.bold + ' setting.');
		log.error('\t3. In the Allow development of Windows Store apps without installing a developer license window, click ' + 'Enabled'.bold + ' and then click ' + 'OK'.bold + '.');
		log.error('\t4. Double-click the ' + 'Allow all trusted apps to install'.bold + ' setting.');
		log.error('\t5. In the Allow all trusted apps to install window, click ' + 'Enabled'.bold + ' and then click ' + 'OK'.bold + '.');
		log.error('Running ' + 'gpedit.msc'.bold);
		programs.gpedit('', function ran() {
			log.fatal('Please re-run hyperloop after successfully following the above instructions.');
		});
	}

	function removeAppX(at, oldID) {
		log.debug('Uninstalling an old version of the app...');
		programs.powershell('Remove-AppxPackage ' + oldID, function ran(err) {
			if (err) {
				log.error('Failed to uninstall your app.');
				log.error(err);
				log.fatal('Please manually uninstall the app before trying again.');
			}
			else {
				addAppX(at);
			}
		});
	}

	function runAppX() {
		programs.explorer(options.name.toLowerCase() + ':', function ran(err) {
			// TODO: Sometimes, it doesn't launch. Or it doesn't focus. Not sure which.
			log.info(name.green + ' successfully installed and launched:\n\t' + paths.solutionFile.green + '\n\n');
			tailLog();
		});
	}

	function tailLog() {
		programs.tasklist('/APPS /FO CSV /NH', function(err, stdout, stderr) {
			var identityName = options['identity-name'] || 'hyperlooptest.' + options.name,
				lines = stdout.split('\n')
				.map(function(line) {
					var csv = line.split(","),
						name = csv.pop().slice(1, -2),
						splitAroundID = name.split('__');
					return { id: splitAroundID[1], name: splitAroundID[0] };
				})
				.filter(function(app) {
					return app.id && app.name && app.name.indexOf(identityName) === 0;
				});
			if (lines.length === 0) {
				// TODO: Instead of a fatal error, maybe try running it again?
				log.fatal('Unable to find the app in the current task list.');
			}
			if (lines.length > 1) {
				log.info('More than one running process matches your app. Tailing log from the latest.');
				log.info(lines);
			}
			var appLog = path.resolve(process.env['AppData'] + '/../Local/Packages/' + identityName + '_' + lines.pop().id + '/LocalState/log.txt');
			// TODO: Make sure file exists.
			// TODO: If it doesn't... touch it?

			log.info('Tailing log:\r\n\t' + appLog.green);
			log.info('Waiting for log messages. Press ' + 'Ctrl + C'.bold.yellow + ' to stop.');
			log.info('');
			tailLog();

			function tailLog() {
				if (!fs.existsSync(appLog)) {
					setTimeout(tailLog, 1000);
				}
				else {
					programs.powershell('Get-Content -Path "' + appLog + '" -Wait', callback, {
						stdOut: function(data) {
							console.log(data.replace(/\r\n$/, ''));
						}
					});
				}
			}
		});
	}

};
