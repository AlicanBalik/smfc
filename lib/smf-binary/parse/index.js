var stringParser = require('./string');
var intParser = require('./int');
var boolParser = require('./bool');

module.exports = {
	'string': stringParser,
	'int': intParser,
	'bool': boolParser
};