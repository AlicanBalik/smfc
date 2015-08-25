var inquirer = require("inquirer");
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

var _ = require('underscore');
var QUESTIONS = require('./asker').QUESTIONS;


var UI = (function _UI() { // modul writer for informations
	var UIJSON = require('./ui.json');
	var color = UIJSON.color;
	var message = UIJSON.message;
	var completeList = [];
	var version = '0.0.1';
	var answered = require('./answered');
	var OK = 'OK';
	var USER_INTERFACE = true;
	if (process.platform !== 'win32') {
		OK = '√';
	}

	function createSelfFunction(func) {
		if (USER_INTERFACE) {
			return func;
		} else {
			return function() {};
		}
	}

	function getVersion() {
		return require('../../package.json').version;
	}

	version = getVersion();

	function header() { // Hedaer.
		write(color.header, '\n  ' + message.header + ', ' + message.version, true);
		write(color.version, version, true);
		write('blue', '  ', true);
		write('yellow', '\n\n', true);
	}

	function complete(str) { // update informations
		var tempStr = '';
		process.stdout.write('\033c'); // clear console.
		header(version);
		if (str) {
			tempStr += createOK();
			tempStr += createStr(color.key, str + '  ');
			for (var i = 0; i < QUESTIONS.fitDescriptionSize - str.length; ++i) {
				tempStr += createStr(color.arrow, '-');
			}
			tempStr += createStr(color.arrow, '→  ');
			tempStr += createStr(color.value, getValues(str));
			completeList.push(tempStr);
		}
		console.log(completeList.join('\r\n'));
	}

	function createOK() {
		return createStr(color.ok, '  ' + OK + '  ');
	}

	function pushComplete(str) {
		completeList.push(str);
	}

	function wait(str) { // next question ,write yellow 
		write(color.wait, '  »  ', true);
		write(color.wait, str + '\n', true);
	}

	function error(str) {
		write(color.error, '  !  ', true);
		write(color.error, str + '\n', true);
	}

	function setAnswered(ans) {
		answered = ans;
	}

	function createStr(color, str) {
		return chalk.styles[color].open + str + chalk.styles[color].close;

	}

	function write(color, str, isRaw) {
		var msg = chalk.styles[color].open + str + chalk.styles[color].close;
		if (isRaw) {
			process.stdout.write(msg);
		} else {
			console.log(msg);
		}
	}

	function getValues(name) {
		var res;
		switch (name) {
			case QUESTIONS.task.description:
				res = answered.task;
				break;
			case QUESTIONS.license.description:
				res = answered.license;
				break;
			case QUESTIONS.outputRoot.description:
				res = answered.outputRoot;
				break;
			case QUESTIONS.projectRoot.description:
				res = answered.projectRoot;
				break;
			case 'project sfpx':
				res = answered.sfpx;
				break;
			case QUESTIONS.java.description:
				res = answered.android.java;
				break;
			case QUESTIONS.workspace.description:
				res = answered.workSpaceType;
				break;
			case QUESTIONS.playerArm.description:
				res = answered.android.playerArm;
				break;
			case QUESTIONS.playerx86.description:
				res = answered.android.playerx86;
				break;
			case QUESTIONS.playeriOS.description:
				res = answered.iOS.playeriOS;
				break;
			case QUESTIONS.profiles.description:
				res = answered.android.profiles.join(', ');
				break;
			case QUESTIONS.login.description:
				res = answered.auth.name;
				break;
			case QUESTIONS.logout.description:
				res = answered.auth.name;
				break;
			case QUESTIONS.plugin.description:
				if (answered.pluginNames.length !== 0) {
					res = answered.pluginNames[answered.pluginNames.length - 1];
				} else {
					res = (answered.plugin && 'Yes') || 'No';
				}
				break;
			default:
				res = answered[name];
		}
		return res;
	}
	var BottomBar = (function() {
		var bar = null;
		var _pad = '    ';

		function update(color, str) {
			bar = bar || new inquirer.ui.BottomBar();
			var msg
			if (color) {
				msg = chalk.styles[color].open + _pad + str + chalk.styles[color].close;
			} else {
				msg = str;
			}
			bar.updateBottomBar(msg);
		}
		return {
			update: update
		}
	})();

	return {
		setAnswered: setAnswered,
		complete: createSelfFunction(complete),
		wait: createSelfFunction(wait),
		write: createSelfFunction(write),
		error: createSelfFunction(error),
		bottomBar: BottomBar,
		version: version,
		header: header,
		createStr: createStr,
		pushComplete: pushComplete,
		createOK: createOK,
		color: color,
		message: message
	};
})();

module.exports = UI;