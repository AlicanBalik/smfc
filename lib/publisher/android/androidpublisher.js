/**
 * @file Include Android publisher steps operations.
 * @version 1.0.0
 * @requires module:fs
 * @require module:child_process
 */
var fs = require('fs');
var spawn = require('child_process').spawnSync;
var path = require('path');

var _ = require('underscore');
var unzip = require('unzip');

var Parser = require('../../xmltojson');
var utility = require('../../utility');
var copy = require('../../copy');
var ConfigObjects = require('../../config/index');
var Configuration = require('../../configuration').Configuration;
var logger = require('../../log/log4j').getLogger('AndroidPublisher'); // logger.
var Des3 = require('../../3des');

var Config = ConfigObjects.Config;
var Config2 = ConfigObjects.Config2;
var AndroidConfig = ConfigObjects.android;

var des3 = new Des3();
var configuration = new Configuration();

var stdOut, stdErr;
var err = {
	err: '',
	msg: ''
};

function commandGenerator(identifier_string, lambda) {
	return function() {
		var child = lambda();
		logger.debug(identifier_string + ' : ' + child && (child.output && (child.output.toString('utf8'))));
		if (!utility.controlChildProcess(child)) {
			logger.error('\t' + identifier_string + ': ' + child.output.toString('utf8'));
			err.err = 'child error';
			err.msg = identifier_string + ': ' + child.output.toString('utf8');
			utility.killProcess(err);
		}
	}
}

/**
 *  Android Publisher   extract apk, build apk ...
 * @constructor AndroidPublisher
 */
