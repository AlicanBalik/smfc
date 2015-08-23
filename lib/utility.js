var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec = require('child_process').exec;
var os = require('os');

var _ = require('underscore');
var uuid = require('node-uuid');
var reg = require('reg_java');


var logger = require('./log/log4j').getLogger('utility');
var ConfigObjects = require('./config/index');

var Config = ConfigObjects.Config;
var Config2 = ConfigObjects.Config2;

var LogStatus = (function() {
	var logging = false;
	var outJson = false;

	function setLogStatus(status) {
		logging = status;
	}

	function getLogStatus() {
		return logging;
	}

	function setOutJson(_status) {
		outJson = _status;
	}

	function getOutJson() {
		return outJson;
	}

	return {
		setLogStatus: setLogStatus,
		getLogStatus: getLogStatus,
		getOutJson: getOutJson,
		setOutJson: setOutJson
	};
})();

exports.LogStatus = LogStatus;
// get date time as a string.
exports.getDateTime = function() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day = date.getDate();
	day = (day < 10 ? "0" : "") + day;
	return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

exports.getBuildTimestamp = function() {
	var a = new Date().toISOString().replace('T', ':').split('.')[0].replace(/\:/g, '-').split('-');
	return a[0] + a[1] + a[2] + '-' + a[3] + a[4] + a[5];
};

//remove folder recursively with subfolders.
function removeFolder(_path) {
	folder = fs.readdirSync(_path);
	for (var i = 0; i < folder.length; i++) {
		var item = folder[i]
		if (fs.lstatSync(_path + '/' + item).isDirectory()) {
			removeFolder(_path + '/' + item); // delete recursively.
			fs.rmdirSync(_path + '/' + item);
		} else {
			if (os.platform() === 'win32') {
				fs.chmodSync(_path + '/' + item, 666);
			}
			fs.unlinkSync(_path + '/' + item);
		}
	}
}

exports.removeFolder = removeFolder;
// control one file is exist and is file and .type ?
function safeControlFile(file, type) {
	var res = false;
	if (fs.existsSync(file)) {
		if (!fs.statSync(file).isDirectory()) {
			var fileType = file.slice(file.lastIndexOf('.') + 1, file.length);
			if (type) {
				if (fileType === type) {
					res = true;
				}
			} else {
				res = true;
			}
		}

	}
	return res;
}
exports.safeControlFile = safeControlFile;

// control directory is eexits and  isDirectory ?.
function safeControlDirectory(path) {
	var res = false;
	if (fs.existsSync(path)) {
		if (fs.statSync(path).isDirectory()) {
			res = true;
		}

	}
	return res;
}

exports.safeControlDirectory = safeControlDirectory;

// control  child is, have error object and  output any error strings. ?
exports.controlChildProcess = function(child) {
	var res = false;
	if (_.isUndefined(child.error) && (child.output.toString('utf8').search(/error/gim) === -1 && child.output.toString('utf8').search(/Exception/gim) === -1)) {
		res = true;
	}

	return res;
}

// control config, config2 instance.
exports.controlConfig = function(config) {
	var err = {
		err: '',
		msg: '',
	}

	if (_.isUndefined(config)) {
		err.err = 'undefined object';
		err.msg = 'config object is undefined';

	} else if (!(config instanceof Config)) {
		err.err = 'Config object';
		err.msg = 'config is not Config object';

	} else if (!(config.config2 instanceof Config2)) {
		err.err = 'Config2 object';
		err.msg = 'config.config2 object is not Config2';

	}
	if (err.err !== '') {
		logger.error(err.msg);
		killProcess(err);
	}
}
// control config2 properties.
exports.controlProperties = function(obj, name) {
	var err = {
		err: '',
		msg: '',
	}
	var index = _.values(obj).indexOf(undefined);
	if (index != -1) {
		err.err = 'undefined properties value';
		err.msg = ' at least , ' + name + '  one properties is undefined  prop: ' + _.keys(obj)[index];
	}
	if (err.err !== '') {
		logger.error(err.msg);
		killProcess(err);
	}
}

function generateUUID() { // remove - chs.
	return uuid.v4().toUpperCase().replace(/\-/g, '');
}
exports.generateUUID = generateUUID;

// Exp: ali.asd.txt ->> type=cmd ->> returns  ali.asd.cmd
exports.renameFilesType = function(fileName, type) {
	var temp = fileName.split('.');
	var res = fileName;
	if (temp.length > 0) {
		res = temp[0];
		for (var i = 1; i < temp.length - 1; ++i) {
			res += '.' + temp[i];
		};
		res += '.' + type;
	}
	return res;
}

