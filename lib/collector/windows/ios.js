var fs = require('fs');
var _ = require('underscore');
var TAG = require('../tag');
var Parser = require('../../xmltojson');
var utility = require('../../utility');

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;

function configUpdateFromArgs(config, args) {
	var input = config.iosConfig.input;
	var output = config.iosConfig.output;
	var root = config.user.project.root;
	utility.throwsNoSuchDir(root);
	_.extend(input, {
		"assets": root + '/Assets',
		"scripts": root + '/Scripts',
		"images": root + '/resources/Images/ios',
		"playerZip": args.PLAYER_ZIP,
		"plugins": args.PLUGINS
	});
	if (args.OUTPUT_ZIP === 'Smartface Demo.zip') {
		if (process.env.USERPROFILE) {
			output.outputZip = process.env.USERPROFILE +
				'/Documents/Smartface/Published Projects/' +
				input.license.name +
				'/iOS/' +
				args.OUTPUT_ZIP;
		} else {
			output.outputZip = utility.convertAbsolute.convert('Smartface/Published Projects/' +
				input.license.name +
				'/iOS/' +
				args.OUTPUT_ZIP);
		}
	} else {
		output.outputZip = args.OUTPUT_ZIP;
	}
}

// application license from license file.
function configUpdateFromLicense(config, licenseFilePath) {
	utility.throwsNoSuchFile(licenseFilePath);
	var licenseObj = new Parser().parse(licenseFilePath);
	var appLicenseObj = licenseObj.findObjectHasTargetObject(LICENSE.APP_PACKAGE_LICENSE_TAG, LICENSE.PACKAGE_TYPE_TAG, 'iOS');
	var input = config.iosConfig.input;
	_.extend(input.license, {
		"data": appLicenseObj.createXmlString(),
		"type": appLicenseObj.findObject(LICENSE.LICENSE_TYPE_TAG).getContent(),
		"name": appLicenseObj.findObject(LICENSE.LICENSE_NAME_TAG).getContent()
	});
	var infoPlist = input.infoPlist;
	var packageName = appLicenseObj.findObject(LICENSE.PACKAGE_NAME_TAG).getContent();
	var temp = packageName.split('.');
	_.extend(infoPlist, {
		"appNameShort": infoPlist.appName.substr(0, 16),
		"packageName": packageName,
		"productName": temp[temp.length - 1],
		"appVersion": config.config2.appVersion
	});
}

function configUpdateFromSfpx(config) {
	utility.throwsNoSuchFile(config.user.project.sfpx);
	var sfpxObj = new Parser().parse(config.user.project.sfpx); // the most commonly used object.
	var input = config.iosConfig.input;
	var IOSKeystoreObj = sfpxObj.findObject(SFPX.IOS_KEYSTORE_TAG);
	_.extend(input, {
		"urlIdentifier": IOSKeystoreObj.getAttributes(SFPX.ATTR_IOS_URL_IDENTIFIER),
		"urlSchemes": IOSKeystoreObj.getAttributes(SFPX.ATRR_IOS_URL_SCHEMES)
	});
	input.infoPlist.appName = sfpxObj.findObject(SFPX.APP_NAME_TAG).getAttributes(SFPX.ATTR_APP_NAME_TAG);
}

module.exports = {
	configUpdateFromSfpx: configUpdateFromSfpx,
	configUpdateFromLicense: configUpdateFromLicense,
	configUpdateFromArgs: configUpdateFromArgs
};