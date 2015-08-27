var _ = require('underscore');

var TASK = require('./task.json');

// check for arguments by the task.json.
function checkArguments(_args, _task, _platform) {
	var workSpace = getWorkSpace(_platform);
	var workSpaceArgs = TASK[_task][workSpace];
	var commonArgs = TASK[_task];

	function checkBasicArgs(_args, _task, _platform) {

	}
}

function getWorkSpace(_platform) {
	if (_platform === 'win32') {
		return 'desktop';
	}
	return 'smfCloud';
}