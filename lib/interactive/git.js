var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var os = require('os');

var reg = require('reg_java');

var typErr = require('./error').type;

function gitClone(link, callback, dir) {

	getGitCommond(function(_gitCmd) {
		wrapperGit(link, callback, dir, _gitCmd);
	});
}

// checking git enviroment and  .
function getGitCommond(callback) {
	var ticket = 'InstallLocation';
	var searchPath = '\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Git_is1';
	var gitChild = spawnSync('git', ['--version']);
	if (gitChild.error && os.platform() === 'win32') {
		reg.search('HKLM/SOFTWARE/Wow6432Node' + searchPath, ticket, function(err, data) {
			if (err) {
				reg.search('HKLM/SOFTWARE' + searchPath, ticket, function(_err, _data) {
					if (_data) {
						callback(_data[0].value + '/bin/git');
					} else if (_err) {
						callback('git');
					}
				});
			} else if (data) {
				callback(data[0].value + '/bin/git');
			}
		});
	} else {
		callback('git');
	}

}

function wrapperGit(link, callback, dir, gitCmd) { // git clone  link [dir].
	var buffer = new Buffer('');
	var params = ['clone', link];
	dir && (params.push(dir));
	var child = spawn(gitCmd, params);
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