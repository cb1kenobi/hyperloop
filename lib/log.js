/**
 * log utility
 */
var colors = require('colors'),
	stripColors = false,
	debugLevel = false;

function argsToArray(array) {
	var args = [];
	for (var c=0;c<array.length;c++) {
		var arg = array[c];
		args.push(stripColors && typeof(arg)==='string' ? arg.stripColors : arg);
	}
	return args;
}
/**
 * output msg to console but take into account --[no-]colors
 *
 * @param {String} msg the message to log
 */
function output() {
	var args = argsToArray(arguments),
		target = args[0];
	target.apply(this,args.slice(1));
}

exports.error = function error() {
	output.apply(this,[console.error,'[ERROR]'.red].concat(argsToArray(arguments)));
	process.exit(1);
}

exports.errorNoExit = function errorNoExit() {
	output.apply(this,[console.error,'[ERROR]'.red].concat(argsToArray(arguments)));
}

exports.debug = function debug() {
	debugLevel && output.apply(this,[console.log,'[DEBUG]'.grey].concat(argsToArray(arguments)));
}

exports.info = function info() {
	output.apply(this,[console.log,'[INFO]'.magenta].concat(argsToArray(arguments)));
}

exports.warn = function info() {
	output.apply(this,[console.log,'[WARN]'.cyan].concat(argsToArray(arguments)));
}

exports.console = function() {
	output.apply(this,[console.log].concat(argsToArray(arguments)));
}

exports.__defineSetter__('stripColors',function(value){
	stripColors = value;
});

exports.__defineSetter__('debugLevel',function(value){
	debugLevel = value;
});
