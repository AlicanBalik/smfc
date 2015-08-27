var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawnSync;

var _ = require('underscore');
var utility = require('./utility');
var logger = require('./log/log4j').getLogger('ArgumentParser');
var checker = require('./check');

var killProcess = utility.killProcess;
var getBuildTimestamp = utility.getBuildTimestamp;
var convert = utility.convertAbsolute.convert;

function parse(data, platform, argv) {
	var args;
	checker.checkArguments(argv, platform);
	argv.projectRoot = convert(argv.projectRoot);
	utility.throwsNoSuchDir(argv.projectRoot);
	if (platform === 'win32') {
		args = parseForWin32(data, argv);
	} else {
		//logger.fatal('Unknown platform : ' + platform);
		args = parseForC9(data, argv);
	}
	return args;
}

function checkForArgsError(args) {
	var arg_values = _.values(args);
	var arg_keys = _.keys(args);
	var indexOfUndef = arg_values.indexOf(undefined);
	if (indexOfUndef !== -1) {
		var err = {
			err: 'Parser error',
			msg: 'Undefined argument detected ! check parameters for --> ' + arg_keys[indexOfUndef]
		};
		logger.fatal(err.msg);
		killProcess(err);
	}
}

// parsing arguments by task.
function parseForWin32(data, argv) {
	var args;
	var task = argv.task;
	var tmpdir = data.moduleGlobals.tmpdir;
	var DEFAULT_OUTPUT_APK_FOLDER = tmpdir + '/SmartfacePlayer';
	var DEFAULT_INPUT_APK_FOLDER = DEFAULT_OUTPUT_APK_FOLDER;
	var DEFAULT_OUTPUT_APK = tmpdir + '/SmartfacePlayerEdited.apk';
	utility.mkdirpSync(tmpdir);
	logger.debug('start parseForWin32()  Task : ' + task);
	if (task === 'android-full-publish') {
		args = _.extend(commonFullPublish(), {
			JAVA: argv.java || 'java',
			MAX_JAVA_MEM: argv.maxJavaMemory || null,
			APK_TOOL: convert(argv.apkTool) || 'bin/apktool.jar',
			INPUT_APK: convert(argv.inputApk) || null,
			INPUT_APK_x86: convert(argv.inputApkx86) || null,
			DECOMP_INPUT_APK: null,
			DECOMP_OUTPUT_FOLDER: DEFAULT_OUTPUT_APK_FOLDER,
			COMP_INPUT_FOLDER: DEFAULT_INPUT_APK_FOLDER,
			COMP_OUTPUT_APK: DEFAULT_OUTPUT_APK,
			SIGN_INPUT_APK: DEFAULT_OUTPUT_APK,
			OUTPUT_APK: convert(argv.outputApk) || 'Smartface Demo.apk',
			SIGN_OUTPUT_APK: null,
			SIGNER: convert(argv.signer) || 'bin/SignApk.jar',
			KEYSTORE_FILE: convert(argv.keystoreFile) || 'test-files/input/smfdefault.keystore',
			KEYSTORE_PASS: argv.keystorePass || 'smartface',
			ALIAS_NAME: argv.aliasName || 'smartface',
			KEY_PASS: argv.keyPass || 'smartface'
		});
	} else if (task === 'ios-full-publish') {
		args = _.extend(commonFullPublish(), {
			PLAYER_ZIP: convert(argv.inputZip) || undefined,
			OUTPUT_ZIP: convert(argv.outputZip) || 'Smartface Demo.zip'
		});
	}

	checkForArgsError(args);
	logger.debug('done parseForWin32()');
	return args;

	function commonFullPublish() {
		var root = argv.projectRoot || undefined;
		return {
			PROJECT_SFPX: convert(argv.sfpx) || undefined,
			LICENSE_FILEPATH: convert(argv.licenseFile) || 'test-files/input/data2.sfd',
			projectRoot: root,
			PLUGINS: pluginsParse(argv.plugin),
			PROFILES: profileParse(argv.profile),
			TASK: task
		};
	}

}

