/**
 * Windows packaging
 */
var Packager = require('../packager').Packager;


function WinPackager(options) {
	Packager.call(this,options);
};

// extend our base class
WinPackager.prototype.__proto__ = Packager.prototype;

Packager.prototype.package = function(options,args,callback) {
	callback();
};

Packager.prototype.validate = function(options,args,requiredFn) {
	requiredFn(options,'name','specify the name of the application');
};

exports.Packager = Packager;