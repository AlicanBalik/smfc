var helpers = require('../utils/helpers');

function convertIntegerIntoSmfBinFormat(attrName, attrValue, isHex, log_console) {
	function skipLastDescriptor(attrValue) {
		return parseInt(attrValue.substr(0, attrValue.length - 1));
	}
	var itemValue = 0,
		is_negative = false;
	if (attrValue === '') {
		itemValue = -1;
	} else {
		if (isHex) {
			itemValue = parseInt('0x' + attrValue);
			//itemValue = strtoul(attrValue.c_str(), NULL, 16);//HexStrToInt(attrValue.c_str());
		} else {
			if (attrValue === '%') {
				itemValue = -1;
				itemValue = itemValue & 0x9FFFFFFF;
			} else if (attrValue.indexOf('%') !== -1) {
				itemValue = skipLastDescriptor(attrValue);
				itemValue = (itemValue & 0x9FFFFFFF) | 0x20000000;
			} else if (attrValue.indexOf('d') !== -1) {
				itemValue = skipLastDescriptor(attrValue);
				itemValue = (itemValue & 0x9FFFFFFF) | 0x40000000;
			} else if (attrValue.indexOf('p') !== -1) {
				itemValue = skipLastDescriptor(attrValue);
				itemValue = itemValue | 0x60000000;
			} else {
				if (attrName == "X" || attrName == "Y" || attrName == "W" ||
					attrName == "H" || attrName == "HdrH" || attrName == "ItemHeight") {
					itemValue = parseInt(attrValue);
					itemValue = itemValue & 0x9FFFFFFF;
				} else {
					// sybian v3 uid exceeds int range, read as
					// unsigned and the cast to int type, players should read
					// the AppID by ignoring sign bit :KD
					itemValue = parseInt(attrValue);
					if (itemValue < 0) {
						//itemValue = (itemValue >>> 0);
						is_negative = true;
						//itemValue = ((1 << 32) - itemValue);
					}
					//itemValue = attrValue.ToInt();
				}
			}
		}
	}

	var PRECEDING_INT_BYTE_SIZE_PADDING = 2;
	var INT_BYTE_SIZE = 4;
	var swappedBytes = helpers.SwapBytes(itemValue);
	var buf = new Buffer(INT_BYTE_SIZE);
	if (is_negative) {
		buf.writeInt32LE(itemValue);
	} else {
		buf.writeInt32LE(swappedBytes);
	}
	//var slicedIntBuf = buf.slice(buf.length - PRECEDING_INT_BYTE_SIZE_PADDING);
	return buf;
}

module.exports = convertIntegerIntoSmfBinFormat;