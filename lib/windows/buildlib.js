exports.getSystemFrameworks = getSystemFrameworks;

function getSystemFrameworks(callback) {
	return callback(null, [], 'C:\\Program Files (x86)\\Microsoft Visual Studio 12.0\\VC\\include');
}