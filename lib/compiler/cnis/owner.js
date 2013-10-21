var ugly = require('uglify-js');

module.exports = function(node, sourcefile, build_opts, filename) {
	// process the owner
	var jsName = (node.args[0] || {}).name,
		nativeName = (node.args[1] || {}).name;

	// validate names
	if (!jsName || !nativeName) {
		throw new Error('Invalid use of @owner. Requires 2 parameters. ' + U.nodeInfo(node));
	}

	// pass owner to sourcefile
	sourcefile.processOwner(node, jsName, nativeName);

	// create a new node for HL$TrackOwner
	var newCall = ugly.parse('HL$TrackOwner()', {
		filename: filename
	}).body[0].body;
	newCall.args = node.args;
	return newCall;
};