function parseForC9(data, argv) {
	var args;
	var task = argv.task;
	var config_json = loadConfigJson(argv);
	//data.config_json = config_json;
	var NODE_MOD_ROOT = data.moduleGlobals.root + '/';
	var BIN_ROOT = NODE_MOD_ROOT + 'bin/';
	var build = config_json.build;
	var output = build.output;
	var root = argv.projectRoot;
	logger.debug('start parseForC9() TASK : ' + task);
	if (task === 'android-full-publish') {
		var config_signer = build.input.android.sign;
		args = commonFullPublish();
		var outputFolder = root + '/' + output.android.outputFolder + '/' + args.timestamp + '/';
		var outputTempFolder = outputFolder + '.tmp';
		data.moduleGlobals.tmpdir = outputTempFolder;
		var preSignedApk = outputTempFolder + '/preSigned.apk';
		_.extend(args, {
			JAVA: argv.java || 'java',
			MAX_JAVA_MEM: argv.maxJavaMemory || null,
			APK_TOOL: convert(argv.apkTool) || BIN_ROOT + '/apktool.jar',
			outputTempFolder: outputTempFolder,
			INPUT_APK: convert(argv.inputApk) || BIN_ROOT + '/SmartfacePlayer.apk',
			INPUT_APK_x86: convert(argv.inputApkx86) || null,
			DECOMP_INPUT_APK: null,
			DECOMP_OUTPUT_FOLDER: outputTempFolder + '/SmartfacePlayer',
			COMP_INPUT_FOLDER: outputTempFolder + '/SmartfacePlayer',
			COMP_OUTPUT_APK: preSignedApk,
			SIGN_INPUT_APK: preSignedApk,
			OUTPUT_APK: outputFolder + config_signer.aliasName + '.apk',
			SIGN_OUTPUT_APK: null,
			SIGNER: convert(argv.signer) || BIN_ROOT + '/SignApk.jar',
			KEYSTORE_FILE: convert(argv.keystoreFile) || root + '/' + config_signer.keystoreFile,
			KEYSTORE_PASS: config_signer.keystorePass,
			ALIAS_NAME: config_signer.aliasName,
			KEY_PASS: config_signer.keyPass
		});
	} else if (task === 'ios-full-publish') {
		// --outputZip=\"test-files/output/xcode/out_4_4.zip\"
		args = commonFullPublish();
		var outputFolder = root + '/' + output.ios.outputFolder + '/' + args.timestamp + '/';
		var outputTempFolder = outputFolder + '.tmp/';
		data.moduleGlobals.tmpdir = outputTempFolder;
		_.extend(args, {
			PLAYER_ZIP: convert(argv.inputZip) || BIN_ROOT + '/iOS_Player.zip',
			OUTPUT_ZIP: argv.outputZip || outputFolder + 'app.zip',
			outputFolder: outputFolder,
			outputTempFolder: outputTempFolder
		});
	}
	args.config_json = config_json;
	checkForArgsError(args);
	logger.debug('done parseForC9()  TASK : ' + task);
	data.processedArgs = args;
	return args;

	function loadConfigJson(argv) {
		var DEFAULT_CONFIG_JSON_FILE = 'config/project.json';
		var config_file_path;
		if (argv.config_file_full_path) {
			config_file_path = argv.config_file_full_path;
		} else {
			config_file_path = argv.projectRoot + '/' + ((!argv.config_file) ? DEFAULT_CONFIG_JSON_FILE : argv.config_file);
		}
		try {
			var config_json = require(config_file_path);
		} catch (e) {
			var errMsg = "project.json could not be found : " + path.normalize(config_file_path);
			logger.fatal(errMsg);
			killProcess({
				err: "Config File Error",
				msg: errMsg
			});
		}
		return config_json;
	}

	function commonFullPublish() {
		return {
			LICENSE_FILEPATH: argv.licenseFile || 'test-files/input/data2.sfd',
			projectRoot: argv.projectRoot,
			PLUGINS: pluginsParse(argv.plugin),
			PROFILES: profileParse(argv.profile),
			TASK: task,
			timestamp: getBuildTimestamp()
		};
	}
}

function pluginsParse(plugins) {
	var convertAbsolute = utility.convertAbsolute;
	var res = [];
	if (!_.isUndefined(plugins)) {
		if (!(plugins instanceof Array)) {
			plugins = [plugins];
		}
		_.each(plugins, function(item) {
			var plugin = item.split('::', 2);
			res.push({
				name: plugin[0],
				path: convert(plugin[1])
			});
		});
	}
	return res;
}

function profileParse(profiles) {
	var resProfile = [];
	if (!_.isUndefined(profiles)) {
		if (!(profiles instanceof Array) && (profiles.replace(/ /gm, '') === '*')) {
			resProfile.push('*');
		} else { // only *
			!(profiles instanceof Array) && (profiles = [profiles]);
			resProfile = {
				'x86': [],
				'arm': []
			};
			utility.writeJsonToStdout({
				p: profiles
			});
			_.each(profiles, function(profile) {
				var profileJuniors = profile.split(';');
				_.each(profileJuniors, function(junior) {
					var tokenProfile = junior.split(':');
					if (tokenProfile.length === 2) {
						tokenProfile[0] = tokenProfile[0].toLowerCase();
						if (tokenProfile[0] === 'x86' || tokenProfile[0] === 'arm') {
							_.each(tokenProfile[1].split(','), function(item) {
								resProfile[tokenProfile[0]].push(item);
							});
						} else {
							var msg = 'invalid profile: ' + junior + ' !  Must be x86:$(profileName),...  |  arm:$(profileName),...';
							logger.error(msg);
							utility.killProcess({
								err: 'profile parse',
								msg: msg
							});
						}
					}
				});

			});
		}
	} else {
		resProfile = {
			'arm': ['Default'],
			'x86': []
		};
	}
	return resProfile;
}

module.exports = parse;