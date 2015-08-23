/**
 * @file IOS publisher.
 * @version 1.0.0
 * @requires module:fs
 * @requires module:child_process
 * @requires module:underscore
 * @requires module:jszip
 */
var fs = require('fs');
var spawn = require('child_process').spawnSync;
var path = require('path');

var _ = require('underscore');
var JSzip = require('jszip');

var Zipper = require('../../zipper');
var utility = require('../../utility');
var IOSConfig = require('../../config/ios');
var copy = require('../../copy');
var Configuration = require('../../configuration').Configuration;
var Des3 = require('../../3des');
var IOSStringBuilder = require('./pbxbuild');
var StringBuilder = require('./iosPbxStringBuilder');
var plistCreator = require('./plist');
var logger = require('../../log/log4j').getLogger('IosPublisher'); // logger.

var strBuilder = new StringBuilder();
var REPLACE_PRODUCT_NAME_FIRST = new RegExp(escapeRegExp('PRODUCT_NAME = "$(TARGET_NAME)"'), 'gm');
var REPLACE_PRODUCT_NAME_SECOND = new RegExp(escapeRegExp('PRODUCT_NAME = "Smartface-Demo"'), 'gm');
var REPLACE_PRODUCT_NAME_THIRD = new RegExp(escapeRegExp('productName = "Smartface-Demo"'), 'gm');
var REPLACE_PRODUCT_NAME_FOURTH = new RegExp(escapeRegExp('name = "Smartface-Demo"'), 'gm');

var OUTPUT_FOLDER = 'test-files/output/xcode';
var LICENSE_DEMO = 'Demo';
var DEST_FOLDER = 'Smartface/smfres';
var SEARCH_FIRST = '/* Begin PBXBuildFile section */';
var SEARCH_SECOND = '/* Begin PBXFileReference section */';
var SEARCH_THIRD = '/* Begin PBXGroup section */'; //children
var SEARCH_THIRD_B = 'children = (';
var SEARCH_FOURTH = '/* Begin PBXResourcesBuildPhase section */'; //files
var SEARCH_FOURTH_B = 'files = (';
var SEARCH_FIFTH = '/* Begin PBXShellScriptBuildPhase section */'; //files
var SEARCH_FIFTH_B = 'shellScript';
var DOUBLE_TAB_INDENTATION = '\r\n\t\t';
var FOURT_TAB_INDENTATION = '\r\n\t\t\t\t';
var SHELL_SCRIPT_TEXT = ' = "# unzip plugin frameworks to their related folders\\nPLUGIN_ROOT=${SOURCE_ROOT}/Smartface/smflibs/Plugins/';
var SAS_VERSION = '4.3.1';
var err = {
	err: '',
	msg: ''
};

function GET_SHELL_PLUGIN(pluginZip) {
	return '\\n\\nunzip -o \\"${PLUGIN_ROOT}/' + pluginZip +
		'\\" -d \\"${PLUGIN_ROOT}/\\"\\nrm -rf \\"$PLUGIN_ROOT/' + pluginZip + '\\"';
}

function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
/**
 * IosPublisher class.
 * @constructor IosPublisher
 *
 */
