var path = require('path'),
	fs = require('fs'),
	os = require('os'),
	appc = require('node-appc'),
	crypto = require('crypto'),
	log = require('../log'),
	clangparser = require('../clangparser'),
	programs = require('./programs'),
	buildlib = require('./buildlib'),
	finder = require('./finder'),
	Paths = require('./paths');

exports.run = function(options, headers, sourcefile, callback) {
	var paths = Paths.fetch(options),
		headerSearchPaths = finder.headerSearchPaths(paths, options.sdk),
		total = headers.length,
		remaining = total,
		mixed = {},
		bar;

	if (log.level !== 'quiet' && !log.shouldLog('debug')) {
		bar = new appc.progress('Parsing Headers [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: process.stdout.columns - 25,
			total: total
		});
	}
	// Let's get started!

	//return proceedSync();
	return proceedAsync();

	/*
	 Synchronous version of header processing:
	 Output is easier to understand.
	 */

	function updateStatus() {
		if (bar) {
			bar.tick();
		}
		else if (remaining !== 0) {
			log.debug(remaining + ' headers still need to be parsed.');
		}
	}

	function proceedSync() {
		//var h = headers[remaining - 1], // Parse headers in reverse order.
		var h = headers[headers.length - remaining], // Parse headers in order.
			found = findHeader(h);
		parseHeader(options, paths, headerSearchPaths, h, found, headerReadySync);
	}

	function headerReadySync(ast) {
		mixInAST(ast, mixed);
		remaining -= 1;
		updateStatus();
		remaining ? proceedSync() : allDone();
	}

	/*
	 Asynchronous version of header processing:
	 Much quicker.
	 */

	function proceedAsync() {
		for (var i = 0, iL = headers.length; i < iL; i++) {
			var h = headers[i],
				found = findHeader(h);
			parseHeader(options, paths, headerSearchPaths, h, found, headerReadyAsync);
		}
	}

	function headerReadyAsync(ast) {
		mixInAST(ast, mixed);
		remaining -= 1;
		updateStatus();
		if (!remaining) {
			if (bar) {
				// Wait for the bar to finish writing.
				setTimeout(allDone, 50);
			}
			else {
				allDone();
			}
		}
	}

	/*
	 Common methods to both versions of processing headers.
	 */

	function findHeader(h) {
		var found = finder.findHeader(paths, h, options.sdk);
		if (!found) {
			log.fatal('Failed to find header ' + h.yellow + '! Note that WinRT components should not be @imported.');
		}
		// Is it a local header?
		if (found.indexOf(paths.srcDir) >= 0) {
			// Do we have the .cpp?
			var cpp = found.substr(0, found.length - 2) + '.cpp';
			if (fs.existsSync(cpp)) {
				// Clang should parse that, instead.
				log.trace(h.bold + ' has a local ' + cpp.yellow + '; passing it to Clang, instead.');
				return cpp;
			}
		}
		return found;
	}

	function allDone() {
		process.stdout.write(os.EOL);
		log.info('All headers have been parsed!');
		log.debug('Parsed '
			+ Object.keys(mixed.classes).length + ' classes, '
			+ Object.keys(mixed.symbols).length + ' symbols, '
			+ 'and ' + Object.keys(mixed.types).length + ' types '
			+ 'from ' + headers.join(', ') + '.');
		sourcefile.imports = mixed;
		sourcefile.headers = headers;
		callback();
	}
};

function parseHeader(options, paths, headerSearchPaths, header, headerPath, parsed) {
	var args = [
			'-Xclang',
			'-ast-dump',
			'-w',
			'-fms-compatibility',
			'-fms-extensions',
			'-fmsc-version=' + sdkToMSCVersion(options.sdk),
			'-D_MSC_FULL_VER=' + sdkToMSCVersion(options.sdk) + '40219',
			'-D__cplusplus_winrt=true',
			'-ferror-limit=0', // Disable error limiting (some results are better than no results).
			headerSearchPaths.map(pathToInclude).join(' '),
			'--analyze',
			'-fno-color-diagnostics',
			'"' + headerPath + '"'
		],
	// Generate a checksum based on the arguments; we want it to be unique.
		clangOutputChecksum = crypto.createHash('sha1').update(
			/* Args */ args.join('') +
				/* Header */ fs.readFileSync(headerPath, 'utf8')
		).digest('hex'),
		parsedChecksum = crypto.createHash('sha1').update(
			clangOutputChecksum +
				/* Clang */ fs.readFileSync(path.join(__dirname, '..', 'clangparser.js'), 'utf8')
		).digest('hex'),
		stdOut = path.join(paths.destDir, header + '.' + clangOutputChecksum + '.out.txt'),
		stdErr = path.join(paths.destDir, header + '.' + clangOutputChecksum + '.err.txt'),
		resultCache = path.join(paths.destDir, header + '.' + parsedChecksum + '.ast.json');

	if (fs.existsSync(resultCache) && fs.statSync(resultCache).size !== 0) {
		log.debug('Using cached parsed clang results for ' + header.yellow + '.');
		return parsed(JSON.parse(fs.readFileSync(resultCache, 'utf8')));
	}

	if (fs.existsSync(stdOut) && fs.statSync(stdOut).size !== 0) {
		log.debug('Using cached clang raw output for ' + header.yellow + '...');
		parseClangOutput();
	}
	else {
		log.debug('Running clang on ' + header.yellow + '...');
		programs.clang(args.join(' ') + ' >"' + stdOut + '" 2>"' + stdErr + '"', parseClangOutput);
	}

	function parseClangOutput(err) {
		if (err && err.indexOf && err.indexOf('Could not find') >= 0) {
			log.error('Could not find ' + 'clang.exe'.bold + ' on your local system!');
			log.fatal('Please download and run the "Windows installer" from ' + 'http://llvm.org/builds/'.bold);
		}
		if (!fs.existsSync(stdOut) || fs.statSync(stdOut).size === 0) {
			log.error('Clang hit an error when processing ' + header.yellow + ':');
			log.error('Error log is available at: ' + stdErr.yellow);
			log.fatal('No output produced at: ' + stdOut.yellow + '!');
		}

		log.debug('Parsing clang results for ' + header.yellow + '...');
		clangparser.parseFile(buildlib, stdOut, function(err, ast) {
			if (err) {
				log.error('Failed to parse clang results for ' + header.yellow + ':');
				log.fatal(err);
			}
			else {
				var json = ast.toJSON();
				log.debug('Finished parsing ' + header.yellow + '!');
				fs.writeFileSync(resultCache, JSON.stringify(json));
				parsed(json);
			}
		});
	}
}

function mixInAST(ast, mixed) {
	for (var key in ast) {
		if (ast.hasOwnProperty(key)) {
			if (!mixed[key]) {
				mixed[key] = ast[key];
			}
			else {
				for (var innerKey in ast[key]) {
					if (ast[key].hasOwnProperty(innerKey)) {
						if (!mixed[key][innerKey]) {
							mixed[key][innerKey] = ast[key][innerKey];
						}
					}
				}
			}
		}
	}
}

function pathToInclude(p) {
	return '-I"' + p + '"';
}

function sdkToMSCVersion(sdk) {
	switch (sdk) {
		case '8.0':
			return '1700';
		case '8.1':
			return '1800';
		default:
			log.fatal('No msc version has not been specified for ' + sdk + ' in lib/windows/hparser.js!');
	}
}