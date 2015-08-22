var fs = require('fs');
var crypto = require('crypto');

var ALGO = 'des-ede3';
//var ALGO = '3des-ecb';
var PARAM_IV = new Buffer(0);
var KEY = createKey();

function createKey(keyBase) {
	keyBase = keyBase || 'a/s4PvsTWK4q2urqYVv+dibQjwIERscg';
	var key = new Buffer(keyBase, 'base64');
	key = key.toString('binary');
	return key;
}

function encrypt(key, data, autoPad) {
	autoPad = (autoPad) ? autoPad : false;
	var cipher = crypto.createCipheriv(ALGO, key, PARAM_IV);
	cipher.setAutoPadding(autoPad);
	var ciph = cipher.update(data, 'utf8', 'hex');
	ciph += cipher.final('hex');
	return ciph;
}

function decrypt(key, encryptedData, autoPad) {
	autoPad = (autoPad) ? autoPad : false;
	var decipher = crypto.createDecipheriv(ALGO, key, PARAM_IV);
	decipher.setAutoPadding(autoPad)
	var data = decipher.update(encryptedData, 'hex', 'utf8');
	data += decipher.final('utf8');
	return data;
}

function encryptFile(plainFilePath, key, encryptFilePath) {
	var data = fs.readFileSync(plainFilePath, {
		encoding: 'binary',
		mode: 0777
	});
	var encryptedData = encrypt(KEY, data, true);
	var resBuf = new Buffer(encryptedData, 'binary');
	fs.writeFileSync(encryptFilePath, resBuf); // write file.
}

function decryptFile(encryptFilePath, key, decryptedFilePath) {
	var data = fs.readFileSync(encryptFilePath, {
		encoding: 'binary',
		mode: 0777
	});
	var decryptedData = decrypt(KEY, data, true);
	var resBuf = new Buffer(decryptedData, 'binary');
	fs.writeFileSync(decryptedFilePath, resBuf); // write file.// write file.
}

function test_des() {
	//encrypt
	var autoPad = true;
	var key = createKey();
	var data = '99999999';
	var encryptedData = encrypt(key, data, autoPad);
	var decryptedData = decrypt(key, encryptedData, autoPad);
}

function test_files() {
	var toEncryptFilePath = '/Users/serkanserttop/codespace/github.com/smartface/emptysmf/node_modules/smartface-cli/experiment/test-des3/config2.xml';
	var toEncryptEncryptedFilePath = '/Users/serkanserttop/codespace/github.com/smartface/emptysmf/node_modules/smartface-cli/experiment/test-des3/config2-encrypt.xml';
	var toDecryptEncryptedFilePath = toEncryptEncryptedFilePath;
	var toDecryptDecryptedFilePath = '/Users/serkanserttop/codespace/github.com/smartface/emptysmf/node_modules/smartface-cli/experiment/test-des3/config2-encrypt-decrypt.xml';
	//var encrpytedData = encrypt()
	encryptFile(toEncryptFilePath, KEY, toEncryptEncryptedFilePath);
	decryptFile(toDecryptEncryptedFilePath, KEY, toDecryptDecryptedFilePath);
	// node experiment/test-des3/cli-en-de-crypt-smf.js encrypt /Users/serkanserttop/codespace/github.com/smartface/emptysmf/node_modules/smartface-cli/experiment/test-des3/config2.xml
	// node experiment/test-des3/cli-en-de-crypt-smf.js decrypt /Users/serkanserttop/codespace/github.com/smartface/emptysmf/node_modules/smartface-cli/experiment/test-des3/config2-encrypt.xml
}

module.exports = {
	createKey: createKey,
	decrypt: decrypt,
	encrypt: encrypt,
	decryptFile: decryptFile,
	encryptFile: encryptFile
};