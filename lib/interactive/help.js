var HelpModule = (function() {

	var helper = (function() {
		var repeatStr = require('../utility').repeatStr;

		function Helper() {
			var chalk = require('chalk');
			var fitFlagPad = 0;
			var _pad = '  ';
			var _usage;
			var _description;
			var _options = [];
			var _more = [];
			var write = function(str) {
				if (str) {
					console.log(_pad + str);
				} else {
					console.log(_pad);
				}
			};

			this.addOption = function(option) {
				_options.push(option);
			}

			this.addUsage = function(usage) {
				_usage = usage;
			}

			this.addDescription = function(desc) {
				_description = desc;
			}

			this.addMore = function(more) {
				_more.push(more);
			}

			this.help = function() {
				_.each(_options, function(item) { // found fit pad by the flag length
					if (item.flag.length > fitFlagPad) {
						fitFlagPad = item.flag.length + 2;
					}
				});
				write();
				write('Usage: ' + _usage);
				write();
				write(_description);
				write();
				write('Options:');
				write();
				_.each(_options, function(item) {
					write(_pad + item.flag + repeatStr(' ', fitFlagPad - item.flag.length) + item.description);
				});
			}

			this.helpOption = function(_option) { // help for options more informations
				write();
				write('Option: ' + crtStr(color.options, _option.long));
				write();
				write(_pad + _option.description);
				write();
				write('Example: ');
				write();
				write(_pad + _option.example);
				write();
				write('Description: ');
				write();
				write(_pad + crtStr(color.description, _option.deepDescription));
			};

			this.helpTask = function(_publish, name) { // help for publish
				write();
				write('Task: ' + crtStr(color.options, name));
				write();
				write(_pad + _publish.description);
				write();
				write('Necessary: ');
				write();
				write(_pad + crtStr(color.options, _publish.necessary.join('\r\n' + _pad + _pad)));
				write();
				write('Optional: ');
				write();
				write(_pad + crtStr(color.options, _publish.optional.join('\r\n' + _pad + _pad)));
				write();
				write('Example: ')
				write();
				write(_pad + _publish.example);
				write();
				write('Advanced Example: ')
				write();
				write(_pad + _publish.advancedExample);
				write();
				write('Description: ');
				write();
				write(_pad + crtStr(color.description, _publish.deepDescription));
			}

		}
		return new Helper();

	})();

	var _ = require('underscore');
	var helpJson = require('./help.json');
	var crtStr = require('./ui').createStr;
	var header = require('./ui').header;

	if (helpJson) {
		var color = helpJson.color;
		var options = helpJson.options;

		helper.addUsage(helpJson.usage);
		helper.addDescription(helpJson.description);
		helper.addOption({
			flag: crtStr(color.options, helpJson.help.short) + crtStr('green', ', ') + crtStr('green', helpJson.help.long),
			description: crtStr(color.description, helpJson.help.description)
		});
		helper.addOption({
			flag: crtStr(color.options, options.interactive.short) + crtStr('green', ', ') + crtStr('green', options.interactive.long),

			description: crtStr(color.description, options.interactive.description)
		});
		_.each(_.keys(options), function(item) {
			if (item !== 'interactive') {
				var optMessage = crtStr(color.options, options[item].long) +
					crtStr(color.assign, '=') +
					crtStr(color.value, options[item].value);
				helper.addOption({
					flag: optMessage,
					description: crtStr(color.description, options[item].description)
				});
			}
		});

	} else {
		throw new Error(require('./error').json);
	}

	function controlIsHelp(args) {
		var tasks = require('./tag').getList('TASK');
		var index = tasks.indexOf(args.help);

		if (args.help && !_.isUndefined(options[args.help])) {
			header();
			helper.helpOption(options[args.help]);
			process.exit();
		} else if (index !== -1 && !_.isUndefined(helpJson.task[tasks[index]])) {
			header();
			helper.helpTask(helpJson.task[tasks[index]], tasks[index]);
			process.exit();
		} else if (args.h || args.help || (!args.task && !args.i && !args.interactive)) {
			header();
			helper.help();
			process.exit();
		}
	}



	return {
		helper: helper,
		controlIsHelp: controlIsHelp
	};
})();
// Expose Helper module
module.exports = HelpModule;