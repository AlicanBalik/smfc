var spawn = require('child_process').spawn;
var path = require('path');

var _ = require('underscore');

var collector = require('./collector');
var getProfileType = require('../utility').getProfileType;


function prepareParams() {
	var params = [path.join(__dirname, '../../bin/global-exec')];
	var args = collector.collect();
	_.each(_.keys(args), function(item) {
		if (item === 'plugin') {
			_.each(args[item], function(_item) {
				params.push('--' + item + '=' + _item);
			});
		} else {
			if (args[item]) {
				params.push('--' + item + '=' + args[item]);
			}
		}
	});
	return params;
}

function run(callback) {
	var MAX_STEP = 5;
	var enabledFinish = false;
	var UI = require('./ui');
	var crtStr = UI.createStr;
	var ok = UI.createOK;
	var color = UI.color;
	var uiMsg = UI.message;
	var _pad = '    ';
	var child = spawn('node', prepareParams());
	if (!child || !child.stdout) {
		throw new Error(require('./error').child);
	}
	var incommingData = '';
	var updateStr = '';
	var spinner = [' \\ ', ' | ', ' / ', ' - '];
	var counter = 0;
	var updaterStr = uiMsg.waitMessage;
	var countEmptyStep = 0;
	var downloadFilePath = '';
	var currProcesStr = '';
	var responseDone = false;
	var bottomBar = UI.bottomBar;

	child.stdout.on('data', function(_data) {
		incommingData += _data.toString('utf8');
	});
	process.stdout.write('\x1b[?25l'); // cursor hide.
	bottomBar.update(null, updateStr);
	var updater = setInterval(function() { // start updater.
			var obj = findObj(incommingData);
			var indexFirst = obj.first;
			var indexLast = obj.last;
			if ((indexFirst !== -1) && (indexLast !== -1)) {
				jsonObj = JSON.parse(incommingData.substring(indexFirst, indexLast + 1));
				incommingData = incommingData.substr(indexLast + 1, incommingData.length);
				if (jsonObj) {
					counter = 0;
					countEmptyStep = 0;
					if (jsonObj.err) {
						UI.complete();
						UI.error(jsonObj.msg);
						process.exit();
					} else if (jsonObj.nextProfile) {
						UI.pushComplete(' ');
						UI.complete();
						updaterStr = '';
						currProcesStr = 'Android Publish -> Profile: ' + getProfileType(jsonObj.x86) + ' - ' + jsonObj.nextProfile + ' ... ';
						UI.wait(currProcesStr);
					} else if (jsonObj.nextIOS) {
						UI.pushComplete(' ');
						UI.complete();
						updaterStr = '';
						currProcesStr = 'iOS Publish ... ';
						UI.wait(currProcesStr);
					} else if (jsonObj.downloadFilePath) {
						downloadFilePath = jsonObj.downloadFilePath;
					} else if (jsonObj.msg) {
						updaterStr = crtStr(color.feedBack, jsonObj.msg);
						bottomBar.update(null, updateStr);
					}
					if (jsonObj.responseDone) {
						responseDone = jsonObj.responseDone;
						if (!jsonObj.ios) {
							UI.pushComplete(ok() + crtStr(color.key, currProcesStr.replace('...', ': ')) + crtStr(color.ready, uiMsg.readyApk));
						} else {
							UI.pushComplete(ok() + crtStr(color.key, currProcesStr.replace('...', ': ')) + crtStr(color.ready, uiMsg.readyXcode));
						}
						UI.pushComplete(_pad + crtStr(color.output, 'Output: ') + crtStr(color.filePath, downloadFilePath));
						UI.complete();
						updaterStr = uiMsg.waitMessage;
						bottomBar.update(null, updateStr);
					}
				}
			} else {

				if (enabledFinish) {
					++countEmptyStep;
				}
				bottomBar.update(null, crtStr(color.wait, spinner[counter++ % 4]) + updaterStr);
				//process.stdout.cursorTo(0); // spinner  // other spinner
				//process.stdout.write(crtStr(color.wait, spinner[counter++ % 4]));
			}
			if (countEmptyStep > MAX_STEP) {
				bottomBar.update(color.ok, '\n' + uiMsg.finalMessage);
				process.stdout.write('\x1b[?25h'); // cursor show.
				clearInterval(updater); // clear updater.
				callback(null, null);
			}
		},
		50);

	child.stdout.on('end', function(code) {
		enabledFinish = true;
	});


	function findObj(data) { // get one json object
		var index1 = 0,
			index2 = 0,
			tempIndex,
			res = {
				first: -1,
				last: -1
			},
			loop = true;

		index1 = data.search('{');
		index2 = data.search('}');
		if (index1 !== -1 && index2 !== -1) {
			tempIndex = index1;
			while (loop) {
				tempIndex = data.indexOf('{', tempIndex + 1);
				if (tempIndex === -1 || tempIndex > index2) {
					loop = false;
					res.first = index1;
					res.last = index2;
				} else {
					index2 = data.indexOf('}', index2 + 1);
				}

			}
		}

		return res;
	}


}

module.exports = run;