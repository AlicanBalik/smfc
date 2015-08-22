var inquirer = require("inquirer");
var reg = require('reg_java');
var chalk = require('chalk');
var inspect = require('util').inspect;
var fs = require('fs');
var path = require('path');

var _ = require('underscore');

var utility = require('../utility');
var XmlParser = require('../xmltojson');
var Default = require('./tag');
var ui = require('./ui');
var collector = require('./collector');

var WORKSPACE = Default.def.WORKSPACE;
var TASK = Default.def.TASK;
var LICENSE = Default.def.LICENSE;
var ANDROID = Default.def.ANDROID;
var bottomBar = ui.bottomBar;
var tasks = Default.getList('TASK');
var workSpaceTypes = Default.getList('WORKSPACE');
var profileList = ['ARM - Default'];


var answered = (function() { // result config.
	function helper() {
		this.task = '';
		this.workSpaceType = WORKSPACE.SMFC;
		this.sfpx = '';
		this.projectRoot = '';
		this.android = {
			java: ANDROID.JAVA,
			inputApk: ANDROID.INPUT_APK,
			inputApkx86: ANDROID.INPUT_APK_x86,
			packageProfiles: null,
			profiles: []
		};
		this.outputRoot = '';
		this.license = LICENSE.DEMO;
		this.auth = {
			name: '',
			pass: '',
			loggedIn: false
		};

		this.isRunableTask = function() {
			return !(
				this.task === TASK.LOGIN ||
				this.task === TASK.LOGOUT
			);
		};

		this.isLoggedOut = function() {
			return this.auth.loggedIn;
		};

		this.isLoggedInForLicense = function() {
			return (this.license === LICENSE.LOGIN);
		};

		this.isC9Workspace = function() {
			return (this.workSpaceType === Default.def.WORKSPACE.SMFC);
		};
		this.getPkcgProfile = function() { // profiles from PackageProfiles.xml
			var pkcgPath, res = true;
			if (this.isC9Workspace()) { // detect workspace
				pkcgPath = path.join(this.projectRoot, 'config/Android/PackageProfiles.xml');
			} else {
				pkcgPath = path.join(this.projectRoot, 'PackageProfiles.xml');
			}
			if (utility.safeControlFile(pkcgPath, 'xml')) { // xml file is exists ?
				this.android.packageProfiles = new XmlParser().parse(pkcgPath);
			} else {
				res = false;
			}
			return res;
		};
		this.getProfiles = function() {
			var armx86Profs = []; // get profiles
			if (this.android.packageProfiles) {
				var _profiles = this.android.packageProfiles.findObjects('profile');
				var profNames = [];
				_.each(_profiles, function(item) { // get avaiable profiles name.
					profNames.push(item.getAttributes('Name'));
				});
				_.each(['ARM - ', 'x86 - '], function(armOrx86) {
					armx86Profs.push(new inquirer.Separator());
					_.each(profNames, function(itemProfName) {
						armx86Profs.push(armOrx86 + itemProfName);
					});
				});
				armx86Profs.push(new inquirer.Separator());
			}
			return armx86Profs;

		};


	}
	return new helper();

})();


function auth(callback) { // authentication
	var task = answered.task;
	if (task === 'logout' && answered.isLoggedOut()) {
		inquirer.prompt({
			type: "confirm",
			name: "logout",
			message: "Do you really want to logout"
		}, function(answer) {
			answered.auth.loggedIn = answer.logout;
			callback(answer);
		});
	} else if ((task === 'login' && (!answered.isLoggedOut())) || (!answered.isLoggedOut())) {
		inquirer.prompt([{
			type: "input",
			name: "name",
			message: "username"
		}, {
			type: "password",
			message: "password",
			name: "password"
		}], function(answer) {
			answered.license = [new inquirer.Separator(), 'Smartface Demo', new inquirer.Separator()];
			answered.auth.loggedIn = true;
			answered.auth.name = answer.name;
			answered.auth.pass = answer.pass;
			callback(answer);
		});
	} else {
		write('red', ' You haven\'t been logged in yet !')
	}
}

function askTask(callback) { // ask task
	inquirer.prompt({
		type: "list",
		name: "task",
		message: "Which task that you want to be run ?",
		choices: tasks
	}, function(answer) {
		answered.task = answer.task;
		callback(answer);
	});
}

