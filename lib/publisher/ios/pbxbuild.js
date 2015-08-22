/**
 * @file PBX builder.
 * @version 1.0.0
 * @requires module:node-uuid
 */
var utility = require('../../utility');
var generateUUID = utility.generateUUID;

/**
 * ios string builder to edit proj file.
 * @constructor iOSStringBuilder
 * @param {string} filename name of file.
 * @param {string} type type of file default: file.
 *
 */
var iOSStringBuilder = function(filename, type) {
	this.fileName = filename;
	var rndUUID = generateUUID(); // get UUID.
	this.pbxBuildFileId = rndUUID.substr(0, 24);
	this.fileRefId = rndUUID.substr(8, 31);
	this.type = 'file';
	typeof type !== 'undefined' && (this.type = type);
}

/**
 *  PBXString builder function.
 *  @methodtoIOSString
 *  @memberof iOSStringBuilder
 *  @param {string} type type of operation.
 *  @return {string} result of op.
 *  @this iOSStringBuilder
 */
iOSStringBuilder.prototype.toIOSString = function(type) {
	var type_specific_str = '';
	if (type === 'buildFileSection') {
		type_specific_str = this.pbxBuildFileId + ' /* ' + this.fileName +
			' in Resources */ = {isa = PBXBuildFile; fileRef = ' + this.fileRefId +
			' /* ' + this.fileName + ' */; };';

	} else if (type === 'resBuildPhaseSection') {
		type_specific_str = this.pbxBuildFileId + ' /* ' + this.fileName + ' */,';

	} else if (type === 'groupSection') {
		type_specific_str = this.fileRefId + ' /* ' + this.fileName + ' */,';

	} else if (type === 'fileReferenceSection') {
		type_specific_str = this.fileRefId + ' /* ' + this.fileName +
			' */ = {isa = PBXFileReference; lastKnownFileType= ' + this.type + '; path = "' + this.fileName +
			'"; sourceTree = "<group>"; };';

	}
	return type_specific_str;
}


module.exports = iOSStringBuilder;