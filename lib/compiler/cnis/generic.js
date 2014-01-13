var Uglify = require('uglify-js'),
	U = require('../utils');

function isArray(value) {
	return value && value.constructor.name === Array.prototype.constructor.name;
}

module.exports = function(node, sourcefile, build_opts, filename) {
	// Make sure we have a valid node with the right number of arguments
	if (!node || node.args == null || node.args.length < 2) {
		throw new Error('Invalid use of @generic. ' +
			'Must have two or more arguments. ' + U.nodeInfo(node));
	}

	var args = node.args.map(toName),
		type = args[0] + '<' + args.slice(1).join(', ') + '>',
		mangled = args[0] + '$' + args.slice(1).join('_').replace(/[\^*]/ig, '') + '$';

	node.expression.name = node.expression.thedef.name = mangled;
	sourcefile.processGeneric(node, args, type, mangled);
	
	// Truncate args; we don't need them at runtime.
	node.args.length = 0;
	
	console.log(node);
	process.exit(0);
	
	return node;
};

function toName(arg) {
	return arg.value || arg.name;
}