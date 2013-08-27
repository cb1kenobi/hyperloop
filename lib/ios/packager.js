var Packager = require('../packager').Packager,
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path');

function iOSPackager(options) {	
	Packager.call(this,options);
};

// extend our base class
iOSPackager.prototype.__proto__ = Packager.prototype;

exports.Packager = Packager;