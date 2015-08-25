var platform = require('os').platform();
var _ = require('underscore');


var Default = (function() { // win32 or linux | c9 | MAC
	var sampleDir = (platform === 'win32') ? process.env.USERPROFILE + "/Documents/Smartface/Samples" : process.env.HOME + "/Smartface/Samples";

	var defaults = {
		WORKSPACE: {
			DESKTOP: 'IDE - Desktop',
			SMFC: 'IDE - SMF_CLOUD'
		},
		TASK: {
			ANDROID_FULL_PUBLISH: 'android-full-publish',
			IOS_FULL_PUBLISH: 'ios-full-publish',
			SAMPLE: 'Sample Projects'
		},
		LICENSE: {
			DEMO: 'Smartface Demo'
		},
		ANDROID: {
			JAVA: 'java',
			INPUT_APK: 'bin/SmartfacePlayer',
			INPUT_APK_x86: 'bin/SmartfacePlayer-x86.apk',
			PROFILE: "ARM - Default"
		},
		iOS: {
			INPUT_ZIP: 'bin/iOS_Player.zip'
		},
		SAMPLES_DIR: sampleDir
	};
	// returns Array of key of defaults.
	function getList(key) {
		var res = [];
		_.each(_.values(defaults[key]), function(item) {
			res.push(item);
		});
		return res;
	}

	function getPublishTasks() {
		return [defaults.TASK.ANDROID_FULL_PUBLISH, defaults.TASK.IOS_FULL_PUBLISH];
	}

	return {
		def: defaults,
		getList: getList,
		getPublishTasks: getPublishTasks
	};


})();

module.exports = Default;