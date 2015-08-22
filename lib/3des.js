/**
 * @file Des3 library, ecryption and decryption operations 
	only supported 3DES-ECB mode.
 * 3des module.
 * @version 1.0.0  
 * @requires module:fs  
 * @requires module:node-forge  
 */

var fs = require('fs');

var forge = require('node-forge');
var _ = require('underscore');

var ALGORITHM_3DES_ECB = '3DES-ECB'; // DEs algorithm only supported.


/**
 
 * Des3 Encryption algorithm. You can use encrption  and decryption.
 * @constructor Des3
 */
var Des3 = function() {
	var des3This = this;

	this.createKey = function(keyBase) {
		keyBase = keyBase || 'a/s4PvsTWK4q2urqYVv+dibQjwIERscg';
		var key = new Buffer(keyBase, 'base64');
		var keyBin = key.toString('binary');
		return keyBin;
	};
	/**
	 * @lends Des3
	 */
	/**
	 * Encrypt file by 3DES EBC Algorithm and write new file encrypted data.
	 * @method encryptFileWith3DES_ECB
	 * @this Des3
	 * @param {string} plainFilePath file that will be encrypted.
	 * @param {string} key using for encrytion.
	 * @param {string} encryptedFilePath file that will be created.
	 * @return Des3
	 * @memberof Des3
	 */
	this.encryptFileWith3DES_ECB = function(plainFilePath, key, encryptFilePath) {
		var data = fs.readFileSync(plainFilePath, {
			encoding: 'binary',
			mode: 0777
		});
		var cipher = forge.cipher.createCipher(ALGORITHM_3DES_ECB, key); // create cipher.
		cipher.start(); // start encryption.

		cipher.update(forge.util.createBuffer(data));
		cipher.finish(); // finish.
		var resBuf = new Buffer(cipher.output.data, 'binary');
		fs.writeFileSync(encryptFilePath, resBuf); // write file.
		return this;
	};
	/**
	 * Decrypt file by 3DES EBC Algorithm and write new file decrypted data.
	 * @method decryptFileWith3DES_ECB
	 * @this Des3
	 * @param {string} encryptFilePath file that will be decryted.
	 * @param {string} key using for decryption.
	 * @param {string} decryptedFilePath file that will be created.
	 * @return Des3
	 * @memberof Des3
	 */
	this.decryptFileWith3DES_ECB = function(encryptFilePath, key, decryptedFilePath) {
		var data = fs.readFileSync(encryptFilePath, {
			encoding: 'binary',
			mode: 0777
		});
		var cipher = forge.cipher.createDecipher(ALGORITHM_3DES_ECB, key); // create cipher.
		cipher.start(); // start encryption.
		cipher.update(forge.util.createBuffer(data));
		cipher.finish(); // finish.
		var resBuf = new Buffer(cipher.output.data, 'binary');
		fs.writeFileSync(decryptedFilePath, resBuf); // write file.// write file.
		return this;
	};
	/**
	 * @lends Des3
	 */
	/**
	 * Encrypt file by 3DES EBC Algorithm and write new file encrypted data.
	 * @method encryptFileWith3DES_ECB
	 * @this Des3
	 * @param {string} plainStr string that will be encrypted.
	 * @param {string} key using for encrytion.
	 * @return {string} encrytep hex content
	 * @memberof Des3
	 */
	this.encryptStrWith3DES_ECB = function(plainStr, key) {
		var cipher = forge.cipher.createCipher(ALGORITHM_3DES_ECB, key); // create cipher.
		cipher.start(); // start encryption.
		cipher.update(forge.util.createBuffer(plainStr));
		cipher.finish(); // finish.

		return new Buffer(cipher.output.data, 'binary');
	};
	/**
	 * Decrypt file by 3DES EBC Algorithm and write new file decrypted data.
	 * @method decryptFileWith3DES_ECB
	 * @this Des3
	 * @param {string} encryptStr string that will be decryted.
	 * @param {string} key using for decryption.
	 * @return {string} decrypted content.
	 * @memberof Des3
	 */
	this.decryptStrWith3DES_ECB = function(encryptStr, key) {
		var decipher = forge.cipher.createDecipher(ALGORITHM_3DES_ECB, key); // create cipher.
		decipher.start(); // start encryption.
		decipher.update(forge.util.createBuffer(encryptStr));
		decipher.finish(); // finish.
		return new Buffer(decipher.output.data, 'binary');
	};

	// encrypt  files in folder. returns array of encrypt content and name.
	this.encryptFilesInDirectory = function(directory, key) {
		var res = [];
		var err = {
			message: ''
		};

		if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
			err.message = 'parameter is not directory !';
			throw err;
		}
		if (key === '') {
			err.message = 'Invalid key check it !';
			throw err;
		}
		var files = fs.readdirSync(directory);
		_.each(files, function(item) {
			var encryptObj = {
				content: des3This.encryptStrWith3DES_ECB(fs.readFileSync(directory + '/' + item, {
					encoding: 'binary'
				}), key),
				name: item
			};
			res.push(encryptObj);
		});
		return res;
	}

};
/*  // TEST FOR DEBUG
var des =  new Des3();
var key = new Buffer('a/s4PvsTWK4q2urqYVv+dibQjwIERscg','base64').toString('binary');
console.log('KEY: '+key);
des.encryptFileWith3DES_ECB('Resources//config2.xml',key,'encryptedConfig.bin');
*/
module.exports = Des3;