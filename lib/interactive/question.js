var Default = require('./tag');
var asker = require('./asker').asker;
var QUESTIONS = require('./asker').QUESTIONS;
var utility = require('../utility');
var UI = require('./ui');
var error = require('./error');
var answered = require('./answered');

var convertAbsolute = utility.convertAbsolute.convert;
// Ask tasks 
function askTask(callback) {
	UI.wait(QUESTIONS.task.description);
	var opt = {
		choices: Default.getList('TASK')
	};
	asker(QUESTIONS.task, callback, {
		opt: opt
	});
}
/**
 * @unused
 * ASk workspace type
 */
function askWorkspace(callback) {
	UI.wait(QUESTIONS.workspace.description);
	var opt = {
		choices: Default.getList('WORKSPACE')
	};
	asker(QUESTIONS.workspace, callback, {
		opt: opt
	});
}

function askLogin(callback) {
	UI.wait(QUESTIONS.login.description);
	asker(QUESTIONS.login.username, function() {
		UI.complete();
		UI.wait(QUESTIONS.login.username.name + ' = ' + require('./answered').auth.name);
		UI.wait(QUESTIONS.login.password.description);
		asker(QUESTIONS.login.password, callback, {
			midObj: 'auth'
		});
	}, {
		midObj: 'auth'
	});
}

function askLogout(callback) {
	UI.wait(QUESTIONS.logout.description);
	asker(QUESTIONS.logout, callback);
}

function askJava(callback) {
	UI.wait(QUESTIONS.java.description);
	UI.bottomBar.update('yellow', 'Java 1.7 searching ...');
	var opt = {
		filter: function(item) {
			return convertAbsolute(item);
		},
		validate: function(input) {
			var res = false;
			if (utility.javaControlSync(input, 1.7)) {
				res = true;
			} else {
				UI.complete();
				UI.wait(QUESTIONS.java.description);
				res = error.java + ' : ' + input;
			}
			return res;
		}
	}
	utility.javaFinder(function(err, data) {
		UI.bottomBar.update(null, '');
		if (data) {
			QUESTIONS.java.default = data;
		}
		asker(QUESTIONS.java, callback, {
			midObj: 'android',
			opt: opt
		});
	});

}
/**
 * @unused
 * ASk output root
 */
function askOutputRoot(callback) {
	UI.wait(QUESTIONS.outputRoot.description);
	asker(QUESTIONS.outputRoot, callback);
}

// return absolute path.
function filterAbsolutePath(_input) {
	return convertAbsolute(_input);
}

function askProjectRoot(callback) {
	if (answered.isPublishTask()) {

		/*	var samples = require('./sample').getSamplePaths(validateProjectFolder);  // Advance default sample projects.
		if (samples.length !== 0) {
			QUESTIONS.projectRoot.default = samples[0];
		}
		UI.wait(QUESTIONS.projectRoot.description);
		QUESTIONS.projectRoot.default = convertAbsolute(QUESTIONS.projectRoot.default); */
		var opt = {
			validate: function(input) { // control  with  isDirectory().
				var res = validateProjectFolder(input);
				if (res !== true) {
					UI.complete();
					UI.wait(QUESTIONS.projectRoot.description);
					res += ' : ' + input;
				}
				return res;
			},
			filter: filterAbsolutePath
		}
		asker(QUESTIONS.projectRoot, callback, {
			opt: opt
		});
	} else {
		callback();
	}

	function validateProjectFolder(input) { // validate project folder
		var res = false;
		var path = require('path');
		var projPath = convertAbsolute(input);
		var res = false;
		if (utility.safeControlDirectory(projPath)) {
			if (answered.workSpaceType === Default.def.WORKSPACE.DESKTOP) {
				// TO DO DESKTOP ıde sfpx, data control.
			} else {
				if (utility.safeControlFile(path.join(projPath, 'config', 'project.json'), 'json')) {
					if (utility.safeControlFile(path.join(projPath, 'config', 'Android', 'PackageProfiles.xml'), 'xml')) {
						res = true;
					} else {
						// Error handling PackageProfiles.xml
						res = error.packageProfiles;
					}
				} else {
					// Error handling project.json
					res = error.projectJson;
				}
			}
		} else {
			// Error handling no such a dir
			res = error.dir
		}
		return res;
	}
}
// validate input path exist and .apk 
function validatePlayer(_input, infoStr) {
	var res = false;
	var absolutePath = convertAbsolute(_input);
	if (utility.safeControlFile(absolutePath, 'apk')) {
		res = true;
	} else {
		res = error.playerPath + ' : ' + absolutePath;
		UI.complete();
		UI.wait(infoStr);
	}
	return res;
}