exports.throwsNoSuchDir = function(dir) {
	var err = {
		err: '',
		msg: ''
	};
	if (!safeControlDirectory(dir)) {
		err.err = 'Directory Error';
		logger.error('\tNo such a directory : ' + dir);
		err.msg = 'No such a directory  : ' + dir;
		killProcess(err);
	}
}

exports.throwsNoSuchFile = function(file, type) {
	var err = {
		err: '',
		msg: ''
	};
	if (!safeControlFile(file, type)) {
		err.err = 'File Error';
		logger.error('\tNo such a file : ' + file);
		err.msg = 'No such a file : ' + file;
		killProcess(err);
	}
}

var searchRes = [];

function searchFilesRec(dir) {
	var files = fs.readdirSync(dir);
	for (i in files) {
		if (fs.statSync(dir + '/' + files[i]).isDirectory()) {
			searchFilesRec(dir + '/' + files[i]);
		} else {
			searchRes.push(dir + '/' + files[i]);
		}
	}
}

// returns files in directory with subdirectories.
exports.searchFiles = function(dir) {
	searchRes = [];
	searchFilesRec(dir);
	return searchRes;
}

var TmpDir = (function() {
	var tmpdir = null;

	function set(_tmp) {
		tmpdir = _tmp;
	}

	function get() {
		return tmpdir;
	}
	return {
		get: get,
		set: set
	};
})();
exports.tmpdir = TmpDir;

function killProcess(obj) {
	if (obj) {
		writeJsonToStdout(obj);
	}
	if (TmpDir.get() !== null) {
		var child = spawnSync('node', [__dirname + '/bin/cleaner', '--folder=' + TmpDir.get()]);
	}
	process.exit();
};

exports.killProcess = killProcess;


