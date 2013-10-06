var ugly = require('uglify-js'),
	U = require('../utils');

module.exports = function(node, sourcefile, build_opts) {
	// make sure it has 0 or 1 integer argument
	var value = U.toValue();

	// Make sure we have a valid node with the right number of arguments
	if (!node || node.args == null || node.args.length < 0 || node.args.length > 1) {
		throw new Error('Invalid use of @memory. ' +
			'Must have no arguments, or a single integer argument. ' + U.nodeInfo(node));
	}

	// Validate argument, if present
	if (node.args.length === 1) {
		var value = U.toValue(node.args[0], node);
		if (typeof value !== 'number' || value % 1 !== 0) {
			throw new Error('Invalid parameter for @memory. Must be an integer. ' + U.nodeInfo(node));
		}
	}

	// load memory symbols
	sourcefile.requiresMemory();

	// create a new node for JSBuffer
	var newCall = ugly.parse('new JSBuffer()').body[0].body;
	newCall.args = node.args;
	return newCall;
};