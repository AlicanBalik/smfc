var fs = require('fs');
var mkdirp = require('mkdirp');
var parsers = require('./parse');
var utility = require('../utility');
var killProcess = utility.killProcess;
var generateUUID = utility.generateUUID;
var Des3 = require('../3des');

function createSmfBinaryFiles(playerSpecific, confObj, saveDir, callback) {
	var PLAYER_VERSION = playerSpecific.PLAYER_VERSION;
	var attributes = playerSpecific.json_attr.Application.string[0].attributes;
	var smfObj = playerSpecific.getSmfBinaryStructure();

	var configAffectingBuffers = {
		splash: [],
		data: []
	};
	var uuids = {
		splash: generateUUID(),
		data: generateUUID()
	};
	for (var i = 0; i < attributes.length; i++) {
		var key = attributes[i];
		var buf;
		if (key === 'UUID') {
			buf = parsers.string(uuids.data);
			configAffectingBuffers.data.push(buf);
			buf = parsers.string(uuids.splash);
			configAffectingBuffers.splash.push(buf);
		} else {
			buf = parsers.string(confObj[key])
			configAffectingBuffers.data.push(buf);
			configAffectingBuffers.splash.push(buf);
		}
	}

	var hex_str_buf0_data = new Buffer(smfObj[0].data, 'hex');
	var hex_str_buf0_splash = new Buffer(smfObj[0].splash, 'hex');
	var hex_str_buf1_splash = Buffer.concat(configAffectingBuffers.splash);
	var hex_buf1_splash = new Buffer(hex_str_buf1_splash, 'hex');
	var hex_str_buf1_data = Buffer.concat(configAffectingBuffers.data);
	var hex_buf1_data = new Buffer(hex_str_buf1_data, 'hex');
	var hex_str_buf2_data = new Buffer(smfObj[2].data, 'hex');
	var hex_str_buf2_splash = new Buffer(smfObj[2].splash, 'hex');
	var hex_str_buf3_both = new Buffer(smfObj[3].both, 'hex');
	var hex_str_buf4_data = new Buffer(smfObj[4].data, 'hex');
	var bufferData = Buffer.concat([hex_str_buf0_data, hex_buf1_data, hex_str_buf2_data, hex_str_buf3_both, hex_str_buf4_data]);
	var bufferSplash = Buffer.concat([hex_str_buf0_splash, hex_buf1_splash, hex_str_buf2_splash, hex_str_buf3_both]);

	var des3 = new Des3();
	var encryptKey = des3.createKey();

	fs.writeFile(saveDir + 'data-unencrypted.smf', bufferData, function() {
		fs.writeFile(saveDir + 'splash-unencrypted.smf', bufferSplash, function() {
			des3.encryptFileWith3DES_ECB(saveDir + 'data-unencrypted.smf', encryptKey, saveDir + 'data.smf');
			des3.encryptFileWith3DES_ECB(saveDir + 'splash-unencrypted.smf', encryptKey, saveDir + 'splash.smf');
			callback();
		});
	});
}

function create(data, callback) {
	if (data.args.platform === 'win32') {
		// workspace is not valid
		return callback();
	}
	if (!data.PLAYER_VERSION) {
		data.PLAYER_VERSION = '4.4.0';
	}
	var playerSpecific = require('./data/' + data.PLAYER_VERSION + '/index');
	var confObj = playerSpecific.createConfObject(data);
	var args = data.processedArgs;
	var saveDir;
	if (data.args.task === 'android-full-publish') {
		saveDir = data.androidConfig.androidConfig.input.builder.tmpFolder;
	} else if (data.args.task === 'ios-full-publish') {
		saveDir = data.processedArgs.outputTempFolder;
	}

	mkdirp(saveDir, function(err) {
		if (err) {
			killProcess(err);
		} else {
			createSmfBinaryFiles(playerSpecific, confObj, saveDir, callback);
		}
	});
}

exports.create = create;