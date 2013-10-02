var ugly = require('uglify-js'),
	U = require('../utils');

module.exports = function(node, sourcefile) {
	// Make sure we have one argument
	if (!node || node.args == null || node.args.length !== 1) {
		throw new Error('Invalid use of @import. Must have a single string argument. ' + U.nodeInfo(node));
	}

	// Make sure it's a string
	var value = U.toValue(node.args[0], node);
	if (typeof value !== 'string') {
		throw new Error('Invalid @import parameter. Must be a string. ' + U.nodeInfo(node));
	}

	sourcefile.processImport(node, value);
	return new ugly.AST_EmptyStatement();
};