var _Error = (function() {
	var _errorJson = require('./error.json');

	if (!_errorJson) {
		throw new Error('JSON parse error');
	}
	return _errorJson;
})();

module.exports = _Error;