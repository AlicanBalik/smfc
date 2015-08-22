var _ = require('underscore');
var androidConfigurator = require('./android');
var iosConfigurator = require('./ios');
var TAG = require('../tag');
var Parser = require('../../xmltojson');
var ConfigObjects = require('../../config/index');

var Config = ConfigObjects.Config;
var Config2 = ConfigObjects.Config2;
var AndroidConfig = ConfigObjects.android;
var IOSConfig = ConfigObjects.ios;

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;

var DEFAULT_SPLASH_IMG = 'default_splash.png';
var ANDROID_FULL_PUBLISH_TASK = 'android-full-publish';
var IOS_FULL_PUBLISH_TASK = 'ios-full-publish';


// config2 attributes get from sfpx file.
function createConfig2FromSfpx(sfpx) {
	var config2 = new Config2();
	var parser = new Parser().parse(sfpx); // the most commonly used object.
	var orientations = parser.findObject(SFPX.DEVICE_ORIENTATIONS_TAG);
	_.extend(config2, {
		"splash": DEFAULT_SPLASH_IMG,
		"splashBackground": parser.findObject(SFPX.PROJECT_DETAILS_TAG).getAttributes(SFPX.ATTR_SPLASH_BACKGROUND_COLOR_TAG),
		"appVersion": parser.findObject(SFPX.ROOT_TAG).getAttributes(SFPX.ATTR_APP_VERSION_TAG),
		"fileVersion": parser.findObject(SFPX.ROOT_TAG).getAttributes(SFPX.ATTR_XML_VERSION_TAG),
		"appDescription": parser.findObject(SFPX.PROJECT_DETAILS_TAG).getAttributes(SFPX.ATTR_DESCRIPTION_TAG)
	});
	_.extend(config2.orientation, {
		"portrait": Boolean(orientations.getAttributes(SFPX.ATTR_PORTRAIT_TAG) == 1),
		"landScapeLeft": Boolean(orientations.getAttributes(SFPX.ATTR_LANDSCAPE_LEFT_TAG) == 1),
		"landScapeRight": Boolean(orientations.getAttributes(SFPX.ATTR_LANDSCAPE_RIGHT_TAG) == 1),
		"upsideDown": Boolean(orientations.getAttributes(SFPX.ATTR_UPSIDEDOWN_TAG) == 1)
	});
	return config2;
}

// TripleDes key  setter.
function updateTripleDesKeyFromLicense(config, license) {
	var keyBase = new Parser().parse(license).findObject(LICENSE.TRIPLE_DES_TAG).getContent();
	var key = new Buffer(keyBase, 'base64');
	key = key.toString('binary');
	config.tripleDes.key = key;

}

// general config object update.
function updateConfigFromArgs(config, args) {
	config.user.project.sfpx = args.PROJECT_SFPX;
	config.user.project.root = args.projectRoot;
	config.user.profiles = args.PROFILES;
}

// create config by a task that android full publish.
function getConfigForAndroidFullPublish(args) {
	var config = new Config();
	config.task = ANDROID_FULL_PUBLISH_TASK;
	config.androidConfig = new AndroidConfig();
	updateConfigFromArgs(config, args);
	config.config2 = createConfig2FromSfpx(config.user.project.sfpx);
	updateTripleDesKeyFromLicense(config, args.LICENSE_FILEPATH);
	androidConfigurator.configUpdateFromSfpx(config);
	androidConfigurator.configUpdateFromLicense(config, args.LICENSE_FILEPATH);
	androidConfigurator.configUpdateFromArgs(config, args);
	androidConfigurator.configUpdateFoldersAndProfiles(config);
	config.user.profiles = profileCollector(args.PROFILES, config.androidConfig.input.packageProfiles);
	return config;
}

function getConfigForIOSFullPublish(args) {
	var config = new Config();
	config.task = IOS_FULL_PUBLISH_TASK;
	config.iosConfig = new IOSConfig();
	updateConfigFromArgs(config, args);
	config.config2 = createConfig2FromSfpx(config.user.project.sfpx);
	updateTripleDesKeyFromLicense(config, args.LICENSE_FILEPATH);
	iosConfigurator.configUpdateFromSfpx(config);
	iosConfigurator.configUpdateFromLicense(config, args.LICENSE_FILEPATH);
	iosConfigurator.configUpdateFromArgs(config, args);
	return config;
}

// profile colecting ...
function profileCollector(argsProfiles, packageProfiles) {
	var res = [];
	if (argsProfiles === '*') {
		_.each(packageProfiles, function(item) {
			res.push({
				name: item.profile.name,
				x86: true
			}, {
				name: item.profile.name,
				x86: false
			});
		});
	} else {
		var x86AllProfile = (argsProfiles.x86.indexOf('*') !== -1); // all profiles ?
		var armAllProfile = (argsProfiles.arm.indexOf('*') !== -1);
		if (!x86AllProfile) { // x86 profiles not include '*'
			_.each(argsProfiles.x86, function(item) {
				res.push({
					name: item,
					x86: true
				});
			});
		}
		if (!armAllProfile) { // arm profiles not include '*'
			_.each(argsProfiles.arm, function(item) {
				res.push({
					name: item,
					x86: false
				});
			});
		}
		if (armAllProfile || x86AllProfile) {
			_.each(packageProfiles, function(item) { // all profiles in packageProfiles
				if (armAllProfile) {
					res.push({
						name: item.profile.name,
						x86: false
					});
				}
				if (x86AllProfile) {
					res.push({
						name: item.profile.name,
						x86: true
					});
				}
			});
		}
	}
	return res;
}

module.exports = {
	createConfig2FromSfpx: createConfig2FromSfpx,
	updateTripleDesKeyFromLicense: updateTripleDesKeyFromLicense,
	updateConfigFromArgs: updateConfigFromArgs,
	getConfigForAndroidFullPublish: getConfigForAndroidFullPublish,
	getConfigForIOSFullPublish: getConfigForIOSFullPublish
};