function IosPublisher() {
	var des3 = new Des3();
	var configuration = new Configuration();
	var zipper = new Zipper();

	var iosPlayerZip;
	var iosConfigInput;
	var iosConfigOutput;
	var project;
	var config2;
	var KEY = '';
	var files = [];
	var err = {
		msg: ''
	};
	var tmpdir = null;
	var dataFromArgs;
	/**
	 * start publishing --> set and control config object.
	 * @method startPublish
	 * @param {	Config}
	config config object.*@memberof IosPublisher
	 */
	this.startPublish = function(config, data) {
		dataFromArgs = data || {};
		utility.controlConfig(config);
		control_Config2_IosConfig(config);
		tmpdir = data.moduleGlobals.tmpdir;
		logger.debug('start publishing.');
		iosConfigInput = config.iosConfig.input;
		iosConfigOutput = config.iosConfig.output;
		utility.mkdirpSync(path.dirname(iosConfigOutput.outputZip));
		project = config.user.project;
		config2 = config.config2;
		KEY = config.tripleDes.key;
		iosPlayerZip = zipper.readZip(iosConfigInput.playerZip);
	}
	/**
	 * resources files copy operation --> by config.iosConfig object
	 * if license type not Demo, Script files encrypts.
	 * @method copyResourcesToSmfRes
	 * @memberof IosPublisher
	 */
	this.copyResourcesToSmfRes = function() {
		logger.debug('start copyResourcesToSmfRes() ');
		if (iosConfigInput.license.type === '' || KEY === '') {
			err.msg = ' Check config object invalid value.';
			logger.error('Checks License Type: ' + iosConfigInput.license.type + ' TripleDesKey : ' + KEY);
			throw err;
		}
		var smfResFolder = iosPlayerZip.zip.folder(DEST_FOLDER);
		var scriptFiles = fs.readdirSync(iosConfigInput.scripts);
		if (iosConfigInput.license.type !== 'Demo') {
			logger.debug('\t start Scripts files with encrypted copying ...  :' + iosConfigInput.scripts);
			_.each(scriptFiles, function(item) {
				var filename = utility.renameFilesType(item, 'jsxe');
				files.push(filename);
				smfResFolder.file(filename, des3.encryptStrWith3DES_ECB(fs.readFileSync(iosConfigInput.scripts + '/' + item, {
					encoding: 'utf8'
				}), KEY));
			});
			logger.debug('\tdone Scripts files copying . ');
		} else {
			logger.debug('\tstart Scripts files  copying ...  ' + iosConfigInput.scripts);
			_.each(scriptFiles, function(item) {
				var filename = utility.renameFilesType(item, 'jsx');
				files.push(filename);
				smfResFolder.file(filename, fs.readFileSync(iosConfigInput.scripts + '/' + item));
			});
			logger.debug('\tdone Scripts files  copying ...  ');
		}
		logger.debug('\tstart Assets , Images files copying ...  ');

		iosPlayerZip.addFilesFromFolderToFolder(DEST_FOLDER, iosConfigInput.images);
		_.each(fs.readdirSync(iosConfigInput.images), function(item) {
			files.push(item);
		});
		createSmartfaceVersionFile();
		logger.debug('\tdone Images files copying ...  ');
		logger.debug('done copyResourcesToSmfRes() ');

	}

	function createSmartfaceVersionFile() {
		iosPlayerZip.zip.folder(DEST_FOLDER).file('SmartfaceVersion.txt', '{"runtimeVersion":"' + config2.fileVersion + '", "SASVersion":"' + SAS_VERSION + '"}');
		files.push('SmartfaceVersion.txt');
	}

	/**
	 * 'defaults.xml', 'splash.smf', 'data.smf' files copy.
	 * @method copyOthersToSmfRes
	 * @memberof IosPublisher
	 */
	//  may be HARD CODED.
	this.copyOthersToSmfRes = function() {
		logger.debug('start copyOthersToSmfRes() ');
		var smfFilesFolder = project.root + '/object/Data';
		var defaultsXMLRoot = project.root;
		if (dataFromArgs.processedArgs && dataFromArgs.processedArgs.outputTempFolder) {
			smfFilesFolder = dataFromArgs.processedArgs.outputTempFolder;
		}
		if (dataFromArgs.args && dataFromArgs.args.platform === 'c9') {
			defaultsXMLRoot = project.root + '/config';
		}
		_.each(['defaults.xml', 'splash.smf', 'data.smf'], function(item) {
			files.push(item);
		});
		iosPlayerZip.addFileToFolder('defaults.xml', defaultsXMLRoot + '/defaults.xml', DEST_FOLDER);
		iosPlayerZip.addFileToFolder('data.smf', smfFilesFolder + '/data.smf', DEST_FOLDER);
		iosPlayerZip.addFileToFolder('splash.smf', smfFilesFolder + '/splash.smf', DEST_FOLDER);
		logger.debug('done copyOthersToSmfRes() ');
	}
	/**
	 * 'database.sqlite' file copy.
	 * @method copyDatabaseSqliteSmf
	 * @param {string} path path of database.sqlite
	 * @memberof IosPublisher
	 */
	//  may be HARD CODED.
	this.copyDatabaseSqliteSmf = function(pathDatabaseSqlite) {
		iosPlayerZip.addFileToFolder('database.sqlite', pathDatabaseSqlite, DEST_FOLDER);
		files.push('database.sqlite');
	}
	/**
	 * Create config2.bin -> by config.config2 object.
	 * @method createConfig2Bin
	 * @memberof IosPublisher
	 */
	this.createConfig2Bin = function() {
		logger.debug('start createConfig2Bin() ');
		if (KEY === '') {
			err.msg = ' Invalid Key !. \n You should be sure call method of startPublish() !'
			logger.error(' Invalid Key : ' + KEY + '  You should be sure call method of startPublish() ! ');
			throw err;
		}
		iosPlayerZip.zip.folder(DEST_FOLDER).file('config2.bin',
			des3.encryptStrWith3DES_ECB(configuration.createConfigXmlString(config2), KEY)
		);
		files.push('config2.bin');
		logger.debug('done createConfig2Bin() ');
	}
	/**
	 * Create license.xml -> by config.iosConfig.license object.
	 * if license type not Demo, license.xml encrypts.
	 * @method createLicenseXml
	 * @memberof IosPublisher
	 */
	this.createLicenseXml = function() {
		logger.debug('start createLicenseXml() ');
		var xmlStr = iosConfigInput.license.data;
		logger.debug('\tLicense Type : ' + iosConfigInput.license.type);
		iosPlayerZip.zip.folder(DEST_FOLDER).file('license.xml', xmlStr);
		logger.debug('done createLicenseXml() ');
		files.push('license.xml');
	}
	// pbx object creates for updatePbxProj. 
	function createPbxObjects() {
		var res = [];
		_.each(files, function(item) {
			res.push(new IOSStringBuilder(item));
		});
		return res;
	}
	// create pbx strings from pbx objects for type .
	function createPbxStringArray(iosStringBuilder, type) {
		var res = [];
		_.each(iosStringBuilder, function(item) {
			res.push(item.toIOSString(type));
		});
		return res;
	}
	// for plugins shell command.
	function createPluginsShell() {
		var plugins = [];
		_.each(iosConfigInput.plugins, function(item) {
			plugins.push(item.name + '.zip');
		});
		var shellText = [];
		_.each(plugins, function(item) {
			shellText.push(GET_SHELL_PLUGIN(item));
		});
		return shellText.join('') + '";';
	}
	/**
	 * add plugins. --> copy zip file and run it's js file.
	 * @method addPlugins
	 * @memberof IosPublisher
	 */
	function addPlugins() {
		logger.debug('start addPlugins() ');
		var pluginsFolder = iosPlayerZip.zip.folder('Smartface/smflibs/Plugins');
		var tempFolder = tmpdir + '/temp';
		var projectProjPath = tempFolder + '/project.pbxproj';
		var configJsonPath = tempFolder + '/config.json';
		if (!fs.existsSync(tempFolder)) {
			logger.debug('\t create new folder : ' + tempFolder);
			fs.mkdirSync(tempFolder);
		}
		var configJson = '{ "project":"' + projectProjPath + '"}';
		logger.debug('\t create new files : ' + projectProjPath + ' , ' + configJsonPath);
		fs.writeFileSync(projectProjPath, iosPlayerZip.zip.folder('Smartface.xcodeproj').file('project.pbxproj').asText(), 'utf8');
		fs.writeFileSync(configJsonPath, configJson, 'utf8');
		_.each(iosConfigInput.plugins, function(item) {
			var zip = new JSzip();
			var pluginJsFile = item.name + '.js';
			zip.load(fs.readFileSync(item.path), 'binary');
			var onePluginFolder = zip.folder(item.name);
			logger.debug('\t' + pluginJsFile + ' running ..');
			fs.writeFileSync(tempFolder + '/' + pluginJsFile, onePluginFolder.file(pluginJsFile).asText());
			spawn('node', [tempFolder + '/' + pluginJsFile, configJsonPath]);
			logger.debug('\t' + pluginJsFile + ' completed. ');
			pluginsFolder.file(item.name + '.zip', zip.folder(item.name).file(item.name + '.zip').asArrayBuffer());
		});
		iosPlayerZip.zip.folder('Smartface.xcodeproj').file('project.pbxproj', fs.readFileSync(projectProjPath, 'utf8'))
		utility.removeFolder(tempFolder);
		logger.debug('done addPlugins() ');
	}
	/**
	 * update pbxproj file.
	 * @method updatePbxProj
	 * @memberof IosPublisher
	 * @private
	 */
	function updatePbxProj() {
		// pbxNativeTargetSectionStarted productname, name
		// xcBuildConfigurationSectionStarted  PRODUCT_NAME.  
		logger.debug('start updatePbxProj() ');
		var data = createPbxObjects();
		var projText = iosPlayerZip.zip.folder('Smartface.xcodeproj').file('project.pbxproj').asText();

		strBuilder.startBuild(projText);
		logger.debug('\tadding buildFileSection');
		strBuilder.addFrom(createPbxStringArray(data, 'buildFileSection'), SEARCH_FIRST, {
			indentation: DOUBLE_TAB_INDENTATION
		});

		logger.debug('\tadding fileReferenceSection');
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		strBuilder.addStrToString('\n\t\t');
		strBuilder.addFrom(createPbxStringArray(data, 'fileReferenceSection'), SEARCH_SECOND, {
			indentation: DOUBLE_TAB_INDENTATION
		});
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		strBuilder.addStrToString('\n\t\t');
		strBuilder.addFrom('', SEARCH_THIRD, {
			indentation: DOUBLE_TAB_INDENTATION
		});
		logger.debug('\tadding groupSection');
		strBuilder.addFrom(createPbxStringArray(data, 'groupSection'), SEARCH_THIRD_B, {
			indentation: FOURT_TAB_INDENTATION
		});
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		strBuilder.addStrToString('\n\t\t');
		strBuilder.addFrom('', SEARCH_FOURTH, {
			indentation: DOUBLE_TAB_INDENTATION
		});
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		logger.debug('\tadding resBuildPhaseSection');
		strBuilder.addFrom(createPbxStringArray(data, 'resBuildPhaseSection'), SEARCH_FOURTH_B, {
			indentation: FOURT_TAB_INDENTATION
		});
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		strBuilder.addStrToString('\n\t\t');
		strBuilder.addFrom('', SEARCH_FIFTH);

		strBuilder.addFrom(SHELL_SCRIPT_TEXT + createPluginsShell(), SEARCH_FIFTH_B);
		strBuilder.goJumpLines(1);
		strBuilder.goJumpTabs(2);
		strBuilder.addStrToString('\n\t\t');
		logger.debug('\tadding name , productName PRODUCT_NAME : ' + iosConfigInput.infoPlist.productName);
		var projText = strBuilder.finishBuild();
		projText = projText.replace(REPLACE_PRODUCT_NAME_FIRST, 'PRODUCT_NAME = ' + iosConfigInput.infoPlist.productName);
		projText = projText.replace(REPLACE_PRODUCT_NAME_SECOND, 'PRODUCT_NAME = ' + iosConfigInput.infoPlist.productName);
		projText = projText.replace(REPLACE_PRODUCT_NAME_THIRD, 'productName = ' + iosConfigInput.infoPlist.productName);
		projText = projText.replace(REPLACE_PRODUCT_NAME_FOURTH, 'name = ' + iosConfigInput.infoPlist.productName);

		//fs.writeFileSync('test-files/output/xcode/project_cli_published.pbxproj', projText, 'utf8'); // for debug test.
		iosPlayerZip.zip.folder('Smartface.xcodeproj').file('project.pbxproj', projText);
		logger.debug('done updatePbxProj() ');
	}
	/**
	 * update InfoPlist file. --> by config.iosConfig.infoPlist object.
	 * @method updatePbxProj
	 * @memberof IosPublisher
	 */
	this.updateInfoPlist = function() {
		logger.debug('start updateInfoPlist() ');
		strBuilder.startBuild(iosPlayerZip.zip.folder('Smartface').file('Smartface-Info.plist').asText());
		logger.debug('\tadding name , CFBundleDisplayName ' + iosConfigInput.infoPlist.appName);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.appName + '</string>\r\n', '<key>CFBundleDisplayName</key>', {
			indentation: '\n\t'
		});
		logger.debug('\tadding name , CFBundleExecutable ' + iosConfigInput.infoPlist.productName);
		strBuilder.goJumpLines(2);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.productName + '</string>\r\n', '<key>CFBundleExecutable</key>', {
			indentation: '\n\t'
		});
		logger.debug('\tadding name , CFBundleIdentifier ' + iosConfigInput.infoPlist.packageName);
		strBuilder.goJumpLines(2);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.packageName + '</string>\r\n', '<key>CFBundleIdentifier</key>', {
			indentation: '\n\t'
		});
		logger.debug('\tadding name , CFBundleName ' + iosConfigInput.infoPlist.appNameShort);
		strBuilder.goJumpLines(2);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.appNameShort + '</string>\r\n', '<key>CFBundleName</key>', {
			indentation: '\n\t'
		});
		logger.debug('\tadding name , CFBundleShortVersionString ' + iosConfigInput.infoPlist.appVersion);
		strBuilder.goJumpLines(2);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.appVersion + '</string>\r\n', '<key>CFBundleShortVersionString</key>', {
			indentation: '\n\t'
		});
		logger.debug('\tadding name , CFBundleVersion ' + iosConfigInput.infoPlist.appVersion);
		strBuilder.goJumpLines(2);
		strBuilder.addFrom('<string>' + iosConfigInput.infoPlist.appVersion + '</string>\r\n', '<key>CFBundleVersion</key>', {
			indentation: '\n\t'
		});
		strBuilder.goJumpLines(2);

		var uiAppFonts = plistCreator.createUiAppFonts();
		var uiOrientation = plistCreator.createOrientation(config2.orientation);
		var bundleUrlTypes = plistCreator.createURLIdentScheme(iosConfigInput.urlIdentifier, iosConfigInput.urlSchemes);
		var bundleIcons = plistCreator.createAppIcons();
		logger.debug('\tadding others ...');
		strBuilder.addFrom('', '<key>UILaunchImages~ipad</key>');
		strBuilder.addFrom(uiAppFonts + uiOrientation + bundleUrlTypes + bundleIcons, '</array>', {
			indentation: '\n'
		});
		iosPlayerZip.zip.folder('Smartface').file('Smartface-Info.plist', strBuilder.finishBuild());
		logger.debug('done updateInfoPlist() ');

	}
	/**
	 * finish publishing. update pbxProj file.and create new zip file.
	 * @method finishPublish
	 * @memberof IosPublisher
	 */
	this.finishPublish = function() {
		updatePbxProj();
		addPlugins();
		iosPlayerZip.createZip(iosConfigOutput.outputZip);
		utility.throwsNoSuchFile(iosConfigOutput.outputZip, 'zip');
		logger.debug('outputZip : ' + iosConfigOutput.outputZip);
		logger.debug('done publishing');
	}

}
// control iosConfig objects.
function controliOSConfig(iosConfig) {
	if (iosConfig == null) {
		err.err = 'null object';
		err.msg = 'config.iosConfig object is null';

	} else if (!(iosConfig instanceof IOSConfig)) {
		err.err = 'iosConfig object';
		err.msg = 'config.iosConfig object is not iosConfig';
	}

	if (err.err !== '') {
		logger.error(err.msg);
		utility.killProcess(err);
	}

	iosConfigInput = iosConfig.input;
	utility.throwsNoSuchFile(iosConfigInput.playerZip, 'zip');
	utility.throwsNoSuchDir(iosConfigInput.scripts);
	utility.throwsNoSuchDir(iosConfigInput.assets);
	utility.throwsNoSuchDir(iosConfigInput.images);
	utility.pngImagesControl(iosConfigInput.images);
	_.each(iosConfigInput.plugins, function(item) {
		utility.throwsNoSuchFile(item.path, 'zip');
	});
}
// control iosconfig and config2 objects.
function control_Config2_IosConfig(config) {

	var iosConfig = config.iosConfig;
	var config2 = config.config2;

	if (config.tripleDes.key.length !== 24) {
		err.err = 'invalid key';
		err.msg = 'key length must be 24. key:' + config.tripleDes.key.length;

	} else {
		utility.controlProperties(config2, 'config.config2');
		utility.controlProperties(iosConfig, 'config.iosConfig');
	}

	if (err.err !== '') {
		logger.error(err.msg);
		utility.killProcess(err);
	}
	controliOSConfig(iosConfig);
}

module.exports = IosPublisher;