/**
 * implementation Uint16Array
 */

exports.Uint16Array = Uint16Array;

Uint16Array.prototype = new ArrayBufferView();
Uint16Array.prototype.constructor = Uint16Array;

const TYPE = 'Uint16Array';
const SIZE = JSBuffer.SIZE_OF_SHORT;
const METHOD = 'Short';

function Uint16Array() {
	var arg1 = arguments[0],
		type = typeof arg1;

	switch(type) {
		case 'number': {
			var buf = new ArrayBuffer(arg1,SIZE);
			ArrayBufferView.call(this,TYPE,SIZE,buf,0,arg1,buf.length,METHOD);
			break;
		}
		case 'object': {
			if (arg1 instanceof ArrayBufferView) {
				var buf = arg1.buffer.slice(0);
				ArrayBufferView.call(this,TYPE,SIZE,buf,0,buf.length,buf.length,METHOD);
			}
			else if (arg1 instanceof ArrayBuffer) {
				var byteOffset = arguments[1] || 0,
					length = arguments[2] || arg1.length,
					buf = arg1.slice(byteOffset,length);
				ArrayBufferView.call(this,TYPE,SIZE,buf,byteOffset,length,buf.length,METHOD);
			}
			else if (arg1 instanceof Object && arg1.constructor.name===Array.prototype.constructor.name) {
				var buf = new ArrayBuffer(arg1.length,SIZE);
				for (var c=0;c<arg1.length;c++) {
					var e = arg1[c],
						v = typeof(e)==='number' ? e : parseInt(e);
					buf._buffer.putShort(v,c);
				}
				ArrayBufferView.call(this,TYPE,SIZE,buf,0,buf.length,buf.length,METHOD);
			}
			else {
				throw new Exception("unknown first argument (object type, but none of supported) passed to "+TYPE);
			}
			break;
		}
		case 'undefined': {
			var buf = new ArrayBuffer(0,SIZE);
			ArrayBufferView.call(this,TYPE,0,buf,0,buf.length,0,METHOD);
			break;
		}
		default: {
			throw new Exception("unknown first argument ("+type+") passed to "+TYPE);
		}
	}
}

Object.defineProperty(Uint16Array,'BYTES_PER_ELEMENT',{
	enumerable: true,
	configurable: false,
	get: function() {
		return SIZE;
	}
});