function askWorkSpace(callback) { // ask workspace
	inquirer.prompt({
		type: "list",
		name: "workSpaceType",
		message: "Which type of workspace that you want to be published ?",
		choices: workSpaceTypes
	}, function(answer) {
		answered.workSpaceType = answer.workSpaceType;
		callback(answer);
	});
}

function askJava(callback) { // ask java and default find avaiable java
	var defaultJava = 'Java 1.7 Not found !';
	utility.javaFinder(function(err, data) {
		if (data) {
			defaultJava = path.normalize(data);
		}
		inquirer.prompt({
			type: "input",
			name: "java",
			message: "Enter Java 1.7 path",
			default: defaultJava
		}, function(answer) {
			answered.android.java = answer.java;
			callback(answer);
		});
	});
}

function askOutputRoot(callback) { // ask output root
	var defaultOutput = 'Smartface/Published Projects';
	process.env.USERPROFILE && (defaultOutput = process.env.USERPROFILE + '/Smartface/Published Projects');
	inquirer.prompt({
		type: "input",
		name: "outputRoot",
		message: "Enter output root",
		default: path.normalize(defaultOutput)
	}, function(answer) {
		answered.outputRoot = answer.outputRoot;
		callback(answer);
	});
}


function askLicense(callback) { // ask license name as a appName
	var licenseList;
	if (!answered.isLoggedOut()) {
		licenseList = Default.getList('LICENSE');
	} else {
		licenseList = answered.license;
	}
	inquirer.prompt({
		type: "list",
		name: "license",
		message: "select license",
		choices: licenseList,
		default: LICENSE.DEMO
	}, function(answer) {
		answered.license = answer.license;
		callback(answer);
	});

}

function askProfiles(callback) {
	var profileList = answered.getProfiles();
	inquirer.prompt({
		type: "checkbox",
		name: "profiles",
		message: "select profiles",
		choices: profileList
	}, function(answer) {
		if (answer.profiles.length !== 0) {
			answered.android.profiles = answer.profiles;
		} else {
			answered.android.profiles = ['ARM - Default'];
		}
		callback(answer);
	});
}

function askSfpx(callback) { // ask sfpx file for Desktop - IDE
	inquirer.prompt({
		type: "input",
		name: "sfpx",
		message: "Enter sfpx file path",
		default: '...'
	}, function(answer) {
		answered.sfpx = answer.sfpx;
		callback(answer);
	});
}

function askProjectRoot(callback) { // ask project root for c9 - IDE
	inquirer.prompt({
		type: "input",
		name: "projectRoot",
		message: "Enter project root folder",
		default: '.'
	}, function(answer) {
		answered.projectRoot = answer.projectRoot;
		if (!answered.getPkcgProfile()) {
			ui.complete();
			bottomBar.update('red', ' FATAL: project root folder not found\n');
			ui.wait('project root');

			// TO DO E
			askProjectRoot(callback);
		} else {
			callback(answer);
		}
	});
}

function askInputApks(callback) {
	var defaultApk = '';
	var defaultApkx86 = '';
	if (!answered.isC9Workspace()) {
		bottomBar.update('yellow', 'please wait for search players apk ...');
		getSmartfaceInstallDir(function(err, data) {
			bottomBar.update('');
			if (data) {
				defaultApk = path.join(data[0].value + '\\Data\\Players\\Android (.APK)', 'SmartfacePlayer.apk');
				defaultApkx86 = path.join(data[0].value + '\\Data\\Players\\Android (.APK)', 'SmartfacePlayer-x86.apk');
			}
			askApks();
		});
	} else {
		defaultApk = 'bin/SmartfacePlayer.apk';
		defaultApkx86 = 'bin/SmartfacePlayer-x86.apk';
		askApks();
	}

	function askApks() {
		ui.wait('player - ARM');
		inquirer.prompt({
			type: "input",
			name: "inputApk",
			message: "Enter input apk file for ARM",
			default: defaultApk
		}, function(answer) {
			answered.android.inputApk = answer.inputApk;
			ui.complete('player - ARM');
			ui.wait('player - x86');
			inquirer.prompt({
				type: "input",
				name: "inputApkx86",
				message: "Enter input apk file for x86",
				default: defaultApkx86
			}, function(answer) {
				answered.android.inputApkx86 = answer.inputApkx86;
				ui.complete('player - x86');
				callback(answer);
			});

		});
	}
}

