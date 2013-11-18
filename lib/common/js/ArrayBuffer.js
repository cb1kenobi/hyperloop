/**
 * ArrayBuffer interface
 */
exports.ArrayBuffer = ArrayBuffer;

function ArrayBuffer(length,bytes_per) {
	if (typeof(length)==='number') {
		this._buffer = new JSBuffer(length*(bytes_per||1));
		this._length = length||0;
		this._bytes_per = bytes_per||1;
	}
	else {
		this._buffer = length;
	}
}

ArrayBuffer.prototype.toString = function() {
	return '[object ArrayBuffer]';
};

ArrayBuffer.prototype.slice = function(begin,end) {
	var newlength = Math.min(this._length,end||this._length)-begin;
	var newbuf = this._buffer.slice(begin,newlength*this._bytes_per);
	var buf = new ArrayBuffer(newbuf);
	buf._length = newlength;
	buf._bytes_per = this._bytes_per;
	return buf;
};

ArrayBuffer.isView = function(view) {
	return view instanceof ArrayBufferView;
};

Object.defineProperty(ArrayBuffer.prototype,'byteLength',{
	enumerable: true,
	configurable: false,
	get: function() {
		return (this._buffer && this._buffer.length) || 0;
	}
});

Object.defineProperty(ArrayBuffer.prototype,'length',{
	enumerable: true,
	configurable: false,
	get: function() {
		return this._length;
	}
});
