var ugly = require('uglify-js'),
	U = require('../utils');

module.exports = function(node, sourcefile, build_opts) {
	// Make sure we have a single object argument
	if (!node || node.args == null || node.args.length !== 1 || node.args[0].properties == null) {
		throw new Error('Invalid use of @compiler. Requires a single object parameter. ' + U.nodeInfo(node));
	}

	sourcefile.processCompiler(node, U.makeDictionaryFromArg(node.args[0], node, build_opts));
	return new ugly.AST_EmptyStatement();
};