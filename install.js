var os = require('os');
var http = require('http');
var fs = require('fs');
var path = require('path');
var ENV = process.env;
var PLATFORM = os.platform();
var TMP_ROOT = os.tmpdir() + '/smartface-install/';

if (process.env.npm_lifecycle_event === 'preuninstall') {
	handlePreUninstall();
} else if (process.env.npm_lifecycle_event === 'postinstall') {
	handlePostInstall();
}

function handlePreUninstall() {
	var packageJson = require('./package.json');
	var downloadFiles = getDownloadFilesFromPackageJsonObject(packageJson);
	console.log(__dirname);
	fs.mkdir(TMP_ROOT, function(e) {
		if (!e || (e && e.code === 'EEXIST')) {
			var files = getFilesWithNewRoot(downloadFiles, __dirname + '/bin/');
			moveAllFilesToNewRoot(files, TMP_ROOT);
			var packageJsonString = fs.readFileSync(__dirname + '/package.json');
			fs.writeFileSync(TMP_ROOT + '/package.json', packageJsonString);
		} else {
			console.log('Could not create temp folder at:' + TMP_ROOT, e);
		}
	});
}

function handlePostInstall() {
	var packageJson = require('./package.json');
	var downloadFilesNew = getDownloadFilesFromPackageJsonObject(packageJson);
	var oldPackageJson, downloadFilesOld;
	try {
		oldPackageJson = require(TMP_ROOT + 'package.json');
		downloadFilesOld = getDownloadFilesFromPackageJsonObject(oldPackageJson);
	} catch (e) {
		downloadFilesOld = [];
	}
	var filesToDownload = [],
		filesToMove = [];
	for (var i = 0; i < downloadFilesNew.length; i++) {
		var newFile = downloadFilesNew[i];
		if (downloadFilesOld.indexOf(newFile) === -1) {
			filesToDownload.push(newFile);
		} else {
			filesToMove.push(newFile);
		}
	}
	for (var i = 0; i < filesToMove.length; i++) {
		var file = filesToMove[i];
		var basename = path.basename(file);
		if (!moveIfExists(TMP_ROOT + basename, __dirname + '/bin/' + basename)) {
			filesToDownload.push(file);
		} else {
			console.log('No need to download a new version of: ' + basename);
		}
	}

	downloadFiles(filesToDownload, __dirname + '/bin/', function() {
		console.log('All required files are downloaded');
	});
}

function downloadFiles(urls, dest, done) {
	var url = null;
	next();

	function next() {
		if (urls.length === 0) {
			return done();
		}
		url = urls.pop();
		var basename = path.basename(url);
		console.log('Downloading file: ' + basename);
		downloadFile(url, dest + basename, callback);
	}

	function callback(err) {
		if (err) {
			console.log('There was an error downloading a required file: ' + url);
		} else {
			console.log('File Downloaded: ' + url);
		}
		next();
	}
}

function downloadFile(url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close(cb);
		});
	}).on('error', function(err) {
		fs.unlink(dest);
		if (cb) {
			cb(err);
		}
	});
}

function moveAllFilesToNewRoot(files, newRoot) {
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var basename = path.basename(file);
		moveIfExists(file, path.normalize(newRoot + '/' + basename));
	}
}

function moveIfExists(file, newPath) {
	if (fs.existsSync(file)) {
		fs.renameSync(file, newPath);
		return true;
	} else {
		return false;
	}
}

function getFilesWithNewRoot(files, newRoot) {
	var new_files = [];
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var basename = path.basename(file);
		new_files.push(newRoot + '/' + basename)
	}
	return new_files;
}

function getDownloadFilesFromPackageJsonObject(obj) {
	if (!obj) {
		return [];
	}
	var downloadFiles = [];
	var meta = obj.smartface_meta.binaries;
	var keys = Object.keys(meta);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		if (key === 'zipalign') {
			continue;
		}
		downloadFiles.push(meta[key]);
	}

	if (PLATFORM === 'win32') {
		downloadFiles.push(meta.zipalign.win32);
	} else {
		//TODO: zipalign for other platforms
	}
	return downloadFiles;
}