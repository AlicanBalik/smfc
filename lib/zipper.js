/**
 * @file Zip library, Zip operations: edit, add, remove files and zip , unzip
 * 	- add files or folder
 *	- remove files or folder
 *	- edit files or folder
 *   - zip or unzip files.
 * @description Zipper Module This module achieved files and folders zip operations.
 
 * @version 1.0.0
 
 * 	@requires module:jszip
 * 	@requires module:fs
 */
var fs = require('fs');

var JSZip = require('jszip');
var unzip = require('unzip');
var _ = require('underscore');

/**
 *	Creates new zipper ,files and folders of zip_operations of class.
 * @constructor Zipper
 *
 */




var Zipper = function() {
	/**
	 * instance of JSzip object
	 *@memberof Zipper
	 */
	this.zip = new JSZip();
};
/**
	* Test zipper arguments must be  fileName (filePath)
		add files and create 'test.zip' file.
		files unlimited.
	* @method testZip
	* @this Zipper
	* @param   {string}  filePath file that added
	  @returns { Zipper }  this
	  @memberof Zipper
	*/
Zipper.prototype.testZip = function() {
	this.zip.folder('test');

	for (var i in arguments) { // add each file zip folder.
		this.zip.file(arguments[i], fs.readFileSync(arguments[i], 'utf-8'));
		console.log(arguments[i]);
	}
	var buffer = this.zip.generate({
		type: "nodebuffer"
	});
	fs.writeFileSync("test.zip", buffer);
	return new JSZip();
};

/**
	* Control file is in  this zipper object. 
	* @method isInFile
	* @this Zipper
	* @param   { string  }  filename file that searched.
	* @returns { boolean } if this file is in zipper returns true otherwise false. 
	  @memberof Zipper
	*/
Zipper.prototype.isInFile = function(fileName) {
	if (this.zip.file(fileName) !== null) {
		return true;
	}
	return false;
};

/**
	* Add fileto folder in the current Zipper object. 
	* @method addFileToFolder
	* @this Zipper
	* @param   {string} filename filename that will be added in current zipper.
	* @param   {string} filePath file that added.
	* @param   {string} folderPath  to the folder in current zipper.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.addFileToFolder = function(fileName, filePath, folderPath) {

	this.zip.folder(folderPath).file(fileName, fs.readFileSync(filePath));
	return this;
};

/**
	* Add folder in the current Zipper object. 
	* @method addFolder
	* @this Zipper
	* @param   {string} folderPath folder that added.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.addFolder = function(foldername) {

	this.zip.folder(foldername);
	return this;
};

/**
	* Add / Edit file in the current Zipper object. 
	* If file isn't exist add new file.
	* @method addEditFile
	* @this Zipper
	* @param   {string} filename file that edited.
	* @param   {string}  content content of file that edited.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.addEditFile = function(filename, content) {


	this.zip.file(filename, content);

	return this;
};

/**
	* Delete a file or folder (recursively).
	* @method remove
	* @this Zipper
	* @param   {string} filePath File or Folder  that will be deleted.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.remove = function(filePath) {

	this.zip.remove(filePath);
	return this;
};

/**
	* Create a zip file.
	* @method createZip
	* @this Zipper
	* @param   {string} zipFilePath zip file that will be created.
	* @returns { Zipper } this
	* @throws Will throw an error if couldn't created ! 
	  @memberof Zipper
	*/
Zipper.prototype.createZip = function(zipFilePath) {

	var buffer = this.zip.generate({
		type: 'nodebuffer',
		platform: 'UNIX',
		compression: "DEFLATE"
	});
	fs.writeFileSync(zipFilePath, buffer);

	return this;
};

/**
	* Read a zip file in the current folder on Zipper Object.
	* @method readZip
	* @this Zipper
	* @param   {string} zipFilePath  zip file that will be read.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.readZip = function(zipFilePath) {

	this.zip.load(fs.readFileSync(zipFilePath, 'binary'));

	return this;
};


/**
	* Add files in the current Zipper object from  that given folder. 
	* @method addFilesFromFolder
	* @this Zipper
	* @param   {string} folderPath folderpath that containing the files that will be added.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.addFilesFromFolder = function(folderPath) {
	var files = fs.readdirSync(folderpath);
	for (var i = 0; i < files.length; ++i) {
		this.zip.file(files[i], fs.readFileSync(folderPath + '/' + files[i]));
	}
	return this;
};
/**
	* Add folder in the current Zipper object and   files that given folder and sub folder. 
	* @method addFilesFromFolderToFolder
	* @this Zipper
	* @param   {string} folderName folder that will be added.
	* @param   {string} folderPath folderpath that containing the files that will be added.
	* @returns { Zipper } this
	  @memberof Zipper
	*/
Zipper.prototype.addFilesFromFolderToFolder = function addFilesFromFolderToFolder(foldername, folderPath) {
	var files = fs.readdirSync(folderPath),
		folder = this.zip.folder(foldername);
	for (var i = 0; i < files.length; ++i) {
		if (fs.statSync(folderPath + '/' + files[i]).isDirectory()) {
			addFilesFromFolderToFolder.call(this, foldername, folderpath + '/' + files[i]); // call recursively.
		} else {
			folder.file(files[i], fs.readFileSync(folderPath + '/' + files[i]));
		}
	}
	return this;
};
/**
	* Extract zip file   in folder. 
	* @method extract
	* @this Zipper
	* @param   {string} zipPath path of zip file that will be extracted.
	* @param   {string} outPath destination path..
	* @returns { undefined } undefined
	  @memberof Zipper
	*/
Zipper.prototype.extract = function(zipPath, outPath, callBack, config) {
	fs.createReadStream(zipPath).pipe(unzip.Extract({
		path: outPath
	}).on('close', function(code) {
		callBack(config);
	}));
}



module.exports = Zipper;