var ugly = require('uglify-js'),
	U = require('util/utils'),
	bufferCount=0;

function isArray(value) {
	return value && value.constructor.name===Array.prototype.constructor.name;
}

module.exports = function(node, sourcefile, build_opts, filename) {

	// Make sure we have a valid node with the right number of arguments
	if (!node || node.args == null || node.args.length < 0 || node.args.length > 1) {
		throw new Error('Invalid use of @memory. ' +
			'Must have no arguments, or a single integer or array argument. ' + U.nodeInfo(node));
	}

	// retrieve the value
	var value = node.args.length ? U.toValue(node.args[0],node,build_opts) : null;

	// Validate argument, if present
	if (typeof value === 'number' && (value % 1 !== 0 || value===0)) {
		throw new Error('Invalid parameter for @memory. Must be an integer if specifying a number (>0). ' + U.nodeInfo(node));
	}
	else if (value!==null && typeof value === 'object' && !isArray(value)) {
		throw new Error('Invalid parameter for @memory. Must be an array if specifying an object. ' + U.nodeInfo(node));
	}
	else if (typeof value === 'undefined' || typeof value === 'null') {
		value = null;
	}
	else if (typeof value !== 'object' && typeof value !== 'number') {
		throw new Error('Invalid parameter for @memory. Must be an array if specifying an object or integer >0. ' + U.nodeInfo(node));
	}

	// record the memory buffer
	var symbolName = 'JSBuffer'+(bufferCount++);
	sourcefile.processMemory(node,value,symbolName);

	// create a new node for JSBuffer
	var newCall = ugly.parse(symbolName, {
		filename: filename
	}).body[0].body;
	newCall.args = node.args;
	return newCall;
};