function askPlayerArm(callback) {
	UI.wait(QUESTIONS.playerArm.description);
	var opt = {
		validate: validateArm,
		filter: filterAbsolutePath
	}
	asker(QUESTIONS.playerArm, callback, {
		midObj: 'android',
		opt: opt
	});

	function validateArm(_input) {
		return validatePlayer(_input, QUESTIONS.playerArm.description);
	}
}

function askPlayerx86(callback) {
	UI.wait(QUESTIONS.playerx86.description);
	var opt = {
		validate: validatex86,
		filter: filterAbsolutePath
	}
	asker(QUESTIONS.playerx86, callback, {
		midObj: 'android',
		opt: opt
	});

	function validatex86(_input) {
		return validatePlayer(_input, QUESTIONS.playerx86.description);
	}
}

function askProfiles(callback) {
	UI.wait(QUESTIONS.profiles.description);
	var opt = {
		choices: answered.getProfiles()
	};
	asker(QUESTIONS.profiles, callback, {
		midObj: 'android',
		opt: opt
	});
}

function askLicense(callback) {
	UI.wait(QUESTIONS.license.description);
	var opt = {
		choices: Default.getList('LICENSE')
	};
	asker(QUESTIONS.license, callback, {
		opt: opt
	});
}

function askSample(callback) {
	var samples = require('./sample');
	UI.wait(QUESTIONS.sampleProjects.description);
	var opt = {
		choices: samples.getAvailableNames()
	};
	asker(QUESTIONS.sampleProjects.available, function() {
		getProjectFromGit(callback);
	}, {
		opt: opt,
		midObj: "samples"
	});

	function getProjectFromGit(callback) { // project clone from git.
		var git = require('./git');
		var path = require('path');
		var color = UI.color;
		var newSampleLink = samples.getAvailableLink(answered.samples.availableSample);
		if (newSampleLink) {
			var destDir = path.join(Default.def.SAMPLES_DIR, answered.samples.availableSample);
			var spinner = [' \\ ', ' | ', ' / ', ' - '];
			var updateStr = ' downloading ...';
			var i = 0;
			var timer = setInterval(function() {
				UI.bottomBar.update(color.wait, spinner[i++ % 4] + updateStr);
			}, 50);
			git.gitClone(newSampleLink, function(err) {
				UI.bottomBar.update(null, '');
				clearInterval(timer);
				UI.complete();
				UI.write(color.ok, '');
				if (err) {
					if (err.err === error.type.network) {
						UI.error(error.network);
					} else if (err.err === error.type.child) {
						UI.error(error.git);
					} else {
						UI.error(error.existingSample + '\n FOLDER: ' + destDir);
					}
					callback(err);
				} else {
					UI.write(color.ok, answered.samples.availableSample + ' was successfully downloaded.');
					UI.write(color.output, ' Folder Path: ', true);
					UI.write(color.filePath, destDir);
					callback(null);

				}
			}, destDir);
		} else {
			throw new Error(error.sampleProjLink);
		}
	}
}
/*  // NOT supported yet
function askPlugin(callback) {
	UI.wait(QUESTIONS.plugin.description);
	asker(QUESTIONS.plugin.confirm, function() {
		if (answered.plugin) { // yes plugin will be added
			askAddPlugin(callback);
		} else { // no plugin
			UI.complete(QUESTIONS.plugin.description);
			callback();
		}
	});
	var convertAbsolute = convertAbsolute;
	var optPath = { // plugin path and absolute path control.
		validate: function(input) {
			var res = false;
			var absPath = convertAbsolute(input);
			if (utility.safeControlFile(absPath)) {
				if (utility.safeControlFile(absPath, 'zip')) {
					res = true;
				} else {
					res = error.fileType + ' we expected : zip';
				}
			} else {
				res = error.file + ' : ' + absPath;
			}
			return res;
		},
		filter: function(item) {
			return convertAbsolute(item);
		}
	};

	function askAddPlugin(callback) {
		UI.complete();
		UI.wait(QUESTIONS.plugin.name.description);
		asker(QUESTIONS.plugin.name, function() { // plugin name
			UI.complete();
			UI.wait(QUESTIONS.plugin.name.description + ' = ' + answered.pluginName);
			UI.wait(QUESTIONS.plugin.path.description);
			asker(QUESTIONS.plugin.path, function() { // plugin path.
				addPlugin(); // save plugin
				UI.complete(QUESTIONS.plugin.description);
				UI.wait(QUESTIONS.plugin.more.description);
				asker(QUESTIONS.plugin.more, function() { // add one more ?
					if (answered.plugin) {
						askAddPlugin(callback);
					} else {
						UI.complete();
						callback();
					}
				});
			}, {
				opt: optPath
			});
		});
	}

	function addPlugin() { // add current plugin into plugins.
		answered.pluginNames.push(answered.pluginName);
		answered.plugins.push(answered.pluginName + '::' + answered.pluginPath);
	}
}
*/
function askForAndroid(callback) {
	askJava(function() {
		UI.complete(QUESTIONS.java.description);
		askPlayerArm(function() {
			UI.complete(QUESTIONS.playerArm.description);
			askPlayerx86(function() {
				UI.complete(QUESTIONS.playerx86.description);
				askLicense(function() {
					UI.complete(QUESTIONS.license.description);
					askProfiles(function() {
						var profs = answered.android.profiles;
						if (profs.length === 0) {
							profs.push(Default.def.ANDROID.PROFILE);
						}
						UI.complete(QUESTIONS.profiles.description);
						callback();
					});
				});
			});
		});
	});
}

