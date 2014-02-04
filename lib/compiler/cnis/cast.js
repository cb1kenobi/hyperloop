var ugly = require('uglify-js'),
	U = require('../utils'),
	generic = require('./generic');

function isArray(value) {
	return value && value.constructor.name === Array.prototype.constructor.name;
}

module.exports = function(node, sourcefile, build_opts, filename) {

	// Make sure we have a valid node with the right number of arguments
	if (!node || node.args == null || node.args.length != 2) {
		throw new Error('Invalid use of @cast. ' +
			'Must have two arguments, a type and an object. ' + U.nodeInfo(node));
	}

	// retrieve the value
	var argType = U.toValue(node.args[0], node, build_opts),
		argObject = U.toValue(node.args[1], node, build_opts);

	// Validate argument, if present
	if (typeof argType !== 'string') {
		if (typeof argType === 'object' && argType.hyperloop === 'generic') {
			var genericArgType = generic(argType, sourcefile, build_opts, filename);
			argType = genericArgType.name;
		}
		else {
			throw new Error('Invalid 1st parameter for @cast. Must be a string. ' + U.nodeInfo(node));
		}
	}
	else if (typeof argObject !== 'object') {
		throw new Error('Invalid 2nd parameter for @cast. Must be an object. ' + U.nodeInfo(node));
	}
	node.expression.name = node.expression.thedef.name = 'HyperloopCastTo' + argType.replace(/[&*^]/g, '');
	node.args = node.args.slice(1);
	sourcefile.processCast(node, argType, argObject, node.expression.name);

	return node;
};