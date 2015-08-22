/**
 * @file plist.
 * @version 1.0.0
 */


var UI_APP_FONTS = '\t<key>UIAppFonts</key>\r\n' +
	'\t<array>\r\n' +
	'\t</array>\r\n';
var PLIST_BACKGROUND_PLAY =
	'\t<key>UIBackgroundModes</key>\r\n' +
	'\t<array>\r\n' +
	'\t\t<string>audio</string>\r\n' +
	'\t</array>\r\n';

var PLIST_APP_ICONS =
	'\t<key>CFBundleIcons</key>\r\n' +
	'\t<dict>\r\n' +
	'\t\t<key>CFBundlePrimaryIcon</key>\r\n' +
	'\t\t<dict>\r\n' +
	'\t\t\t<key>CFBundleIconFiles</key>\r\n' +
	'\t\t\t<array>\r\n' +
	'\t\t\t\t<string>Icon-40</string>\r\n' +
	'\t\t\t\t<string>Icon-Small</string>\r\n' +
	'\t\t\t\t<string>Icon-Small-50</string>\r\n' +
	'\t\t\t\t<string>Icon-60</string>\r\n' +
	'\t\t\t\t<string>Icon</string>\r\n' +
	'\t\t\t</array>\r\n' +
	'\t\t</dict>\r\n' +
	'\t</dict>\r\n' +
	'\t<key>CFBundleIcons~ipad</key>\r\n' +
	'\t<dict>\r\n' +
	'\t\t<key>CFBundlePrimaryIcon</key>\r\n' +
	'\t\t<dict>\r\n' +
	'\t\t\t<key>CFBundleIconFiles</key>\r\n' +
	'\t\t\t<array>\r\n' +
	'\t\t\t\t<string>Icon-Small</string>\r\n' +
	'\t\t\t\t<string>Icon-40</string>\r\n' +
	'\t\t\t\t<string>Icon-Small-50</string>\r\n' +
	'\t\t\t\t<string>Icon-76</string>\r\n' +
	'\t\t\t\t<string>Icon-72</string>\r\n' +
	'\t\t\t\t<string>Icon-60</string>\r\n' +
	'\t\t\t\t<string>Icon</string>\r\n' +
	'\t\t\t</array>\r\n' +
	'\t\t</dict>\r\n' +
	'\t</dict>';

var PLIST_UISUPPORTED_ORIENTATION =
	'\t<key>UISupportedInterfaceOrientations</key>\r\n' +
	'\t<array>\r\n' +
	'\t\t<string>UIInterfaceOrientationPortrait</string>\r\n' +
	'\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\r\n' +
	'\t\t<string>UIInterfaceOrientationLandscapeRight</string>\r\n' +
	'\t\t<string>UIInterfaceOrientationPortraitUpsideDown</string>\r\n' +
	'\t</array>\r\n' +
	'\t<key>AppOrientations</key>\r\n';

var PLIST_BUNDLE_URL_TYPES = function(url, scheme) {
		var urlTemp = '',
			schemeTemp = '';
		if (url) {
			urlTemp = url;
		}
		if (scheme) {
			schemeTemp = scheme;
		}
		return '\t<key>CFBundleURLTypes</key>\r\n' +
			'\t<array>\r\n' +
			'\t\t<dict>\r\n' +
			'\t\t\t<key>CFBundleURLName</key>\r\n' +
			'\t\t\t<string>' + urlTemp + '</string>\r\n' +
			'\t\t\t<key>CFBundleURLSchemes</key>\r\n' +
			'\t\t\t<array>\r\n' +
			'\t\t\t\t<string>' + schemeTemp + '</string>\r\n' +
			'\t\t\t</array>\r\n' +
			'\t\t</dict>\r\n' +
			'\t</array>\r\n';
	}
	/**
	 * plist creator class.
	 * @class PlistCreator
	 *
	 */
var PlistCreator = (function() {
	/**
	 * UI App Fonts creator.
	 * @method createUiAppFonts
	 * @memberof PlistCreator
	 * @return default ui app fonts with format plist.
	 */
	function createUiAppFonts() {
		return UI_APP_FONTS;
	}
	/**
	 * Device orientations creator.
	 * @method createOrientation
	 * @param {Orientation} oriConfig   orientation object.
	 * @memberof PlistCreator
	 * @return supported & default orientations with format plist.
	 */
	function createOrientation(oriConfig) {
		var oriStr = PLIST_UISUPPORTED_ORIENTATION;
		oriStr += '\t<array>\r\n';
		if (oriConfig.portrait) {
			oriStr += '\t\t<string>UIInterfaceOrientationPortrait</string>\r\n';
		}
		if (oriConfig.landScapeLeft) {
			oriStr += '\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\r\n';
		}
		if (oriConfig.landScapeRight) {
			oriStr += '\t\t<string>UIInterfaceOrientationLandscapeRight</string>\r\n';
		}
		if (oriConfig.upsideDown) {
			oriStr += '\t\t<string>UIInterfaceOrientationUpsideDown</string>\r\n';
		}
		oriStr += '\t</array>\r\n';
		return oriStr;
	}
	/**
	 * URL identifier & schemes creator .
	 * @method createURLIdentScheme
	 * @param {string} urlId   url identifier
	 * @param {string} scheme  url schemes
	 * @memberof PlistCreator
	 * @return formed URl id & schemes with format plist. .
	 */
	function createURLIdentScheme(urlId, scheme) {
		return PLIST_BUNDLE_URL_TYPES(urlId, scheme);
	}
	/**
	 * App Icons creator.
	 * @method createAppIcons
	 * @memberof PlistCreator
	 * @return default ıcons with format plist.
	 */
	function createAppIcons() {
		return PLIST_APP_ICONS;
	}
	return {
		createOrientation: createOrientation,
		createURLIdentScheme: createURLIdentScheme,
		createAppIcons: createAppIcons,
		createUiAppFonts: createUiAppFonts
	};
})();

module.exports = PlistCreator;