function askForiOS(callback) {
	askLicense(function() {
		UI.complete(QUESTIONS.license.description);
		callback();
	});
}

function askByTask(callback) {
	switch (answered.task) {
		case Default.def.TASK.ANDROID_FULL_PUBLISH:
			askForAndroid(callback);
			break;
		case Default.def.TASK.IOS_FULL_PUBLISH:
			askForiOS(callback);
			break;
		case Default.def.TASK.LOGIN:
			askLogin(callback);
			break;
		case Default.def.TASK.LOGOUT:
			askLogout(callback);
			break;
		case Default.def.TASK.SAMPLE:
			askSample(callback);
			break;
		default:
			throw new Error(error.task + answered.task);
	}
}

function ask(callback) {
	process.stdout.write('\033c'); // clear console.
	var isPublishTask = answered.isPublishTask;
	UI.header();
	askTask(function() {
		UI.complete(QUESTIONS.task.description);
		if (isPublishTask()) {
			askProjectRoot(function() {
				UI.complete(QUESTIONS.projectRoot.description);
				askByTask(function() {
					callback();
				});
			});
		} else {
			askByTask(function() {
				callback();
			});
		}
	});
}

function setup(callback) {
	utility.cwd(function(err, dir) { // find CWD [cd, pwd ]
		if (err) {
			throw new Error(error.cwd);
		} else if (dir) {
			var convertAbsolute = utility.convertAbsolute;
			convertAbsolute.setCwd(dir);
			ask(function() {
				var collector = require('./collector');
				if (answered.isPublishTask()) {
					require('./run')(function() {
						process.exit();
					});
				} else {
					process.exit();
				}

			});
		}
	});
}

module.exports = setup;