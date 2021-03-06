var path = require('path');
var _ = require('underscore');
var inquirer = require("inquirer");

var utility = require('../utility');
var XmlParser = require('../xmltojson');
var Default = require('./tag'); // get Defaults

var Answered = (function() { // answers of questions
	var WORKSPACE = Default.def.WORKSPACE;
	var TASK = Default.def.TASK;
	var LICENSE = Default.def.LICENSE;
	var ANDROID = Default.def.ANDROID;
	var iOS = Default.def.iOS;

	function helper() {
		var that = this;
		this.task = '';
		this.workSpaceType = WORKSPACE.SMFC;
		this.sfpx = '';
		this.projectRoot = '';
		this.android = {
			java: ANDROID.JAVA,
			playerArm: ANDROID.INPUT_APK,
			playerx86: ANDROID.INPUT_APK_x86,
			packageProfiles: null,
			profiles: []
		};
		this.iOS = {
			playeriOS: iOS.INPUT_ZIP
		};
		this.outputRoot = '';
		this.license = LICENSE.DEMO;
		this.sample = {
			dir: '',
			name: ''
		};
		this.samples = {
			installedSample: '',
			availableSample: '',
			task: ''
		};
		this.plugin = false;
		this.pluginName = '';
		this.pluginPath = '';
		this.plugins = [];
		this.pluginNames = [];
		this.auth = {
			name: '',
			pass: '',
			loggedIn: false
		};
		this.isPublishTask = function() {
			return ([TASK.ANDROID_FULL_PUBLISH, TASK.IOS_FULL_PUBLISH].indexOf(that.task) !== -1);
		}
		this.isLoggedOut = function() {
			return that.auth.loggedIn;
		};

		this.isLoggedInForLicense = function() {
			return (that.license === LICENSE.LOGIN);
		};

		this.isC9Workspace = function() {
			return (that.workSpaceType === Default.def.WORKSPACE.SMFC);
		};

		this.getPkcgProfile = function() { // profiles from PackageProfiles.xml
			var pkcgPath, res = true;
			if (that.isC9Workspace()) { // detect workspace
				pkcgPath = path.join(that.projectRoot, 'config/Android/PackageProfiles.xml');
			} else {
				pkcgPath = path.join(that.projectRoot, 'PackageProfiles.xml');
			}
			if (utility.safeControlFile(pkcgPath, 'xml')) { // xml file is exists ?
				that.android.packageProfiles = new XmlParser().parse(pkcgPath);
			} else {
				// TO DO : HANDLE ERROR
				res = false;
			}
			return res;
		};

		this.getProfiles = function() {
			var armx86Profs = [ANDROID.PROFILE]; // get profiles
			that.getPkcgProfile();
			if (that.android.packageProfiles) {
				var _profiles = that.android.packageProfiles.findObjects('profile');
				var profNames = [];
				armx86Profs = [];
				_.each(_profiles, function(item) { // get avaiable profiles name.
					profNames.push(item.getAttributes('Name'));
				});
				_.each(['ARM - ', 'x86 - '], function(armOrx86) {
					armx86Profs.push(new inquirer.Separator());
					_.each(profNames, function(itemProfName) {
						armx86Profs.push(armOrx86 + itemProfName);
					});
				});
			}
			return armx86Profs;
		};
	}
	return new helper();
})();

module.exports = Answered;