function askForAndroid(callback) { // android questions
	ui.wait('java 1.7');
	bottomBar.update('yellow', ' Java 1.7 searching ... ');
	askJava(function(answerJava) {
		ui.complete('java 1.7');
		if (!answered.isC9Workspace()) {
			ui.wait('output root');
			askOutputRoot(function(answerRoot) {
				ui.complete('output root');
				askCommon();
			});
		} else {
			askCommon();
		}

	});

	function askCommon() {
		askInputApks(function() {
			ui.wait('license');
			askLicense(function(answerLicense) {
				if (answered.isLoggedInForLicense()) {
					auth(function(answerAuth) {
						ui.complete('login');
						ui.wait('license');
						askLicense(function(answerLicense) {
							ui.complete('license');
							ui.wait('profiles');
							askProfiles(function(answerProfile) {
								ui.complete('profiles');
								callback(null);
							});
						});
					});
				} else {
					ui.complete('license');
					ui.wait('profiles');
					askProfiles(function(answerProfile) {
						ui.complete('profiles');
						callback(null);
					});
				}
			});
		});
	}
}

function askForiOS(callback) {
	if (!answered.isC9Workspace()) {
		ui.wait('output root');
		askOutputRoot(function(answerRoot) {
			ui.complete('output root');
			askCommon();
		});
	} else {
		askCommon();
	}


	function askCommon() {
		ui.wait('license');
		askLicense(function(answerLicense) {
			if (answered.isLoggedInForLicense()) {
				ui.wait('login');
				auth(function(answerAuth) {
					ui.complete('login');
					ui.wait('license');
					askLicense(function(answerLicense) {
						ui.complete('license');
						callback(null);
					});

				});
			} else {
				ui.complete('license');
				callback(null);
			}
		});
	}
}


function askByTask(callback) { // ask questions by task
	switch (answered.task) {
		case 'android-full-publish':
			askForAndroid(callback);
			break;
		case 'ios-full-publish':
			askForiOS(callback);
			break;
		default:
			callback(new Error('Illegal task : ' + task));
	}
}

function askByWorkspaceType(callback) {
	ui.complete();
	if (answered.isC9Workspace()) { // c9
		ui.wait('project root');
		askProjectRoot(function() {
			if (!utility.safeControlDirectory(answered.projectRoot)) {

				askByWorkspaceType(callback);
			} else {
				ui.complete('project root');
				callback();
			}
		});
	} else { // desktop
		ui.wait('project sfpx');
		askSfpx(function() {
			if (!utility.safeControlFile(answered.sfpx)) {
				askByWorkspaceType(callback);
			} else {
				ui.complete('project sfpx');
				callback();
			}
		})
	}
}

function ask(callback) { // ask all questions.
	ui.wait('task');
	askTask(function() { // task
		ui.complete('task');
		if (answered.isRunableTask()) {
			ui.wait('project root');
			askProjectRoot(function() {
				ui.complete('project root');
				askByTask(function(err, stat) { // android or ios
					if (err) {
						write('red', err);
						return;
					}
					ui.write('green', '\t Well Done. Ready For Publishing ...');
					callback(collector.collect(answered)); // call
					/* 
						//debug
						console.log(inspect(answered, {
							colors: true,
							depth: Infinity
						}));
							*/
				});
			});
		} else {
			ui.wait('login');
			auth(function() { // login
				ui.complete('login');
				ui.write('magenta', 'Well done. Check configurations.');
				/* 
				//debug
				console.log(inspect(answered, {
					colors: true,
					depth: Infinity
				}));  */
			});
		}

	});
}


function getSmartfaceInstallDir(callback) { // For Desktop IDE installiation folder
	reg.search('HKCU/SOFTWARE/Smartface', 'Path', function(err, data) {
		if (data) {
			callback(null, data);
		} else {
			callback(err);
		}
	});
}


function setup(callback) {
	ui.setAnswered(answered); // set common object.
	process.stdout.write('\033c'); // clear console.
	ui.header();
	ask(callback);
}


module.exports = setup;

/*
reg.search('HKCU/SOFTWARE/Smartface', 'ProjectPaths', function(err, data) {

	if (data) {
		console.dir(data);
	}
});

*/