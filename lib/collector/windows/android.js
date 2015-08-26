var fs = require('fs');
var path = require('path');

var _ = require('underscore');
var TAG = require('../tag');
var Parser = require('../../xmltojson');
var utility = require('../../utility');

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;
var PACKAGE_PROFILES = TAG.PACKAGE_PROFILES;

// update config object from sfpx file.
function configUpdateFromSfpx(config) {
	var project = config.user.project;
	utility.throwsNoSuchFile(project.sfpx);
	var sfpxObj = new Parser().parse(project.sfpx); // the most commonly used object.
	var manifest = config.androidConfig.input.manifest;
	var edit = manifest.edit;
	var config2 = config.config2;
	manifest.data = fs.readFileSync(project.root + '/AndroidManifest.xml', 'utf8');
	_.extend(edit, {
		"appName": sfpxObj.findObject(SFPX.APP_NAME_TAG).getAttributes(SFPX.ATTR_APP_NAME_TAG),
		"googleMapKey": sfpxObj.findObject(SFPX.MAP_API_TAG).getAttributes(SFPX.ATTR_ANDROID_MAP_KEY_TAG),
		"appVersion": config2.appVersion,
		"appDescription": config2.appDescription,
		"orientation": decideScreenOriention(config2.orientation)
	});
}

function decideScreenOriention(orientation) { // orientation rules. control function return orientation value.
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
		throw new Error('Invalid orientation values !');
	}
	return res;
}

// application license from license file.
function configUpdateFromLicense(config, licenseFilePath) {
	utility.throwsNoSuchFile(licenseFilePath);
	var licenseObj = new Parser().parse(licenseFilePath);
	var appLicenseObj = licenseObj.findObjectHasTargetObject(LICENSE.APP_PACKAGE_LICENSE_TAG, LICENSE.PACKAGE_TYPE_TAG, 'Android');
	var input = config.androidConfig.input;
	_.extend(input.license, {
		"data": appLicenseObj.createXmlString(),
		"type": appLicenseObj.findObject(LICENSE.LICENSE_TYPE_TAG).getContent(),
		"name": appLicenseObj.findObject(LICENSE.LICENSE_NAME_TAG).getContent()
	});
	_.extend(input.manifest.edit, {
		"packageName": appLicenseObj.findObject(LICENSE.PACKAGE_NAME_TAG).getContent()
	});
}

function configUpdateFromArgs(config, args) {
	var input = config.androidConfig.input;
	var output = config.androidConfig.output;
	var root = config.user.project.root;

	_.extend(input, {
		"assets": root + '/Assets',
		"scripts": root + '/Scripts',
		"images": root + '/resources/Images/android',
		"apkTool": args.APK_TOOL,
		"plugins": args.PLUGINS,
		"inputApk": args.INPUT_APK,
		"inputApkx86": args.INPUT_APK_x86
	});

	_.extend(input.java, {
		"path": args.JAVA,
		"maxMemory": args.MAX_JAVA_MEM
	});

	input.extractor.inputApk = args.DECOMP_INPUT_APK; // decompiler.
	input.builder.inputFolder = args.COMP_INPUT_FOLDER; // compiler.

	_.extend(input.sign, {
		"inputApk": args.SIGN_INPUT_APK, // signer.
		"signer": args.SIGNER,
		"keystoreFile": args.KEYSTORE_FILE,
		"keystorePass": args.KEYSTORE_PASS,
		"aliasName": args.ALIAS_NAME,
		"keyPass": args.KEY_PASS
	});
	if (args.OUTPUT_APK === 'Smartface Demo.apk') {
		if (process.env.USERPROFILE) {
			output.outputApk = process.env.USERPROFILE +
				'/Documents/Smartface/Published Projects/' +
				input.license.name +
				'/Android/' +
				args.OUTPUT_APK;
		} else {
			output.outputApk = utility.convertAbsolute.convert('Smartface/Published Projects/' +
				input.license.name +
				'/Android/' +
				args.OUTPUT_APK);
		}

	} else {
		output.outputApk = args.OUTPUT_APK;
	}
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

	_.extend(input, {
		"assets": root + '/Assets',
		"scripts": root + '/Scripts',
		"images": root + '/resources/Images/android'
	});

	var packageProfilesObj = new Parser().parse(root + '/PackageProfiles.xml');
	if (!packageProfilesObj.isParsed()) {
		killProcess({
			err: 'PackageProfiles.xml error',
			msg: 'PackageProfiles.xml not found. Check your project folder',
			fullPath: path.normalize(root + '/PackageProfiles.xml')
		});
	}
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
	configUpdateFromSfpx: configUpdateFromSfpx
};