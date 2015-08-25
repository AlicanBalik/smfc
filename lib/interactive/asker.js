var _ = require('underscore');
var inquirer = require("inquirer");

var answered = require('./answered');
/**
 *  questioner with inquirer.js
 */
function asker(question, callback, opt) { // create qeustion.
	var midObj = null;
	if (opt) {
		opt.midObj && (midObj = opt.midObj);
		opt.opt && _.extend(question, opt.opt);
	}
	inquirer.prompt(question, function(answer) {
		if (midObj) { // maybe android || auth
			answered[midObj][question.name] = answer[question.name];
		} else {
			answered[question.name] = answer[question.name];
		}
		callback();
	});
}

var QUESTIONS = (function() {
	var fs = require('fs');
	var path = require('path');
	var Default = require('./tag');
	var fitDescriptionSize = 10;
	var playerDir = path.resolve(__dirname, '../../bin');
	var changed = { // change 
		'"$$task"': '"' + Default.def.TASK.ANDROID_FULL_PUBLISH + '"',
		'"$$workSpaceType"': '"' + Default.def.WORKSPACE.SMFC + '"',
		'"$$java"': '"Java 1.7 Not Found !"',
		'"$$outputRoot"': '"."',
		'"$$license"': '"' + Default.def.LICENSE.DEMO + '"',
		'"$$profile"': '"' + Default.def.ANDROID.PROFILE + '"',
		'"$$projectRoot"': '"."',
		'"$$playerArm"': '"' + path.join(playerDir, 'SmartfacePlayer.apk').replace(/\\/gmi, '/') + '"',
		'"$$playerx86"': '"' + path.join(playerDir, 'SmartfacePlayer-x86.apk').replace(/\\/gmi, '/') + '"',
		'"$$playeriOS"': '"' + path.join(playerDir, 'iOS_Player.zip').replace(/\\/gmi, '/') + '"',
		'"$$plugin"': 'false'
	};
	var questionJSON = fs.readFileSync(__dirname + '/questions.json', 'utf8');
	questionJSON = questionJSON.replace(/\"\$\$.*\"/gmi, function(item) {
		return changed[item];
	});
	var questionObj = null;
	try {
		questionObj = JSON.parse(questionJSON);
		_.each(_.keys(questionObj), function(item) {
			var len = (!questionObj[item].description) ? 0 : questionObj[item].description.length;
			if (len > fitDescriptionSize) {
				fitDescriptionSize = len + 2;
			}
		});
		_.extend(questionObj, {
			fitDescriptionSize: fitDescriptionSize
		});
	} catch (err) {
		// TO DO HANDLE ERROR
		console.dir('Error JSON parse : ' + err);
		process.exit();

	}
	return questionObj;
})();

module.exports = {
	asker: asker,
	QUESTIONS: QUESTIONS
}