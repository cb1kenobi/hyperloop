var should = require('should'),
	fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	examplesDir = path.resolve('examples/windows/'),
	examples = fs.readdirSync(examplesDir).filter(function(f) { return f.indexOf('.js') === -1; }),
	child;

// Only run this particular suite on Windows.
if (process.platform === 'win32') {
	describe('ui', function() {
		this.timeout(3 * 60 * 1000);
		examples.forEach(function(example) {
			it('should run ' + example, function(done) {
				var stopping = false,
					src = path.join(examplesDir, example),
					command = 'hyperloop launch --log-level=trace --debug --src="' + src + '"',
					stopTriggers = [ 'Waiting for log messages.' ];

				example === 'life' && stopTriggers.push('done populating cells.');

				child = exec(command, { maxBuffer: Number.MAX_VALUE }, watchForExit);
				child.stderr.on('data', watchForError);
				child.stdout.on('data', watchForLaunched);

				function watchForError(err) {
					if (!stopping) {
						console.error(err);
						stopping = true;
						child && child.kill && child.kill();
						done(new Error(err));
					}
				}

				function watchForLaunched(data) {
					// data && console.log(data);
					if (!stopping && data && data.indexOf(stopTriggers[0]) >= 0) {
						stopTriggers.shift();
						// TODO: Validate logs more.
						if (0 === stopTriggers.length) {
							stopping = true;
							stopCurrentExample(done);
						}
					}
				}

				function watchForExit(err) {
					if (!stopping) {
						stopping = true;
						done(new Error(err));
					}
				}
			});
		});
	});
}

function stopCurrentExample(cb) {
	return setTimeout(function() {
		exec('tasklist /APPS /FO CSV /NH', function(err, stdout) {
			var identityName = 'hyperlooptest.App',
				lines = stdout.split('\n')
					.map(function(line) {
						var csv = line.split(","),
							name = csv[csv.length - 1].slice(1, -2),
							splitAroundID = name.split('__'),
							pid = csv[1] && csv[1].slice(1, -1);
						return { id: splitAroundID[1], pid: pid, name: splitAroundID[0] };
					})
					.filter(function(app) {
						return app.id && app.pid && app.name && app.name.indexOf(identityName) === 0;
					});
			for (var i = 0, iL = lines.length; i < iL; i++) {
				exec('taskkill /PID ' + lines[i].pid, function() {});
			}
			child && child.kill && child.kill();
			cb();
		});
	}, 5 * 1000);
}