/**
 * DataView interface
 *
 * FIXME: endianess is ignored for now
 */

exports.DataView = DataView;

function DataView(buffer,offset,length) {
	if (buffer instanceof ArrayBufferView) {
		buffer = buffer._buffer;
	}
	else if (buffer instanceof ArrayBuffer) {
		// good		
	}
	else {
		throw new Exception("unknown type passed: "+typeof(buffer));
	}
	this._buffer = buffer;
	this._offset = offset || 0;
	this._length = length || buffer.length;
}

DataView.prototype.getInt8 = function(offset) {
	var result = this._buffer._buffer.toChar(this._offset+(offset||0));
	return result.charCodeAt(0);
};

DataView.prototype.getUint8 = function(offset) {
	var result = this._buffer._buffer.toChar(this._offset+(offset||0));
	return result.charCodeAt(0);
};

DataView.prototype.getInt16 = function(offset, littleEndian) {
	return this._buffer._buffer.toShort(this._offset+(offset||0));
};

DataView.prototype.getUint16 = function(offset, littleEndian) {
	return this._buffer._buffer.toShort(this._offset+(offset||0));
};

DataView.prototype.getInt32 = function(offset, littleEndian) {
	return this._buffer._buffer.toInt(this._offset+(offset||0));
};

DataView.prototype.getUint32 = function(offset, littleEndian) {
	return this._buffer._buffer.toInt(this._offset+(offset||0));
};

DataView.prototype.getFloat32 = function(offset, littleEndian) {
	return this._buffer._buffer.toFloat(this._offset+(offset||0));
};

DataView.prototype.getFloat64 = function(offset, littleEndian) {
	return this._buffer._buffer.toDouble(this._offset+(offset||0));
};

DataView.prototype.setInt8 = function(offset, value) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	v = String.fromCharCode(v);
	this._buffer._buffer.putChar(v, this._offset + (offset||0));
};

DataView.prototype.setUint8 = function(offset, value) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	v = String.fromCharCode(v);
	this._buffer._buffer.putChar(v, this._offset + (offset||0));
};

DataView.prototype.setInt16 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	this._buffer._buffer.putShort(v, this._offset + (offset||0));
};

DataView.prototype.setUint16 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	this._buffer._buffer.putShort(v, this._offset + (offset||0));
};

DataView.prototype.setInt32 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	this._buffer._buffer.putInt(v, this._offset + (offset||0));
};

DataView.prototype.setUint32 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseInt(value);
	this._buffer._buffer.putInt(v, this._offset + (offset||0));
};

DataView.prototype.setFloat32 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseFloat(value);
	this._buffer._buffer.putFloat(v, this._offset + (offset||0));
};

DataView.prototype.setFloat64 = function(offset, value, littleEndian) {
	var v = typeof(value)==='number' ? value : parseFloat(value);
	this._buffer._buffer.putDouble(v, this._offset + (offset||0));
};
