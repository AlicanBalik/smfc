/**
 * @file configuration AndroidManifest.xml, Config2.xml
 * @version 1.0.0
 *
 * @requires module:json
 * @requires module:fs
 */
var fs = require('fs'); // file system module.

var Parser = require('./xmltojson'); // xml parser module.

var logger = require('./log/log4j').getLogger('Configuration'); // logger.

/**
 * configuration AndroidManifest.xml, Config2.xml using Config element.
 * @constructor Configuration
 */
var Configuration = function() { // constructor converter object.

	/** get string of xml format with given value and tag.
	 * @method getXmlString
	 * @memberof XmlParser
	 * @private
	 * @param {string} value value of xmlTag.
	 * @param {string} tagnName name of xmlTag.
	 * @return {string} valueString xmlString that xml format given value
	 */
	function getXmlString(val, xmlTag) {
		return '<' + xmlTag + '>\r\n' + val + '\r\n\t</' + xmlTag + '>';
	}


	/**
	 * Create string that xml format,  config2.xml.
	 * @method createConfigXmlString
	 * @param { Config2 } config2 Config2 object.
	 * @return {string} xmlString  string of xml that will be created.
	 * @memberof Configuration
	 * @this Configuration
	 */
	this.createConfigXmlString = function(config2) { // xml body for config2.xml.
		var xmlStr = '<config>\r\n' //<?xml version="1.0" encoding="UTF-8"?> \n <config>\n'; // xml  root.
			+ '\t' + getXmlString(config2.splash, 'splash') + '\r\n' // splash png
			+ '\t' + getXmlString(config2.splashBackground, 'splashBackground') + '\r\n' // splashBacgroundColor
			+ '\t' + getXmlString(config2.fileVersion, 'fileVersion') + '\r\n' // fileVersion
			+ '\t' + getXmlString(Number(config2.orientation.portrait), 'splashOrientation0') + '\r\n' // SplashOrientation0
			+ '\t' + getXmlString(Number(config2.orientation.landScapeLeft), 'splashOrientation1') + '\r\n' // SplashOrientation1
			+ '\t' + getXmlString(Number(config2.orientation.landScapeRight), 'splashOrientation2') + '\r\n' // SplashOrientation2
			+ '\t' + getXmlString(Number(config2.orientation.upsideDown), 'splashOrientation3') + '\r\n' // SplashOrientation3
			+ '\t' + getXmlString(config2.appVersion, 'applicationVersion') + '\r\n' // applicationVersion
			+ '</config>\r\n'; // close root.
		//fs.writeFileSync('test-files/output/xcode/config2.xml', xmlStr, 'utf8');
		return xmlStr;
	};
	/**
	 * Edit AndroidManifestXML.
	 * @method editAndroidManifestXML
	 * @param { manifest } manifest manifest object.
	 * @return {string} edited data.
	 * @this Configuration
	 * @memberof Configuration
	 */
	this.editAndroidManifestXML = function(manifest) {
		var data = manifest.data;
		var edit = manifest.edit;

		var mapObj = { // matched object.
			appName: '${ApplicationName}',
			packageName: '${PackageName}',
			appVersion: '${Version}',
			appDescription: '${Description}',
			googleMapKey: '${GoogleMapsKey}',
			compatibleScreens: '${compatibleScreens}',
			supportsScreen: '${supportsScreens}',
			orientation: '${Orientation}'
		};
		// replace all.
		var i = 0;
		data = data.replace(/\${ApplicationName}|\${PackageName}|\${Version}|\${Description}|\${GoogleMapsKey}|\${compatibleScreens}|\${supportsScreens}|\${Orientation}/gm, function(matched) {


			for (var key in mapObj) {
				if (mapObj[key] === matched) {
					++i;
					return edit[key];
				}
			}

		});
		if (i === 0) {
			logger.warn(' AndroidMAnifest.xml  some attributes has  never changed ! ');
		}
		return data; // edited data.

	}
};

exports.Configuration = Configuration;