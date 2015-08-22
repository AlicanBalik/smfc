var spawn = require('child_process').spawn;

var typErr = require('./error').type;

function gitClone(link, callback, dir) { // git clone  link [dir].
	var buffer = new Buffer('');
	var params = ['clone', link];
	dir && (params.push(dir));
	var child = spawn('git', params);
	child.stdout.on('data', function(data) {
		buffer += data;
	});
	child.stderr.on('data', function(_data) {
		buffer += _data;
	});
	child.on('close', function(code) {
		if (buffer.search(/fatal:.*access/gmi) !== -1) {
			callback({
				err: typErr.network,
				msg: buffer
			});
		} else if (buffer.search(/fatal:|not found/gmi) !== -1) { // any errors
			callback({
				err: typErr.existing,
				msg: buffer
			});
		} else {
			callback(null);
		}
	});
	child.on('error', function(_err) {
		callback({
			err: typErr.child,
			msg: 'git error'
		});
	});
}

module.exports = {
	gitClone: gitClone
};