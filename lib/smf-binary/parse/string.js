var helpers = require('../utils/helpers');

function convertStringIntoSmfBinFormat(str, log_console) {
	var byte_length = Buffer.byteLength(str, 'utf8');
	var PRECEDING_INT_BYTE_SIZE_PADDING = 2;
	var buf = new Buffer(PRECEDING_INT_BYTE_SIZE_PADDING + byte_length);
	var swappedBytes = helpers.SwapBytes(byte_length);
	var INT_BYTE_SIZE = 4;
	var bufIntLength = new Buffer(INT_BYTE_SIZE);
	bufIntLength.writeInt32LE(swappedBytes);
	var slicedIntBuf = bufIntLength.slice(bufIntLength.length - PRECEDING_INT_BYTE_SIZE_PADDING);
	buf = slicedIntBuf;
	if (str.length > 0) {
		buf = Buffer.concat([slicedIntBuf, new Buffer(str)]);
	}
	if (log_console) {
		console.log(str, buf);
	}
	return buf;
}

module.exports = convertStringIntoSmfBinFormat;