var AndroidPublisher = function() {
	var androidConfigInput;
	var androidConfigOutput;
	var KEY;
	var manifest;
	var config2;
	var project;
	var tmpdir = null;


	/**
	 * start publish by config object.
	 * @method startPublish
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 * @throws {Error} during the control config object.
	 */
	this.startPublish = function(config, data) {

		utility.controlConfig(config);
		control_Config2_AndroidConfig(config);
		tmpdir = data.moduleGlobals.tmpdir;
		config2 = config.config2;
		androidConfigInput = config.androidConfig.input;
		androidConfigOutput = config.androidConfig.output;
		KEY = config.tripleDes.key;
		manifest = androidConfigInput.manifest;
		project = config.user.project;
	};
	/**
	 * Apk extract by androidConfig.input | output.extractor objects
	 * @method apkExtractor
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @throws {Error} if none input apk then output folder.
	 * @memberof AndroidPublisher
	 */
	this.apkExtractor = function() {
		logger.debug('start decompiling ' + androidConfigInput.extractor.inputApk);
		utility.throwsNoSuchFile(androidConfigInput.extractor.inputApk, 'apk');
		commandGenerator('extractor', function() {
			var parameters = ['-Duser.language=en ', '-jar', androidConfigInput.apkTool, 'd',
				'-f', androidConfigInput.extractor.inputApk, '-o', androidConfigOutput.extractor.outputFolder
			];
			addParameterMaxMem(parameters, androidConfigInput.java.maxMemory);
			return spawn(androidConfigInput.java.path, parameters);
		})();
		utility.throwsNoSuchDir(androidConfigOutput.extractor.outputFolder);
		utility.mkdirpSync(androidConfigOutput.extractor.outputFolder + '/assets');
		logger.debug('done decompiling ' + androidConfigOutput.extractor.outputFolder);
	};
	/**
	 * Apk builder by androidConfig.input | output.builder objects
	 * @method apkBuilder
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @throws {Error} if none input folder then output apk
	 * @memberof AndroidPublisher
	 */
	this.apkBuilder = function() {

		logger.debug('start building ' + androidConfigInput.builder.inputFolder);
		utility.throwsNoSuchDir(androidConfigInput.builder.inputFolder);
		if (utility.safeControlFile(androidConfigOutput.builder.outputApk, 'apk')) { // if file exist clear.
			fs.unlinkSync(androidConfigOutput.builder.outputApk);
		}
		commandGenerator('builder', function() {
			var parameters = ['-Duser.language=en ', '-jar', androidConfigInput.apkTool, 'b',
				'-f', androidConfigInput.builder.inputFolder, '-o', androidConfigOutput.builder.outputApk
			]
			addParameterMaxMem(parameters, androidConfigInput.java.maxMemory);
			return spawn(androidConfigInput.java.path, parameters);

		})();
		utility.throwsNoSuchFile(androidConfigOutput.builder.outputApk, 'apk');
		logger.debug('done building. Output Apk : ' + androidConfigOutput.builder.outputApk);
	};

	/**
	 * Signer Apk file   with androidConfig.input | output. sign objects.
	 * @method apkSigner
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @throws {Error} if none input apk then output apk
	 * @memberof AndroidPublisher
	 */
	this.apkSigner = function() {

		logger.debug('start signing ' + androidConfigInput.sign.inputApk);
		utility.mkdirpSync(path.dirname(androidConfigOutput.sign.outputApk)); // output folder if need , create.
		utility.throwsNoSuchFile(androidConfigInput.sign.inputApk, 'apk');
		if (utility.safeControlFile(androidConfigOutput.sign.outputApk, 'apk')) { // if file exist clear.
			fs.unlinkSync(androidConfigOutput.sign.outputApk);
		}
		commandGenerator('signer', function() {
			var sign = androidConfigInput.sign;
			var parameters = ['-jar', sign.signer, '-keystore', sign.keystoreFile,
				sign.keystorePass, sign.aliasName, sign.keyPass, sign.inputApk, androidConfigOutput.sign.outputApk
			]
			addParameterMaxMem(parameters, androidConfigInput.java.maxMemory);
			return spawn(androidConfigInput.java.path, parameters);

		})();
		if (utility.safeControlFile(androidConfigOutput.builder.outputApk, 'apk')) { // if file exist clear.
			fs.unlinkSync(androidConfigOutput.builder.outputApk);
		}
		utility.throwsNoSuchFile(androidConfigOutput.sign.outputApk, 'apk');
		logger.debug('done signing. Output Apk : ' + androidConfigOutput.sign.outputApk);
	};

	/**
	 * Images copy from androidConfig.input.images to player folder.
	 * @method updateImages
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateImages = function(profileIndex) {
		logger.debug('start updateImages() ' + androidConfigInput.images);
		var supportFolder = androidConfigInput.packageProfiles[profileIndex].profile.folders;
		for (var i = 0; i < supportFolder.length; ++i) { // folder copy operatios
			if (fs.existsSync(androidConfigInput.images + '/' + supportFolder[i])) {
				copy.copyDirectory(androidConfigInput.images + '/' + supportFolder[i],
					androidConfigInput.builder.inputFolder + '/res/' + supportFolder[i]);
				//console.log(andConfig.destApkFolderPath+'//res//'+supportFolder[i]);							
			} else {
				logger.warn('No such a directory :dir: ' + androidConfigInput.images + '/' + supportFolder[i]);

			}

		}
		logger.debug('done updateImages() ');
	};
	/**
	 * create config2.bin by config.config2 object..
	 * @method createConfig2Bin
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.createConfig2Bin = function() {
		logger.debug('start createConfig2Bin() ');
		fs.writeFileSync( // create config2.bin
			androidConfigInput.builder.inputFolder + '/assets/config2.bin',
			des3.encryptStrWith3DES_ECB(configuration.createConfigXmlString(config2), KEY));
		logger.debug('done createConfig2Bin() ' + androidConfigInput.builder.inputFolder + '/assets/config2.bin');
	}
	/**
	 * update AndroidMAnifest.xml by config.androidConfig.input.manifest.edit object..
	 * @method updateManifest
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateManifest = function() {
		logger.debug('start updateManifest() ');
		fs.writeFileSync(androidConfigInput.builder.inputFolder + '/AndroidManifest.xml', // update AndroidManifest.xml
			configuration.editAndroidManifestXML(androidConfigInput.manifest), {
				encoding: 'utf8'
			});
		logger.debug('done updateManifest() ' + androidConfigInput.builder.inputFolder + '/AndroidManifest.xml');
	}

	/**
	 * Scripts files from config.androidConfig.input.scripts  to player folder.
	 * @method updateScripts
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateScripts = function() {
		logger.debug('start updateScripts() ' + androidConfigInput.scripts);
		if (androidConfigInput.license.type === 'Demo') { // no encryption script files.
			logger.debug('\t  Scripts files copying ...  :' + androidConfigInput.scripts);
			copy.copyDirectory(androidConfigInput.scripts, androidConfigInput.builder.inputFolder + '/assets');
		} else { // yes encryption files.
			var scriptFiles = fs.readdirSync(androidConfigInput.scripts);
			logger.debug('\t  Scripts files with encrypted copying ...  :' + androidConfigInput.scripts);
			_.each(scriptFiles, function(item) {
				var filename = path.join(androidConfigOutput.extractor.outputFolder, 'assets', utility.renameFilesType(item, 'jsx'));
				des3.encryptFileWith3DES_ECB(path.join(androidConfigInput.scripts, item), KEY, filename);
			});
		}
		logger.debug('done updateScripts() ' + androidConfigInput.builder.inputFolder + '/assets');
	};
	/**Assets files from config.androidConfig.input.scripts  to player folder.
	 * @method updateAssets
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateAssets = function() {
		logger.debug('start updateAssets() ' + androidConfigInput.assets);
		copy.copyDirectory(androidConfigInput.assets, androidConfigInput.builder.inputFolder + '/assets');
		logger.debug('done updateAssets() ' + androidConfigInput.builder.inputFolder + '/assets');

	};
	/**
	 * data.smf , splash.smf, defaults.xml,copy from project_data .
	 * @method updateOtherFiles
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateOtherFiles = function(config) {
		var root = project.root;
		logger.debug('start updateOtherFiles() ' + root + '/object/Data/...');
		var builder = androidConfigInput.builder;
		var dest = builder.inputFolder;
		var smfData = (builder.smfData) ? builder.smfData : root + '/object/Data/data.smf';
		var smfSplash = (builder.smfSplash) ? builder.smfSplash : root + '/object/Data/splash.smf';
		var sqlite = (builder.sqlite) ? builder.sqlite : 'test-files/input/database.sqlite';
		var defaultsXml = (builder.defaultsXml) ? builder.defaultsXml : root + '/defaults.xml';
		utility.throwsNoSuchFile(smfData, 'smf');
		utility.throwsNoSuchFile(smfSplash, 'smf');
		utility.throwsNoSuchFile(sqlite, 'sqlite');
		utility.throwsNoSuchFile(defaultsXml, 'xml');
		copy.copyFile(smfData, dest + '/assets/data.smf');
		copy.copyFile(smfSplash, dest + '/assets/splash.smf');
		copy.copyFile(defaultsXml, dest + '/assets/defaults.xml');
		copy.copyFile(sqlite, dest + '/assets/database.sqlite');
		logger.debug('done updateOtherFiles() ' + dest + '/assets/...');
	};
	/**
	 * Create license.xml by config.androidConfig.input.license object.
	 * @method updateLicenseXML
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.updateLicenseXML = function() {
		logger.debug('start updateLicenseXML() ');
		fs.writeFileSync(androidConfigInput.builder.inputFolder + '/assets/license.xml', androidConfigInput.license.data, {
			encoding: 'utf8'
		});
		logger.debug('done updateLicenseXML() ' + androidConfigInput.builder.inputFolder + '/assets/license.xml');
	};
	/**
	 * Async function !  add plugins by config.androidConfig.input.plugins object.
	 * @private
	 * @method addPlugins
	 * @param {function} callBack function that called after addPlugins.
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	function addPlugins(callBack) {
		var i = 0;
		var outPath = tmpdir + '/plugins';

		if (androidConfigInput.plugins.length !== 0) {
			logger.debug('start addPlugins() ');
			_.each(androidConfigInput.plugins, function(item) {
				fs.createReadStream(item.path).pipe(unzip.Extract({
					path: outPath + '/_' + item.name
				}).on('close', function(code) {

					copy.copyDirectory(outPath + '/_' + item.name + '/content', androidConfigInput.builder.inputFolder);
					utility.removeFolder(outPath + '/_' + item.name);
					logger.debug('\t add ( ' + item.name + ' ) : to : ' + androidConfigInput.builder.inputFolder);
					++i;
					if (androidConfigInput.plugins.length == i) {

						logger.debug('done addPlugins() ');
						utility.removeFolder(outPath); // clean temp folders.
						callBack();
						logger.debug('done publishing');
					}
				}));
			});
		} else {
			logger.debug('none Plugins will be added.');
			try {
				callBack();
			} catch (err) {
				utility.writeJsonToStdout(err);
			}
		}
	}
	/**
	 * finishPublish calling asenkron method..
	 * @method finishPublish
	 * @this AndroidPublisher
	 * @return {undefined} undefined
	 * @memberof AndroidPublisher
	 */
	this.finishPublish = function(callBack) {
		addPlugins(callBack);
	};


};

