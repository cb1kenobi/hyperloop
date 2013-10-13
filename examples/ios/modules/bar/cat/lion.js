console.log('hello inside lion.js = 1');

var Lion = function() {
};
Lion.prototype.sound = function() {
	return 'roar!';
};

module.exports = Lion;
