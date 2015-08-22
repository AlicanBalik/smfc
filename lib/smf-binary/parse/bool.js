var helpers = require('../utils/helpers');
var intParser = require('./int');

function skippedListBuffer() {
	var buf = new Buffer([0, 0, 0, 0]);
	return buf;
}

function bitSet(list) {
	//console.log(list);
	var swappedBytes = helpers.SwapBytes(list.length);
	var INT_BYTE_SIZE = 4;
	var PRECEDING_INT_BYTE_SIZE_PADDING = 2;
	var bufIntLength = new Buffer(INT_BYTE_SIZE);
	bufIntLength.writeInt32LE(swappedBytes);
	var slicedIntBuf = bufIntLength.slice(bufIntLength.length - PRECEDING_INT_BYTE_SIZE_PADDING);
	//console.log('list header', list, slicedIntBuf);

	var bufLists = [],
		outstanding = false,
		buf, bits_initial, bits;
	for (var i = 0; i < list.length; i++) {
		var value = list[i];
		switch (i % 8) {
			case 0:
				bits = 128 * value;
				outstanding = true;
				break;
			case 1:
				bits |= 64 * value;
				break;
			case 2:
				bits |= 32 * value;
				break;
			case 3:
				bits |= 16 * value;
				break;
			case 4:
				bits |= 8 * value;
				break;
			case 5:
				bits |= 4 * value;
				break;
			case 6:
				bits |= 2 * value;
				break;
			case 7:
				bits |= 1 * value;
				bufLists.push(bits);
				outstanding = false;
				break;
		}
	}
	if (outstanding) {
		//console.log('bits', bits);
		bufLists.push(bits);
		//bufLists.push(parseInt(bits, 16));
	}
	//console.log('bufLists', bufLists);
	var buf = new Buffer(bufLists.length);
	for (var i = 0; i < bufLists.length; i++) {
		buf.writeUInt8(bufLists[i]);
	}
	buf = Buffer.concat([slicedIntBuf, buf]);
	//console.log('bitSet', list, buf, slicedIntBuf);
	return buf;
}

function handleList(list) {
	//console.log(list);
	if (list.length === 0) {
		return new Buffer([0x00]);
	}
	var bitList = [];
	for (var i = 0; i < list.length; i++) {
		var row = list[i];
		bitList.push(parseInt(row[1]));
	}
	//console.log('handleList', list, bitList);
	return bitSet(bitList);
}

exports.bitSet = bitSet;
exports.handleList = handleList;
exports.skippedListBuffer = skippedListBuffer;