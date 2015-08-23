/**
 * @file Include Android & IOS publisher  operations.
 * @version 1.0.0
 * @requires module:fs
 * @require module:smfbuilder
 * @require module:child_process
 * @require module:androidpublisher
 */

var fs = require('fs');
var spawn = require('child_process').spawnSync;

var rmdir = require('rmdir');

var utility = require('../utility');
var smfModule = require('../smfbuilder');
var AndroidPublisher = require('./android/androidpublisher');

var Parser = require('../xmltojson');
var IosPublisher = require('./ios/iosPublisher');
var logger = require('../log/log4j').getLogger('Publisher'); // logger.
var createSmfBinary = require('../smf-binary/index').create;

var iosPublisher = new IosPublisher();
var andPublisher = new AndroidPublisher();


/**
 *  Publisher android & IOS with  using smfbuilder.
 * @constructor Publisher
 */
var Publisher = (function() {


	/**
	 * ios full publishing
	 * @method iosFullPublish
	 * @param {Config} config ios config object.
	 * @memberof Publisher
	 */
	this.iosFullPublish = function(config, data) {
		utility.writeJsonMsgToStdout("Preparing xCode Project Files...");
		iosPublisher.startPublish(config, data);
		createSmfBinary(data, function() {
			utility.writeJsonToStdout({
				nextIOS: 'iOS'
			});
			utility.writeJsonMsgToStdout("Preparing License File");
			iosPublisher.createLicenseXml();
			utility.writeJsonMsgToStdout("Preparing Config File");
			iosPublisher.createConfig2Bin();
			utility.writeJsonMsgToStdout("Copying Binary Files");
			iosPublisher.copyOthersToSmfRes();
			utility.writeJsonMsgToStdout("Copying Resource Files");
			iosPublisher.copyResourcesToSmfRes();
			utility.writeJsonMsgToStdout("Copying Sqlite File");
			var sqliteFile = 'test-files/input/database.sqlite';
			if (data && data && data.iosConfig && data.iosConfig.iosConfig && data.iosConfig.iosConfig.input && data.iosConfig.iosConfig.input.sqlite) {
				sqliteFile = data.iosConfig.iosConfig.input.sqlite;
			} else if (data.processedArgs && data.processedArgs.sqliteFile) {
				sqliteFile = data.processedArgs.sqliteFile;
			}
			iosPublisher.copyDatabaseSqliteSmf(sqliteFile);
			utility.writeJsonMsgToStdout("Updating info.plist");
			iosPublisher.updateInfoPlist();
			utility.writeJsonMsgToStdout("Finalizing project");
			iosPublisher.finishPublish();
			utility.writeJsonToStdout({
				responseDone: true,
				msg: "xCode Project is ready.",
				ios: true
			});
			if (!utility.LogStatus.getOutJson()) {
				utility.writeJsonMsgToStdout("cleaning temp files ...");
			}
			rmdir(data.moduleGlobals.tmpdir, utility.createOptionalCallback());
		});
	};

	/**
	 * android Publishing  by AndroidConfig object.
	 * @param {Config} andConfig android config & configlow object.
	 * @return {boolean} if success return true.
	 * @memberof Publisher
	 */
	this.androidFullPublish = function(config, data) {
		var sign = config.androidConfig.output.sign;
		sign.originalApkName = sign.outputApk;
		var cu_profiles = config.user.profiles;

		andPublisher.startPublish(config, data);
		androidProfilePublish(config, data, cu_profiles);
	};

	function androidProfilePublish(config, data, profiles, callback) {
		callback = utility.createOptionalCallback(callback);
		if (profiles.length === 0) {
			utility.writeJsonMsgToStdout('All profiles are published');
			logger.debug('All profiles are published');
			return callback(null);
		}
		utility.writeJsonToStdout({
			profile: profiles
		});
		//process.exit(profiles);
		var profile = profiles.shift();
		if (androidConfigSetterByTheProfile(config.androidConfig, profile)) {
			publishStep(config, data, profile, function() {
				androidProfilePublish(config, data, profiles, callback);
			});
		} else {
			androidProfilePublish(config, data, profiles, callback);
		}

		function publishStep(config, data, profile, callback) {
			var profileIndex = getProfileIndex(profile, config.androidConfig.input.packageProfiles);
			if (profileIndex === -1) {
				// cleanup?? not dirty
				logger.warn('profile ( ' + profile.name + ' ) not found in PackageProfiles.xml');
				utility.writeJsonMsgToStdout({
					warn: 'Profile',
					msg: 'profile ( ' + profile.name + ' ) not found in PackageProfiles.xml'
				});
				callback();
			} else {
				var msg = 'Publishing profile for ';
				if (profile.x86) {
					msg += 'x86 - ';
				} else {
					msg += 'arm - ';
				}
				msg += profile.name + ' ...';
				logger.debug(msg);
				utility.writeJsonToStdout({
					nextProfile: profile.name,
					x86: profile.x86
				});
				utility.writeJsonMsgToStdout(msg);
				utility.writeJsonMsgToStdout("Extracting Player apk...");
				andPublisher.apkExtractor();
				createSmfBinary(data, function() {
					utility.writeJsonMsgToStdout("Player apk is extracted. Collecting project files...");
					andPublisher.updateManifest();
					utility.writeJsonMsgToStdout("Manifest file is updated...");
					andPublisher.createConfig2Bin();
					utility.writeJsonMsgToStdout("Config file is created...");
					andPublisher.updateImages(profileIndex); // copy
					utility.writeJsonMsgToStdout("Images are copied...");
					andPublisher.updateScripts(); // copy
					utility.writeJsonMsgToStdout("Scripts are copied...");
					andPublisher.updateAssets(); // copy
					utility.writeJsonMsgToStdout("Assets are copied...");
					andPublisher.updateOtherFiles(config); // copy
					utility.writeJsonMsgToStdout("Misc files are copied...");
					andPublisher.updateLicenseXML(); // create license.xml
					utility.writeJsonMsgToStdout("License is copied...");
					andPublisher.finishPublish(function() {
						// build
						utility.writeJsonMsgToStdout("Project files are collected. Apk build process is started...");
						andPublisher.apkBuilder();
						utility.writeJsonMsgToStdout("Apk build is complete. Signing the apk now...");
						andPublisher.apkSigner(); // sign
						utility.writeJsonToStdout({
							msg: "Your apk is ready.",
							responseDone: true
						});
						if (!utility.LogStatus.getOutJson()) {
							utility.writeJsonMsgToStdout("cleaning temp files ...");
						}
						logger.debug('clean folder : ' + config.androidConfig.output.extractor.outputFolder);
						rmdir(data.moduleGlobals.tmpdir, callback);
					});
				});
			}
		}
	}


	return {
		androidFullPublish: androidFullPublish,
		iosFullPublish: iosFullPublish
	};
})();
// get profile index in packageProfiles.
function getProfileIndex(profile, packageProfiles) {
	var res = -1;
	for (var i = 0; i < packageProfiles.length; ++i) {
		if (profile.name === packageProfiles[i].profile.name) {
			res = i;
			break;
		}

	}
	return res;
}

//set androidconfig input output apk for by the Profile ARM or x86.
function androidConfigSetterByTheProfile(andConfig, profile) {
	var res = false;
	var input = andConfig.input;
	var output = andConfig.output;
	if (profile.x86) {
		if (input.inputApkx86 === null) {
			var msg = ' profile( ' + profile.name + ' ) x86 but not found $(PlayerName)-x86.apk ! Check argument : \'inputApkx86\'';
			logger.warn(msg);
		} else {
			input.extractor.inputApk = input.inputApkx86;
			res = true;
		}
	} else { // ARM
		if (input.inputApk === null) {
			var msg = ' profile ( ' + profile.name + ' ) ARM but not found $(PlayerName).apk ! Check argument : \'inputApk\'';
			logger.warn(msg);
		} else {
			input.extractor.inputApk = input.inputApk;
			res = true;
		}
	}
	output.sign.outputApk = utility.createOutPathByTheProfile(output.outputApk, profile);
	utility.writeJsonToStdout({
		"downloadFilePath": output.sign.outputApk
	});

	return res;
}


module.exports = Publisher;