var os = require('os');
var utility = require('../utility');
var collector = require('../collector/index');
var createSmfBinary = require('../smf-binary/index').create;
var smfModule = require('../smfbuilder');

function run(data) {
	var argv = data.args;
	var platform = os.platform();
	if (!argv.java && argv.task === 'android-full-publish') {
		return utility.javaFinder(function(err, path) {
			argv.java = path;
			execute(data);
		});
	}
	execute(data);
}

function execute(data) {
	var argv = data.args;
	var config = collector.collect(data, argv.platform, argv);
	smfModule.run(config, data);
}

exports.handle_task = run;