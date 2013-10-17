/**
 * common utilities
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs');

exports.copyAndFilterEJS = copyAndFilterEJS;
exports.copyAndFilterString = copyAndFilterString;
exports.isDirectory = isDirectory;

function copyAndFilterEJS(from, to, obj) {
	var f = fs.readFileSync(from).toString(),
		o = ejs.render(f,obj);
	fs.writeFileSync(to, o);
}

function copyAndFilterString(from, to, obj) {
	var f = fs.readFileSync(from).toString();
	Object.keys(obj).forEach(function(key){
		var value = obj[key];
		f = f.replace(new RegExp(key,'g'),value);
	});
	fs.writeFileSync(to, f);
}

function isDirectory(file) {
	return fs.statSync(file).isDirectory();
}
