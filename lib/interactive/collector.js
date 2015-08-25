var _ = require('underscore');

var Collector = (function collector() { // collector for  intearactive-cli can run on smartface-cli-tool
	var answered = require('./answered');
	var args = {};

	function collect() { //C:\Users\user\Documents\GitHub\smfc-sample
		_.extend(args, {
			"task": answered.task,
			"platform": "c9",
			"projectRoot": answered.projectRoot,
			"logStdOut": "json"
		});
		collectPlugins();
		collectByTask(answered.task);
		return args;
	}

	function collectByTask(task) {
		if (task === 'android-full-publish') {
			collectAndroid();
		} else if (task === 'ios-full-publish') {
			collectiOS();
		}
	}

	function collectAndroid() {
		if (answered !== null) {
			_.extend(args, {
				"profile": collectProfiles(),
				"java": answered.android.java,
				"inputApk": answered.android.playerArm,
				"inputApkx86": answered.android.playerx86

			});
		}
	}

	function collectPlugins() {
		_.extend(args, {
			"plugin": answered.plugins
		});
	}

	function collectiOS() {
		if (answered !== null) {
			_.extend(args, {
				'inputZip': answered.iOS.playeriOS

			});
		}
	}

	function collectProfiles() { // profiles collector.
		var arm = 'arm:';
		var armList = [];
		var x86 = 'x86:';
		var x86List = [];
		var res = undefined;
		_.each(answered.android.profiles, function(profile) {
			var parts = profile.split(' - ');
			if (parts[0] === 'ARM') {
				armList.push(parts[1]);
			} else {
				x86List.push(parts[1]);
			}
		});
		if (armList.length === 0 && x86List.length !== 0) {
			res = x86 + x86List.join(',');
		} else if (x86List.length === 0 && armList.length !== 0) {
			res = arm + armList.join(',');
		} else if (x86List.length === 0 && armList.length === 0) {
			res = undefined; // there is not profile.
		} else {
			res = arm + armList.join(',') + ';' + x86 + x86List.join(',');
		}
		return res;
	}
	return {
		collect: collect
	};
})();

module.exports = Collector;