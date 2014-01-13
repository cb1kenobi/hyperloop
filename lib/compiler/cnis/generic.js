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

	sourcefile.processGeneric(node, args, type, mangled);

	return Uglify.parse(mangled, {
		filename: filename
	}).body[0].body;
};

function toName(arg) {
	return arg.value || arg.name;
}