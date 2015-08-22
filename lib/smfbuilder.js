/**
 * @file smfbuilder using - updated Androidmanifest.xml , - created config2.xml and - encrytion files, apk extrach & built.
 * @version 1.0.0
 * @requires module:publisher
 */
var publisher = require('./publisher/index');

/**
 * This class hold private variables and has getter ,setter methods.
 * @class SmfModule
 * @return {Object} object that has  setter and getter methods.
 */
var SmfModule = (function() {
	/**
	 * task manager function.
	 * @method run
	 * @param {string} task name of task.
	 * @param {Config} config, configuration object.
	 * @memberof SmfModule
	 */
	function run(config, data) {
		if (config.task === 'android-full-publish') {
			publisher.androidFullPublish(config, data);
		} else if (config.task === 'ios-full-publish') {
			publisher.iosFullPublish(config, data);
		}
	}

	return {
		run: run
	};
})();

module.exports = SmfModule;