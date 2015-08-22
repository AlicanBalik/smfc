var _ = require('underscore');
var androidConfigurator = require('./android');
var iosConfigurator = require('./ios');
var TAG = require('../tag');
var Parser = require('../../xmltojson');
var ConfigObjects = require('../../config/index');
var profileCollector = require('../index').profileCollector;

var Config = ConfigObjects.Config;
var Config2 = ConfigObjects.Config2;
var AndroidConfig = ConfigObjects.android;
var IOSConfig = ConfigObjects.ios;

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;

var ANDROID_FULL_PUBLISH_TASK = 'android-full-publish';
var IOS_FULL_PUBLISH_TASK = 'ios-full-publish';

// create config by a task that android full publish.
function getConfigForAndroidFullPublish(args, data) {
	var config = new Config();
	config.task = ANDROID_FULL_PUBLISH_TASK;
	config.androidConfig = new AndroidConfig();
	updateConfigFromArgs(config, args);
	config.config2 = createConfig2FromConfigJson(args);
	updateTripleDesKeyFromLicense(config, args.LICENSE_FILEPATH);

	androidConfigurator.configUpdateFromConfigJson(config, args);
	androidConfigurator.configUpdateFromLicense(config, args.LICENSE_FILEPATH);
	androidConfigurator.configUpdateFromArgs(config, args);
	androidConfigurator.configUpdateFoldersAndProfiles(config);
	data.androidConfig = config;
	config.user.profiles = profileCollector(args.PROFILES, config.androidConfig.input.packageProfiles);
	return config;
}

function getConfigForIOSFullPublish(args, data) {
	var config = new Config();
	config.task = IOS_FULL_PUBLISH_TASK;
	config.iosConfig = new IOSConfig();
	updateConfigFromArgs(config, args);
	config.config2 = createConfig2FromConfigJson(args);
	updateTripleDesKeyFromLicense(config, args.LICENSE_FILEPATH);

	iosConfigurator.configUpdateFromConfigJson(config, args);
	iosConfigurator.configUpdateFromLicense(config, args.LICENSE_FILEPATH);
	iosConfigurator.configUpdateFromArgs(config, args);
	data.iosConfig = config;
	return config;
}

// config2 attributes get from config.json file.
function createConfig2FromConfigJson(args) {
	var DEFAULT_SPLASH_IMG = 'default_splash.png';
	var SplashScreenBackgroundColor = "3947526";
	var config2 = new Config2();
	var config_json = args.config_json;
	var info = config_json.info;
	_.extend(config2, {
		"splash": DEFAULT_SPLASH_IMG,
		"splashBackground": SplashScreenBackgroundColor,
		"appVersion": info.version,
		"fileVersion": info.runtimeVersion,
		"appDescription": info.description
	});
	_.each(['portrait', 'landScapeLeft', 'landScapeRight', 'upsideDown'], function(item) {
		config2.orientation[item] = config_json.config.orientation[item];
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
	config.user.project.root = args.projectRoot;
	config.user.profiles = args.PROFILES;
}

module.exports = {
	updateTripleDesKeyFromLicense: updateTripleDesKeyFromLicense,
	updateConfigFromArgs: updateConfigFromArgs,
	getConfigForAndroidFullPublish: getConfigForAndroidFullPublish,
	getConfigForIOSFullPublish: getConfigForIOSFullPublish
};