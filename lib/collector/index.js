var _ = require('underscore');

var argumentParser = require('../argumentparser');
var platformSpecificCollectorModule = {
	'c9': './c9/index',
	'darwin': './c9/index',
	'linux': './c9/index',
	'win32': './windows/index'
};

function collect(data, platform, argv) {
	var collector = require(platformSpecificCollectorModule[platform]);
	var args = argumentParser(data, platform, argv);
	var config;
	if (args.TASK === 'android-full-publish') {
		config = collector.getConfigForAndroidFullPublish(args, data);
		config.user.profiles = profileCollector(args.PROFILES, config.androidConfig.input.packageProfiles);
	} else if (args.TASK === 'ios-full-publish') {
		config = collector.getConfigForIOSFullPublish(args, data);
	}
	return config;
}

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
	collect: collect,
	profileCollector: profileCollector
};