// android config object control.
function controlAndroidConfig(androidConfig) {

	if (androidConfig == null) {
		err.err = 'null object';
		err.msg = 'config.androidConfig object is null';

	} else if (!(androidConfig instanceof AndroidConfig)) {
		err.err = 'AndroidConfig object';
		err.msg = 'config.androidConfig object is not AndroidConfig';
		logger.error(err.msg);
		utility.killProcess(err);
	}
	var childJava = spawn(androidConfig.input.java.path, ['-jar', '-version']);
	if (!utility.controlChildProcess(childJava)) {
		err.err = 'java path';
		err.msg = 'Java not found ! path: ' + androidConfig.input.java.path;

	} else {
		var outputJava = childJava.output.toString('utf8');
		if (outputJava.search(/1.7.\d/gm) === -1) {
			err.err = 'java version';
			err.msg = 'Java version ( ' + outputJava.substr(outputJava.search(/\d.\d.\d/gm), 8) + ' ) not supported ! version must be 1.7.- ';
		} else if (!utility.controlChildProcess(spawn(androidConfig.input.java.path, ['-jar', androidConfig.input.apkTool, '-version']))) {
			err.err = 'apktool path';
			err.msg = 'apktool not found ! path: ' + androidConfig.input.apkTool;

		} else if (!utility.controlChildProcess(spawn(androidConfig.input.java.path, ['-jar', androidConfig.input.sign.signer, '-version']))) {
			err.err = 'signer path';
			err.msg = 'signer not found ! path: ' + androidConfig.input.sign.signer;

		}
	}
	if (err.err !== '') {
		logger.error(err.msg);
		utility.killProcess(err);
	}

	androidConfigInput = androidConfig.input;
	//console.log('androidConfigInput', JSON.stringify(androidConfigInput, null, 2));
	utility.throwsNoSuchDir(androidConfigInput.scripts);
	utility.throwsNoSuchDir(androidConfigInput.assets);
	utility.throwsNoSuchDir(androidConfigInput.images);
	utility.pngImagesControl(androidConfigInput.images, androidConfigInput.packageProfiles);
	_.each(androidConfigInput.plugins, function(item) {
		utility.throwsNoSuchFile(item.path, 'zip');
	});


}
//control input files.
function control_Config2_AndroidConfig(config) {

	var androidConfig = config.androidConfig;
	var config2 = config.config2;

	if (config.tripleDes.key.length !== 24) {
		err.err = 'invalid key';
		err.msg = 'key length must be 24. key:' + config.tripleDes.key.length;

	} else {
		utility.controlProperties(config2, 'config.config2');
		utility.controlProperties(androidConfig, 'config.androidConfig');
	}

	if (err.err !== '') {
		logger.error(err.msg);
		utility.killProcess(err);
	}
	controlAndroidConfig(androidConfig);
}

function addParameterMaxMem(param, value) {
	if (value !== null) {
		param.unshift('-Xmx' + value);
	}
}



module.exports = AndroidPublisher;