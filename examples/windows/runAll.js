var fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	examples = fs.readdirSync(__dirname).filter(function(f) { return f.indexOf('.js') === -1; }),
	inReverse = process.argv.indexOf('--reverse') !== -1,
	child;

runNextExample();

function runNextExample() {
	if (0 === examples.length) {
		console.log('[RUN-ALL] All done!');
		return setTimeout(process.exit, 500); // Give us a bit of time to make sure the 'taskkill' finishes.
	}
	var example = examples[inReverse ? 'pop' : 'shift'](),
		exampleName = example.substr(0, 1).toUpperCase() + example.slice(1),
		command = 'hyperloop launch --src=' + path.join(__dirname, example) + ' --log-level=trace',
		stopTimeout,
		stopTriggers = [ 'Waiting for log messages.' ];

	example === 'life' && stopTriggers.push('done populating cells.');

	console.log('[RUN-ALL] ' + exampleName + ' is up next.');
	child = exec(command, { maxBuffer: Number.MAX_VALUE }, function() {});
	child.stdout.on('data', watchForLaunched);

	function watchForLaunched(data) {
		data && console.log(data);
		if (!stopTimeout && data && data.indexOf(stopTriggers[0]) >= 0) {
			stopTriggers.shift();
			if (0 === stopTriggers.length) {
				console.log('[RUN-ALL] ' + exampleName + ' launched.  Waiting 5 seconds before moving on.');
				stopTimeout = setTimeout(stopCurrentExample, 5 * 1000);
			}
		}
	}
}

function stopCurrentExample() {
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
		runNextExample();
	});
}