/**
 * @file Json object that parsing from xml. includes helper functions.
 * @version 1.0.0
 *
 * @requires module:xml-parser
 * @requires module:fs
 */

/**
 * @private
 */
var fs = require('fs');

var parser = require('xml-parser'); // xml parser module.

var IS_UNDEFINED = require('underscore').isUndefined;

/**
 * Xml to json parser and it has find object methods in JSON object.
 * @constructor XmlParser
 * @param {object} jsonObject this object would be  same json.
 */
var XmlParser = function(obJson) {
	/**
	 * @private
	 */
	var obJSON = obJson,
		resChildren;
	/**
	 * Parser xml to json .
	 * @method parser
	 * @memberof XmlParser
	 * @param {string} filePathorRawXml that will be parsed.
	 * @this XmlParser
	 * @return {object} this XmlParser.
	 */
	this.parse = function(filePathorRawXml) {
		var xml;
		if (fs.existsSync(filePathorRawXml)) { // is from file ?
			// console.log( 'FILE ::' + filePathorRawXml); // for debuging
			xml = fs.readFileSync(filePathorRawXml, 'utf8');
		} else {
			xml = filePathorRawXml;
		}
		obJSON = parser(xml); // parsing.
		return this;
	};
	/**
	 * is parsed xml to json .
	 * @method isParsed
	 * @memberof XmlParser
	 * @this XmlParser
	 * @return {Boolean} parser operations result.
	 */
	this.isParsed = function() {
		return typeof obJSON.root !== 'undefined';
	}
	/**
	 *  find object from json
	 * @method findObject
	 * @memberof XmlParser
	 * @param {string} tagName objectName that will be searched.
	 * @this XmlParser
	 * @return {object} new XmlParser.
	 */
	this.findObject = function findObject(tag) {
		return new XmlParser(findObjectRec(obJSON, tag));
	};
	/**
	 * @private
	 */
	// it will do same operation.
	function findObjectRec(obJSON, tag) {
		var res;
		for (var key in obJSON) {
			// console.log(key +"    -   " +obJSON[key]);     // FOR DEBUG
			//console.log(typeof obJSON[key]+"  -  "+key + "   -   "+tag + "  ");
			//(typeof obJSON[key] === 'object')  && (obJSON[key]['name'] && (console.log(obJSON[key]['name'])));
			if ((typeof obJSON[key] === 'object') && (!IS_UNDEFINED(obJSON[key]['name']) && (obJSON[key]['name'] === tag || key === tag))) {
				res = obJSON[key] // found tag return object.
				break;
			} else {
				// if   nested  object, search recursively.
				typeof obJSON[key] === 'object' && ((Object.keys(obJSON[key]).length > 0) && (res = findObjectRec(obJSON[key], tag)));
				if ((typeof res === 'object') && (!IS_UNDEFINED(res['name']) && (res['name'] === tag))) { // if target object found ? break loop.
					break;
				}
			}
		}
		return res;
	}
	/**
	 *  find objects from json
	 * @method findObjects
	 * @memberof XmlParser
	 * @param {string} tagName objectsName that will be searched.
	 * @this XmlParser
	 * @return {Array} new XmlParser objects Array.
	 */
	this.findObjects = function(tag) {
		var arr = [];
		resChildren = [];
		findObjectsRec(obJSON, tag);
		for (var i = 0; i < resChildren.length; ++i) {
			arr.push(new XmlParser(resChildren[i]));
		}
		return arr;
	};
	/**
	 * @private
	 */
	//same operation
	function findObjectsRec(obJSON, tag) {
		for (var key in obJSON) {
			// console.log(key +"    -   " +obJSON[key]);     // FOR DEBUG
			//console.log(typeof obJSON[key]+"  -  "+key + "   -   "+tag + "  ");
			//(typeof obJSON[key] === 'object')  && (obJSON[key]['name'] && (console.log(obJSON[key]['name'])));
			if ((typeof obJSON[key] === 'object') && (!IS_UNDEFINED(obJSON[key]['name']) && (obJSON[key]['name'] === tag || key === tag))) {
				resChildren.push(obJSON[key]) // 
			}
			// if   nested  object, search recursively.
			typeof obJSON[key] === 'object' && ((Object.keys(obJSON[key]).length > 0) && (findObjectsRec(obJSON[key], tag)));


		}
	}

	/**
	 *  find object that has  the value from json
	 * @method findObjectHasTargetVal
	 * @memberof XmlParser
	 * @param {string} tagName objectName that will be searched.
	 * @param {string} value value of taht will be searched.
	 * @this XmlParser
	 * @return {object} new XmlParser.
	 */
	this.findObjectHasTargetVal = function findObjectHasTargetVal(tag, value) {
		return new XmlParser(findObjectHasTargetValRec(obJSON, tag, value));
	};
	/**
	 * @private
	 */
	// it will do same operation.
	function findObjectHasTargetValRec(obJSON, tag, value) {
		var res;
		for (var key in obJSON) {
			// console.log(key +"    -   " +obJSON[key]);     // FOR DEBUG
			//console.log(typeof obJSON[key]+"  -  "+key + "   -   "+tag + "  ");
			//(typeof obJSON[key] === 'object')  && (obJSON[key]['name'] && (console.log(obJSON[key]['name'])));
			if ((typeof obJSON[key] === 'object') && (!IS_UNDEFINED(obJSON[key]['name']) && (obJSON[key]['name'] === tag || key === tag))) {
				res = obJSON[key] // found tag return object.
				if ((typeof res === 'object') && (!IS_UNDEFINED(res['name']) && (res['name'] === tag))) { // if target object found ? break loop.
					if (!IS_UNDEFINED(res['content'])) { //availeable content.
						if (res['content'] === value) {
							break; //object found.
						}
					}
				}
			}
			// if   nested  object search recursively.
			typeof obJSON[key] === 'object' && ((Object.keys(obJSON[key]).length > 0) && (res = findObjectHasTargetValRec(obJSON[key], tag, value)));
			if ((typeof res === 'object') && (!IS_UNDEFINED(res['name']) && (res['name'] === tag))) { // if target object found ? break loop.
				if (!IS_UNDEFINED(res['content'])) { //availeable content.
					if (res['content'] === value) {
						break; //object found.
					}
				}
			}

		}
		return res;
	}

	/**
	 *  find object that has  the object that has the value, from json
	 * @method findObjectHasTargetObject
	 * @memberof XmlParser
	 * @param {string} searchedTag objectName that will be searched.
	 * @param {string} tagName objectName that will be included in searched.
	 * @param {string} value value of taht will be searched.
	 * @this XmlParser
	 * @return {object} new XmlParser.
	 */
	this.findObjectHasTargetObject = function findObjectHasTargetObject(searchedTag, targetTag, targetValue) {
		return new XmlParser(findObjectHasTargetObjectRec(obJSON, searchedTag, targetTag, targetValue));
	};
	/**
	 * @private
	 */
	// it will do same operation.
	function findObjectHasTargetObjectRec(obJSON, searchedTag, targetTag, targetValue) {
		var res;
		for (var key in obJSON) {
			// console.log(key +"    -   " +obJSON[key]);     // FOR DEBUG
			//console.log(typeof obJSON[key]+"  -  "+key + "   -   "+tag + "  ");
			//(typeof obJSON[key] === 'object')  && (obJSON[key]['name'] && (console.log(obJSON[key]['name'])));
			if ((typeof obJSON[key] === 'object') && (!IS_UNDEFINED(obJSON[key]['name']) && (obJSON[key]['name'] === searchedTag || key === searchedTag))) {
				res = obJSON[key] // found tag return object.
				if ((typeof res === 'object') && (!IS_UNDEFINED(res['name']) && (res['name'] === searchedTag))) { // if target object found ? break loop.
					if (!IS_UNDEFINED(findObjectHasTargetValRec(obJSON[key], targetTag, targetValue))) {
						//console.log(obJSON[key]); // for debuging
						break;
					}
				}
			}
			// if   nested  object search recursively.
			typeof obJSON[key] === 'object' && ((Object.keys(obJSON[key]).length > 0) && (res = findObjectHasTargetObjectRec(obJSON[key], searchedTag, targetTag, targetValue)));
			if ((typeof res === 'object') && (!IS_UNDEFINED(res['name']) && (res['name'] === searchedTag))) { // if target object found ? break loop.
				//console.log(obJSON[key]);  // for debuging
				// this object has targetTag   with targetValue ?
				if (!IS_UNDEFINED(findObjectHasTargetValRec(obJSON[key], targetTag, targetValue))) {
					//console.log(obJSON[key]); // for debuging
					break;
				}
			}

		}
		return res;
	}

	/**
	 * Get attributes from this oobjectJson.
	 * @method getAttributes
	 * @memberof XmlParser
	 * @param {string} tagName attribute that will be searched.
	 * @this XmlParser.
	 * @return {string} value value of attributes.
	 */
	this.getAttributes = function(tag) {
		if ((typeof obJSON === 'object') && !IS_UNDEFINED(obJSON['attributes']) && !IS_UNDEFINED(obJSON['attributes'][tag])) {
			//console.log( obJSON['attributes'][tag]);  // for debug.
			return obJSON['attributes'][tag];
		}
	};
	/**
	 * Get content from this oobjectJson.
	 * @method getContent
	 * @memberof XmlParser
	 * @param {string} tagName content of this object.
	 * @this XmlParser
	 * @return {string} content value of the content.
	 */
	this.getContent = function() {
		var res;
		typeof obJSON === 'object' && (!IS_UNDEFINED(obJSON['content']) && (res = obJSON['content']));
		return res;
	};

	/**
	 * Create xml String  from this objectJson.
	 * @method createXmlString
	 * @memberof XmlParser
	 * @param {string} tagName content of this object.
	 * @this XmlParser
	 * @return {string} content value of the content.
	 */
	this.createXmlString = function() {
		return createXmlStringRec(obJSON);
	};

	// same operation as a recursively.
	function createXmlStringRec(obJSON) {
		var xmlStr;

		//console.dir(obJSON);
		if (typeof obJSON === 'object' && obJSON['name'] !== '') { // is there object ?

			xmlStr = ' \n <' + obJSON['name'];
			var keys = Object.keys(obJSON['attributes']);
			if (keys.length > 0) { // if it has attributes ?
				xmlStr += '  ';
				for (var i = 0; i < keys.length; ++i) {
					xmlStr += keys[i] + '="' + obJSON['attributes'][keys[i]] + '"  ';
				}
			}
			xmlStr += '>'
			var children = obJSON['children'];
			if (children.length > 0) {
				for (var i = 0; i < children.length; ++i) {
					xmlStr += createXmlStringRec(obJSON['children'][i]);
				}

			}
			if (obJSON['content'] !== '') {
				xmlStr += obJSON['content'];
			}

		}
		xmlStr += '</' + obJSON['name'] + '>';
		return xmlStr;
	}

};


module.exports = XmlParser;
/*
  // FOR test.
var	data2Sdf =  'C://ProgramData//Smartface//Smartface App Studio//4.3//LicenseFile//data2.sfd';
var a = new XmlParser().parse(data2Sdf);
console.log(a.findObjectHasTargetObject('ApplicationPackageLicense','PackageType','Android').createXmlString());
*/

/*
var a = new XmlParser().parse('C://Users//user//Desktop//NewProject1_data//PackageProfiles.xml');


console.dir(a.findObject('packageProfiles').findObjects('folder')[1].getAttributes('name'));

*/