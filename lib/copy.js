/**
 *
 * @file copy operations.
 * @version 1.0.0
 * @requires module:fs
 *
 */

var fs = require('fs');
/**
 * Copy file from source to destination file.
 * @function copyFile
 * @param {string} filepath source file path.
 * @param {string} filepath dest file path.
 * @return {undefined} undefined
 * @this Global
 */

var copyFile = function(sfile1, newfilePath) {
	fs.writeFileSync(newfilePath, fs.readFileSync(sfile1, {
		encoding: 'binary'
	}), {
		encoding: 'binary',
	});
};

/**
 * Copy files from source with subFolders to destination folder .
 * @function copyDirectory
 * @param {string} dirPath source folder path.
 * @param {string} destDirectoryPath dest folder path.
 * @return {undefined} undefined
 */
var copyDirectory = function(dirPath, destDirectoryPath) {
	var files = fs.readdirSync(dirPath);
	fs.existsSync(destDirectoryPath) === true || fs.mkdir(destDirectoryPath);
	for (var i = 0; i < files.length; ++i) {
		if (fs.statSync(dirPath + '/' + files[i]).isDirectory()) { // sub folder.

			copyDirectory(dirPath + '/' + files[i], destDirectoryPath + '/' + files[i]);
		} else {
			fs.writeFileSync(destDirectoryPath + '/' + files[i], fs.readFileSync(dirPath + '/' + files[i], {
				encoding: 'binary'
			}), {
				encoding: 'binary',
			});
		}
	}

};

/**
 * Copy files from source to destination folder . Collect all files in destination folder..
 * @function copyDirectory
 * @param {string} dirPath source folder path.
 * @param {string} destDirectoryPath dest folder path.
 * @return {undefined} undefined
 */
var copyDirectoryToOneDirectory = function(dirPath, destDirectoryPath) {
	fs.existsSync(destDirectoryPath) === true || fs.mkdir(destDirectoryPath);
	for (var i = 0; i < files.length; ++i) {
		if (fs.statSync(dirPath + '/' + files[i]).isDirectory()) { // sub folder.

			copyDirectory(dirPath + '/' + files[i], destDirectoryPath);
		} else {
			fs.writeFileSync(destDirectoryPath + '/' + files[i], fs.readFileSync(dirPath + '/' + files[i], {
				encoding: 'binary'
			}), {
				encoding: 'binary',
			});
		}
	}
}

var copyFromZiptoFolder = function(zipper, destDirectoryPath) {
	fs.existsSync(destDirectoryPath) === true || fs.mkdir(destDirectoryPath);

	var files = zipper.files;
	var keys = Object.keys(files);

	for (var i = 0; i < keys.length; ++i) {
		if (files[keys[i]].dir) {
			fs.mkdirSync(destDirectoryPath + '/' + files[keys[i]].name);
		}
	}

	// for (var i = 0; i < keys.length; ++i) {
	// 	if (files[keys[i]].dir) {
	// 		fs.mkdirSync(destDirectoryPath + '/' + files[keys[i]].name);
	// 	} else {

	// 		fs.writeFileSync(destDirectoryPath + '/' + files[keys[i]].name, files[keys[i]]._data, {
	// 			encoding: 'binary',
	// 		});
	// 	}
	// }

}
exports.copyFile = copyFile;
exports.copyDirectory = copyDirectory;
exports.copyDirectoryToOneDirectory = copyDirectoryToOneDirectory;
exports.copyFromZiptoFolder = copyFromZiptoFolder;