// safety creating directories.
exports.mkdirpSync = function(pathStr) {

	var unvalidDirname = [];
	// first occurence valid directory.
	function getValidDirname(pathString) {
		var dirname = path.dirname(pathString);

		if ((dirname === '.') || fs.existsSync(dirname)) {
			unvalidDirname.push(pathString.substring(pathString.lastIndexOf(path.sep)).replace(/\\|\//gm, ''));
			return dirname;
		}
		unvalidDirname.push(pathString.substring(pathString.lastIndexOf(path.sep)).replace(/\\|\//gm, ''));
		return getValidDirname(path.dirname(pathString));
	}
	var res = false;
	normalPath = path.normalize(pathStr);
	validDirname = getValidDirname(normalPath);
	if (validDirname !== '.') {
		_.each(unvalidDirname.reverse(), function(item) {
			validDirname = validDirname + path.sep + item;
			if (!fs.existsSync(validDirname)) {
				fs.mkdirSync(validDirname);
			}
		});
		res = true;
	}
	return res;
};

// rename file name not include ext name.
exports.createOutPathByTheProfile = function(filePath, profile) {

	var file = path.parse(filePath);
	var newName = profile.name;
	if (newName !== 'Default') {
		file.name += '-' + newName;
		file.base = file.name + file.ext;
	}
	if (profile.x86) {
		file.name += '-' + 'x86';
		file.base = file.name + file.ext;
	}
	return path.normalize(path.format(file));
};

function createOptionalCallback(callback) {
	if (!callback || typeof callback !== 'function') {
		callback = function() {}
	}
	return callback;
}
exports.createOptionalCallback = createOptionalCallback;

function writeJsonToStdout(jsonObj) {
	if (LogStatus.getOutJson()) {
		process.stdout.write(JSON.stringify(jsonObj));
	} else {
		if (jsonObj.err) {
			console.log('ERROR: ' + jsonObj.msg);
		} else if (jsonObj.nextProfile) {
			console.log('Android Publish -> Profile: ' + getProfileType(jsonObj.x86) + ' - ' + jsonObj.nextProfile + ' ... ');
		} else if (jsonObj.nextIOS) {
			console.log('iOS Publish ... ');
		} else if (jsonObj.downloadFilePath) {
			console.log('Output: ' + jsonObj.downloadFilePath);
		} else if (jsonObj.msg) {
			console.log(jsonObj.msg);
		}
	}
}

exports.writeJsonToStdout = writeJsonToStdout;

function getProfileType(x86) { // get profile type arm or x86
	if (x86) {
		return 'x86';
	} else {
		return 'ARM';
	}
}
exports.getProfileType = getProfileType;

function writeJsonMsgToStdout(msg) {
	writeJsonToStdout({
		msg: msg
	});
}
exports.writeJsonMsgToStdout = writeJsonMsgToStdout;

function getJavaPathForDarwin(callback) {
	var child = spawn('/usr/libexec/java_home', ['-v', '1.7']);
	child.stdout.on('data', function(data) {
		callback(null, data.toString().replace('\n', '') + '/bin/java');
	});
	child.stderr.on('data', function(data) {
		callback(data);
	});
}
exports.getJavaPathForDarwin = getJavaPathForDarwin;


// find automaticaly java path from process.env.programFiles.
function javaControlSync(java, version) {
	var child = spawnSync(java, ['-jar', '-version']);
	var output = '';
	child && (child.output && (output = child.output.toString('utf8')));

	return controlVersion(output, version);

	function controlVersion(outputJava, javaVersion) { // control java version.
		var reg = new RegExp(javaVersion + '.\\d', 'gm');
		var res = false;
		if (outputJava.search(reg) !== -1) {
			res = true;
		}
		return res;
	}
	return controlVersion(output, version);
}

exports.javaControlSync = javaControlSync;

function javaFinderForLinux() {
	var version = 1.7;
	var resultJavaPath;

	var child = spawnSync('which', ['java']);
	var output = '';
	child && (child.output && (output = child.stdout.toString('utf8')));
	resultJavaPath = output.replace(/\n/gm, '');

	if (resultJavaPath === '') {
		logger.error(' Java not found --> You can try to using \'--java=$(javaPath)\' parameter');
		killProcess({
			err: 'java error',
			msg: 'Java not found for this version : ' + version
		});
	}
	logger.debug('Java was found : ' + resultJavaPath);
	return resultJavaPath;

}
exports.javaFinderForLinux = javaFinderForLinux;

exports.javaFinder = function(callback) {
	var platform = os.platform();
	logger.info('Java 1.7 will be found automatically !');
	switch (platform) {
		case 'win32':
			reg.getJavaHome(1.7, function(err, data) {
				if (data) {
					logger.debug('Java was found : ' + data);
					callback(null, data);
				} else if (err) {
					logger.error(err.msg);
					callback(err);
				}
			})
			break;
		case 'linux':
			callback(null, javaFinderForLinux());
			break;
		case 'darwin':
			getJavaPathForDarwin(callback);
			break;
		default:
			logger.warn('Not available JavaFinder this platform : ' + platform);
			killProcess({
				err: 'java error',
				msg: 'Not available JavaFinder this platform : ' + platform
			});
			// MAC javaFinder will be implemented.
	}
};

// find current workspace directory.
exports.cwd = function(callback) {
	var platform = os.platform();
	var cmd = ''; // command taht will be operated.
	if (platform === 'win32') {
		cmd = 'echo %cd%';
	} else if (platform === 'linux' || platform === 'darwin') {
		cmd = 'pwd';
	}
	if (cmd !== '') {
		child = exec(cmd,
			function(error, stdout, stderr) {
				if (error !== null) {
					logger.error('Error during find CWD.');
					return callback(error);
				}
				return callback(null, stdout.toString('utf8').replace(/\r|\n/gm, ''));
			});

	} else {
		var msg = 'Not supported Platform : ' + platform + ' for find cwd ( Current Workspace Directory )';
		logger.fatal(msg);
		callback(new Error(msg));
	}
};

//convert absolute path with cwd
exports.convertAbsolute = (function() {
	var cwd = '';

	function setCwd(_cwd) {
		if (!path.isAbsolute(_cwd)) {
			throw new Error('cwd must be absolute path ! : ' + _cwd);
		}
		cwd = _cwd;
	}

	function convert(_path) {
		var res;
		if (_path && !path.isAbsolute(_path)) {
			res = path.join(cwd, _path);
		} else {
			res = _path;
		}
		return res;
	}

	return {
		setCwd: setCwd,
		convert: convert
	};

})();

//logger must update after the configure
exports.updateLogger = function() {
	logger = require('./log/log4j').getLogger('utility');
};


function repeatStr(str, count) { // string repeater
	var rpt = '';

	for (var i = 0; i < count; i++) {
		rpt = rpt + str;
	};
	return rpt;
}
exports.repeatStr = repeatStr;


// control png images
function pngImagesControl(imagesDir, pkcgProfiles) {
	var pngFiles = fs.readdirSync(imagesDir);
	if (!pkcgProfiles) {
		for (var i = 0; i < pngFiles.length; i++) {
			var pngFile = path.parse(pngFiles[i]);
			if (pngFile.ext.match(/png/gmi) === null) {
				killProcess({
					err: 'PNG Error',
					msg: 'Invalid image format : ' + pngFile.ext + '\n Full Path: ' + path.join(imagesDir, pngFiles[i])
				});
			}
		}
	} else {
		_.each(pkcgProfiles, function(itemProfile) {
			_.each(itemProfile.profile.folders, function(_itemFolder) {
				pngImagesControl(path.join(imagesDir, _itemFolder));
			});
		});
	}
}
exports.pngImagesControl = pngImagesControl;