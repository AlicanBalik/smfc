var _ = require('underscore');

var utility = require('./utility');
var TASK = require('./task.json');

// check for arguments by the task.json.
function checkArguments(_args, _platform) {
	var task = _args.task;
	var argsKeys = _.keys(_args);
	var workSpace = getWorkSpace(_platform);
	var workSpaceArgs = TASK[task][workSpace];
	var commonArgs = TASK[task]['common'];
	var basicArgs = null;
	checkBasicArgs();
	checkArgs();
	checkUnderScoreArgs();

	function checkBasicArgs() {
		basicArgs = commonArgs.basicArguments.concat(workSpaceArgs.basicArguments);
		var diff = _.difference(basicArgs, argsKeys);
		if (!checkDiff(diff)) {
			utility.killProcess({
				err: 'Basic Arguments Error',
				msg: 'These Arguments must be setted. \n\t: ' + diff + '\n\tIf you need help, run this command : smfc --help=$(ARGUMENT)'
			});
		}
	}

	function checkArgs() {
		var optinalArgs = basicArgs.concat(commonArgs.optionalArguments.concat(workSpaceArgs.optionalArguments));
		var diff = _.difference(argsKeys, optinalArgs);
		if (!checkDiff(diff)) {
			diff.splice(0, 1); // delete '_' element
			utility.killProcess({
				err: 'Arguments Error',
				msg: 'These arguments are wrong for this task (' + task + '). \n\t: ' + diff + getUndersScoreArgs(_args) + '\n\tIf you need help, run this command : smfc --help=' + task
			});
		}
	}

	function checkUnderScoreArgs() {
		if (_args._.length !== 0) {
			utility.killProcess({
				err: 'Arguments Error',
				msg: 'These arguments are wrong for this task (' + task + ').' + getUndersScoreArgs(_args) + '\n\tIf you need help, run this command : smfc --help=' + task
			});
		}
	}
}

function getWorkSpace(_platform) {
	if (_platform === 'win32') {
		return 'desktop';
	}
	return 'smfCloud';
}

// check for minimist _ 
function checkDiff(_diff) {
	var res = false;
	if (_diff.length === 1) {
		if (_diff[0] === '_') {
			res = true;
		}
	} else if (_diff.length === 0) {
		res = true;
	}
	return res;
}

function getUndersScoreArgs(_args) {
	var res = '';
	if (_args._.length !== 0) {
		res = '\n\t: ' + _args._.join(',');
	}
	return res;
}

module.exports = {
	checkArguments: checkArguments
};