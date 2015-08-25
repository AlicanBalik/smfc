var fs = require('fs');
var _ = require('underscore');
var TAG = require('../tag');
var Parser = require('../../xmltojson');
var killProcess = require('../../utility').killProcess;

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;
var PACKAGE_PROFILES = TAG.PACKAGE_PROFILES;

// update config object from sfpx file.
function configUpdateFromConfigJson(config, args) {
	var project = config.user.project;
	var manifest = config.androidConfig.input.manifest;
	var edit = manifest.edit;
	var config2 = config.config2;
	var config_json = args.config_json;
	manifest.data = fs.readFileSync(project.root + '/' + config_json.build.input.android.manifest, 'utf8');
	_.extend(edit, {
		"appName": config_json.info.name,
		"googleMapKey": config_json.api.googleMaps.androidKey,
		"appVersion": config2.appVersion,
		"appDescription": config2.appDescription,
		"orientation": decideScreenOriention(config2.orientation)
	});
}

function decideScreenOriention(orientation) {
	// orientation rules. control function return orientation value.
	var res = '';
	if ((orientation.portrait || orientation.upsideDown) &&
		(orientation.landScapeLeft || orientation.landScapeRight)) {
		res = 'fullSensor';
	} else if (orientation.portrait && orientation.upsideDown) {
		res = 'sensorPortrait';
	} else if (orientation.landScapeLeft && orientation.landScapeRight) {
		res = 'sensorLandscape';
	} else if (orientation.portrait) {
		res = 'portrait';
	} else if (orientation.upsideDown) {
		res = 'reversePortrait';
	} else if (orientation.landScapeLeft) {
		res = 'landscape';
	} else if (orientation.landScapeRight) {
		res = 'reverseLandscape';
	} else {
		var err = {
			"message": 'Invalid orientation values !'
		};
		logger.fatal(err.message);
		killProcess(err);
	}
	return res;
}

// application license from license file.
function configUpdateFromLicense(config, license) {
	var licenseObj = new Parser().parse(license);
	var appLicenseObj = licenseObj.findObjectHasTargetObject(LICENSE.APP_PACKAGE_LICENSE_TAG, LICENSE.PACKAGE_TYPE_TAG, 'Android');
	var input = config.androidConfig.input;
	_.extend(input.license, {
		"data": appLicenseObj.createXmlString(),
		"type": appLicenseObj.findObject(LICENSE.LICENSE_TYPE_TAG).getContent(),
		"name": appLicenseObj.findObject(LICENSE.LICENSE_NAME_TAG).getContent()
	});
	input.manifest.edit.packageName = appLicenseObj.findObject(LICENSE.PACKAGE_NAME_TAG).getContent();
}

function configUpdateFromArgs(config, args) {
	var input = config.androidConfig.input;
	var output = config.androidConfig.output;
	var root = config.user.project.root + '/';
	var config_json = args.config_json;
	var buildInput = config_json.build.input.android;

	_.extend(input, {
		"assets": root + buildInput.assets,
		"scripts": root + buildInput.scripts,
		"images": root + buildInput.images,
		"packageProfileFile": root + buildInput.packageProfiles,
		"apkTool": args.APK_TOOL,
		"plugins": args.PLUGINS,
		"inputApk": args.INPUT_APK,
		"inputApkx86": args.INPUT_APK_x86 || args.INPUT_APK.replace('.apk', '-x86.apk')
	});

	var inputFolder = args.COMP_INPUT_FOLDER;
	var rootBuild = root + 'builds/';
	input.extractor.inputApk = args.DECOMP_INPUT_APK; // decompiler.
	var tmpFolder = inputFolder.replace('SmartfacePlayer', '');
	_.extend(input.builder, {
		"inputFolder": inputFolder, // compiler.
		"tmpFolder": tmpFolder,
		"smfData": tmpFolder + 'data.smf',
		"smfSplash": tmpFolder + 'splash.smf',
		"sqlite": input.assets + '/database.sqlite',
		"defaultsXml": root + 'config/defaults.xml'
	});

	_.extend(input.sign, {
		"inputApk": args.SIGN_INPUT_APK, // signer.
		"signer": args.SIGNER,
		"keystoreFile": args.KEYSTORE_FILE,
		"keystorePass": args.KEYSTORE_PASS,
		"aliasName": args.ALIAS_NAME,
		"keyPass": args.KEY_PASS
	});

	_.extend(input.java, {
		"path": args.JAVA,
		"maxMemory": args.MAX_JAVA_MEM
	});

	output.outputApk = args.OUTPUT_APK.replace(/smartface.apk/gm, input.license.name + '.apk');
	output.builder.outputApk = args.COMP_OUTPUT_APK;
	output.sign.outputApk = args.SIGN_OUTPUT_APK;
	output.extractor.outputFolder = args.DECOMP_OUTPUT_FOLDER;
}

function getSupportImagesFromPackageProfilesXML(profileObj) { // PackageProfiles.xml get folder names.
	var res = [];
	var andObj = profileObj.findObjects(PACKAGE_PROFILES.FOLDER_TAG);
	for (var i = 0; i < andObj.length; ++i) {
		res.push(andObj[i].getAttributes(PACKAGE_PROFILES.ATTR_FOLDER_NAME_TAG).split('/')[1]);

	}
	return res;
}


function configUpdateFoldersAndProfiles(config) {
	var input = config.androidConfig.input;
	var root = config.user.project.root;

	var packageProfilesObj = new Parser().parse(input.packageProfileFile);

	var profiles = packageProfilesObj.findObjects(PACKAGE_PROFILES.PROFILE_TAG);
	input.packageProfiles = [];
	_.each(profiles, function(item) {
		input.packageProfiles.push({
			profile: {
				name: item.getAttributes(PACKAGE_PROFILES.ATTR_PROFILE_NAME_TAG),
				folders: getSupportImagesFromPackageProfilesXML(item)
			}
		});
	});
}

module.exports = {
	configUpdateFoldersAndProfiles: configUpdateFoldersAndProfiles,
	configUpdateFromArgs: configUpdateFromArgs,
	configUpdateFromLicense: configUpdateFromLicense,
	configUpdateFromConfigJson: configUpdateFromConfigJson
};