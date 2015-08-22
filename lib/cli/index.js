function handle_arguments(data) {
	var task_handler;
	var args = data.args;
	switch (args.platform) {
		case "win32":
			task_handler = require('./win32');
			break;
		case "c9":
		case "darwin":
		case "linux":
			task_handler = require('./c9');
			break;
	}
	task_handler.handle_task(data);
}

exports.handle_arguments = handle_arguments;