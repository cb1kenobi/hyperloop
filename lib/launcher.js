/**
 * base class for Launcher
 */

function Launcher(options) {
	this.options = options;
}

Launcher.prototype.launch = function(options, args, callback) {
	throw new Error('not implemented');
};

exports.Launcher = Launcher;
