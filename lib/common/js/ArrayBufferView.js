/**
 * ArrayBufferView interface
 */

exports.ArrayBufferView = ArrayBufferView;

function ArrayBufferView(type,bytes_per_element,buffer,byteOffset,byteLength,count,methodType,filter) {
	this._buffer = buffer;
	this._byteOffset = byteOffset||0;
	this._BYTES_PER_ELEMENT = bytes_per_element||0;
	this._type = type || 'ArrayBufferView';
	methodType && this.defineArrayAccessors(count,methodType,filter);
}

ArrayBufferView.prototype.toString = function() {
	return '[object '+this._type+']';
};

Object.defineProperty(ArrayBufferView.prototype,'buffer',{
	enumerable: true,
	configurable: false,
	get: function() {
		return this._buffer;
	}
});

Object.defineProperty(ArrayBufferView.prototype,'byteOffset',{
	enumerable: true,
	configurable: false,
	get: function() {
		return this._byteOffset;
	}
});

Object.defineProperty(ArrayBufferView.prototype,'byteLength',{
	enumerable: true,
	configurable: false,
	get: function() {
		return this._buffer.byteLength;
	}
});

Object.defineProperty(ArrayBufferView.prototype,'length',{
	enumerable: true,
	configurable: false,
	get: function() {
		return this._buffer.length;
	}
});

const EMPTY = function(){};

ArrayBufferView.prototype.defineArrayAccessors = function (length, methodType, filter) {
	var obj = this;
	for (var c=0;c<length;c++) {
		(function(index){
			obj.__defineGetter__(index,function(){
				var result = obj._buffer._buffer['to'+methodType](index);
				if (methodType==='Char') {
					result = result.charCodeAt(0);
				}
				return filter ? filter('get',result) : result;
			});
			obj.__defineSetter__(index,function(value){
				value = filter ? filter('set',value) : value;
				if (methodType==='Char') {
					value = String.fromCharCode(value);
				}
				obj._buffer._buffer['put'+methodType](value,index);
			});
		})(c);
	}
	// define up to 10 elements passed our length as not supporting set
	for (var c=length;c<length+10;c++) {
		obj.__defineSetter__(c,EMPTY);
		obj.__defineGetter__(c,EMPTY);
	}
}
