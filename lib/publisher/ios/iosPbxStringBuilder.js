/**
 * string builder , high performance , string operations.
 * @file iosPbxStringBuilder
 * @version 1.0.0
 */

var SEARCH_FIRST = '/* Begin PBXBuildFile section */';
var SEARCH_SECOND = '/* Begin PBXFileReference section */';
var SEARCH_THIRD = '/* Begin PBXGroup section */'; //children
var SEARCH_THIRD_B = 'children = (';
var SEARCH_FOURTH = '/* Begin PBXResourcesBuildPhase section */'; //files
var SEARCH_FOURTH_B = 'files = (';
var DOUBLE_TAB_INDENTATION = '\r\n\t\t';
/**
 *  Class string builder
 * 	@constructor StringBuilder
 *
 */
var StringBuilder = function() {
	var str = '';
	var outStr = null;
	var lastPos = null;

	/**
	 * start of the building.
	 * @method startBuild
	 * @param {string} string str that will be edited.
	 * @memberof StringBuilder
	 */
	this.startBuild = function(string) {
		str = string;
		outStr = [];
		lastPos = 0;
	}
	/** 
	 * Add string  in the current  string, from after searched index..
	 * @method addFrom
	 * @param {string} newStr new string that will be added.
	 * @param {string} strThatSearched string that searched in the current index.
	 * @param {options} options if you want add between indentation string.
	 * @memberof StringBuilder
	 */
	this.addFrom = function(newStr, strThatSearched, options) {
		var indentation = null;
		if (options) {
			options.indentation && (indentation = options.indentation);
		}
		var pos = str.indexOf(strThatSearched, lastPos);
		var indent = '';

		indentation && (indent = indentation);
		if (pos > -1) {
			pos += strThatSearched.length;
			outStr.push(str.substring(lastPos, pos) + indent);
			if (!(newStr instanceof Array)) {
				outStr.push(newStr);
			} else {
				outStr.push(newStr.join(indent));
			}

			lastPos = pos;
		}
	}
	/**
	 * Add string  in the current  string from after last position.
	 * @method addStrToString
	 * @param {string} string str that will be added.
	 * @memberof StringBuilder
	 */
	this.addStrToString = function(str) {
		outStr.push(str);
	}
	/**
	 * jump next \n characters.
	 * @method goJumpLines
	 * @param {Number} lineNum num of lines  that will be jumpping .
	 * @memberof StringBuilder
	 */
	this.goJumpLines = function(lineNum) {
		for (var i = 0; i < lineNum; ++i) {
			lastPos = str.indexOf('\n', lastPos) + 1;
		}
	}
	/**
	 * jump next \t characters.
	 * @method goJumpTabs
	 * @param {Number} num num of tabs  that will be jumpping .
	 * @memberof StringBuilder
	 */
	this.goJumpTabs = function(num) {
		for (var i = 0; i < num; ++i) {
			lastPos = str.indexOf('\t', lastPos) + 1;
		}
	}
	/**
	 * Finish building.
	 * @method finishBuild
	 * @param {string} indentation indentation of join operation that newString  that will be created .
	 * @return {string} new String that was craeted.
	 * @memberof StringBuilder
	 */
	this.finishBuild = function(indentation) {
		outStr.push(str.substr(lastPos, str.length));
		var indent = '';
		indentation && (indent = indentation);
		return outStr.join(indent);
	}
}

module.exports = StringBuilder;