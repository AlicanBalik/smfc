/**
 * @file  Create documentation files with jsdoc.
 * @version 1.0.0
 * @requires module:child_process
 */
var exec = require('child_process').exec;

var utility = require('./utility');

var JSDOC_PATH = 'jsdoc',
	SRC_PATH = ' lib',
	OUTPUT_PATH = 'js-doc-dist';


var files = utility.searchFiles('lib');
var src = files.join(' ');

exec(JSDOC_PATH + '  ' + src + '  -d ' + OUTPUT_PATH, {
	shell: 'cmd.exe'
}).on('error', function(err) {
	console.log(err.message);
});