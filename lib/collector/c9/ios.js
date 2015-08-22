var fs = require('fs');
var _ = require('underscore');
var TAG = require('../tag');
var Parser = require('../../xmltojson');

var SFPX = TAG.SFPX;
var LICENSE = TAG.LICENSE;

function configUpdateFromArgs(config, args) {
	var config_json = args.config_json;
	var cj_input = config_json.build.input.ios;
	var input = config.iosConfig.input;
	var output = config.iosConfig.output;
	var project = config.user.project;
	var root = project.root + '/';
	//androidConfigInput.builder.defaultsXml / asd
	_.extend(input, {
		'sqlite': root + cj_input.assets + '/database.sqlite',
		"defaultsXml": root + 'defaults.xml',
		"assets": root + cj_input.assets,
		"scripts": root + cj_input.scripts,
		"images": root + cj_input.images,
		"playerZip": args.PLAYER_ZIP,
		"plugins": args.PLUGINS
	});
	output.outputZip = args.OUTPUT_ZIP;
}

// application license from license file.
function configUpdateFromLicense(config, licenseFilePath) {
	var licenseObj = new Parser().parse(licenseFilePath);
	var appLicenseObj = licenseObj.findObjectHasTargetObject(LICENSE.APP_PACKAGE_LICENSE_TAG, LICENSE.PACKAGE_TYPE_TAG, 'iOS');
	var input = config.iosConfig.input;
	_.extend(input.license, {
		"data": appLicenseObj.createXmlString(),
		"type": appLicenseObj.findObject(LICENSE.LICENSE_TYPE_TAG).getContent()
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

function configUpdateFromConfigJson(config, args) {
	//var sfpxObj = new Parser().parse(config.user.project.sfpx); // the most commonly used object.
	var input = config.iosConfig.input;

	_.extend(input, {
		"urlIdentifier": input.urlIdentifier,
		"urlSchemes": input.urlSchemes
	});
	input.infoPlist.appName = args.config_json.info.name;
}

module.exports = {
	configUpdateFromConfigJson: configUpdateFromConfigJson,
	configUpdateFromLicense: configUpdateFromLicense,
	configUpdateFromArgs: configUpdateFromArgs
};