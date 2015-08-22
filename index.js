function cli(args) {
	var os = require('os');
	var path = require('path');

	var Logger = require('./lib/log/log4j');
	var utility = require('./lib/utility');

	var err = {
		err: '',
		message: ''
	}

	var SHOULD_LOG = false;
	utility.LogStatus.setOutJson(Boolean(args.logStdOut == 'json'));
	if (args.logLevel && args.logLevel !== 'none') {
		TO_LOG = true;
		//if not exists , create log dirs.
		utility.mkdirpSync(Logger.dateLogFolder);
		Logger.setLevel(args.logLevel);
		utility.updateLogger();
		Logger.configure();
		if (Boolean(args.logStdOut) && args.logStdOut != 'false') {
			Logger.addConsoleAppender();
			utility.LogStatus.setLogStatus(args.logStdOut);
		}

	}


	var logger = Logger.getLogger('MAIN');

	if (!args.task || ['android-full-publish', 'ios-full-publish'].indexOf(args.task) === -1) {
		if (SHOULD_LOG) {
			logger.fatal('Unknown Task : ' + args.task);
		}
		err.err = 'Unknown Task';
		err.message = 'Unknown Task : ' + args.task;
	}

	if (!args.platform || ['c9', 'win32', 'darwin', 'linux'].indexOf(args.platform) === -1) {
		args.platform = 'c9';
	}

	if (err.err !== '') {
		process.stdout.write(JSON.stringify(err));
		process.exit(err.err);
	}

	var cli = require('./lib/cli');
	var data = {
		cwd: __dirname,
		args: args,
		config: {},
		moduleGlobals: {
			root: __dirname,
			tmpdir: __dirname + '/test-files/output/temp' // temp folder.
		}
	};
	utility.tmpdir.set(data.moduleGlobals.tmpdir);
	utility.cwd(function(err, dir) {
		if (err) {
			utility.killProcess(err);
		} else if (dir) {
			data.cwd = dir;
			utility.convertAbsolute.setCwd(dir);
			// if exist file, add file.  if not exist dirs, craete it.
			if (args.logFile) {
				var absolutePath = utility.convertAbsolute.convert(args.logFile);
				utility.mkdirpSync(path.dirname(absolutePath));
				Logger.addFileAppender(absolutePath);
			}
		}

		process.chdir(__dirname);
		cli.handle_arguments(data);
	});
}

module.exports = cli;