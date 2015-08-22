exports.SwapBytes = function(raw) {
	return (
		((raw & 0x000000FF) << 24) + ((raw & 0x0000FF00) << 8) + ((raw & 0x00FF0000) >> 8) + ((raw & 0xFF000000) >> 24)
	);
};

exports.initializeNestedArrayWithLength = function(len) {
	var q = [];
	for (var i = 0; i < len; i++) {
		q.push([]);
	}
	return q;
};

exports.getLastBufferSlice = function(buf) {
	return buf.slice(buf.length - 1);
};

exports.convertHexStringToBuffer = function(str) {
	return new Buffer(str, 'hex');
};