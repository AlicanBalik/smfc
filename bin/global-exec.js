#!/usr/bin/env node

var smartface = require('../index.js');
var args = require('minimist')(process.argv.slice(2));
var helper = require('../lib/interactive/help');


helper.controlIsHelp(args);

if (args.task) {
	smartface(args);
} else {
	var smfc = require('../lib/interactive');
	smfc(function(err, cli_args) {
		if (cli_args) {
			smartface(cli_args);
		} else if (err) {
			throw new Error(require('../lib/interactive/error').interactive);
		}
	});
}