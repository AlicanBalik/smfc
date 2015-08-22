/**
 * Logger for creating same level logger.
 * @file log4j.js
 * @version 1.0.0
 * @requires module:fs
 * @requires module:underscore
 * @requires module:log4js
 */
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var _ = require('underscore');



var LOG_CONFIG_FILE = path.normalize(__dirname + '/../../loggerConfig.json');
var LOG_LEVELS = ['ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF'];

/**
 *  getter logger same level.
 *  default level = FATAL
 * @class Logger class.
 **/
var Logger = (function() {
	var logConfigJson = JSON.parse(fs.readFileSync(LOG_CONFIG_FILE));
	logConfigJson.appenders[0].filename = path.normalize(__dirname + '/../../' + logConfigJson.appenders[0].filename);
	var dateLogFolder = path.dirname(logConfigJson.appenders[0].filename);
	var LogLevel = 'OFF';
	/**
	 * set log level
	 * @method setLevel
	 * @param {string} level level of logs.
	 * @memberof Logger
	 */
	function setLevel(level) {
		LogLevel = getLevel(level);
		log4js.setGlobalLogLevel(level);
	}
	/**
	 * configure Logger
	 * @method configure
	 * @memberof Logger
	 */
	function configure() {
		if (LogLevel !== 'OFF') {
			log4js.configure(logConfigJson);
		}
	}
	/**
	 * addConsoleAppender  that will be logging.
	 * @method addConsoleAppender
	 * @memberof Logger
	 */
	function addConsoleAppender() {
		logConfigJson.appenders.push({
			type: 'console',
			layout: {
				type: "pattern",
				pattern: '%r - %-5p - %16c - %m'
			}
		});
		log4js.configure(logConfigJson);
	}
	/**
	 * addFileAppender  that will be logging.
	 * @method addFileAppender
	 * @memberof Logger
	 */
	function addFileAppender(filePath) {
		logConfigJson.appenders.push({
			type: 'file',
			filename: filePath,
			layout: {
				type: "pattern",
				pattern: '%r - %-5p - %-18c - %m'
			}
		});
		log4js.configure(logConfigJson);
	}
	/**
	 * get logger
	 * @method getLogger
	 * @param {string} name name of logger.
	 * @return {Logger} logger as name.
	 * @memberof Logger
	 */
	function getLogger(name) {
		var logger = log4js.getLogger(name);
		logger.setLevel(LogLevel);
		return logger;
	}

	return {
		dateLogFolder: dateLogFolder,
		addFileAppender: addFileAppender,
		addConsoleAppender: addConsoleAppender,
		getLogger: getLogger,
		setLevel: setLevel,
		configure: configure
	};

})();

function getLevel(level) {
	if (!_.isUndefined(level)) {
		var index = LOG_LEVELS.indexOf(level.toUpperCase());
		if (index !== -1) {
			return LOG_LEVELS[index];
		}
	}
	return 'OFF';
}



module.exports = Logger;