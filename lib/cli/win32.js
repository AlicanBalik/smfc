var utility = require('../utility');
var smfModule = require('../smfbuilder');
var collector = require('../collector/index');

function run(data) {
	var argv = data.args;
	if (!argv.java && argv.task === 'android-full-publish') {
		return utility.javaFinder(function(err, javaPath) {
			if (javaPath) {
				argv.java = javaPath;
				execute(data);
			}
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