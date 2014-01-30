var path = require('path'),
	appc = require('node-appc'),
	util = require('../util'),
	homeDir = util.writableHomeDirectory(),
	backend = 'wrl',
	templateDir = path.join(__dirname, backend, 'templates');

exports.fetch = function(options) {
	var destDir = path.resolve(options.dest),
		srcDir = appc.fs.resolvePath(options.src),
		name = options.name,
		appDir = path.join(destDir, name);

	return {
		srcDir: srcDir,
		homeDir: homeDir,
		templateDir: templateDir,
		destDir: destDir,
		appDir: appDir,
		cerFile: path.join(appDir, 'Test_Key.cer'),
		solutionFile: path.join(appDir, name + '.sln'),
		projectFile: path.join(appDir, name + '.vcxproj'),
		jscDir: path.join(homeDir, 'JavaScriptCore' + options.sdk),
		guidPath: path.join(destDir, 'guid')
	};
};
