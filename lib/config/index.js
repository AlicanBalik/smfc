var Config = function() {
	this.task = 'INVALID';
	this.tripleDes = {
		key: ''
	};
	this.user = {
		project: {
			sfpx: '',
			root: ''
		},
		profiles: []
	};
	this.config2 = null;
	this.iosConfig = null;
	this.androidConfig = null;
};

// config2.bin configurations.
var Config2 = function() {
	this.appVersion = '1.0.0';
	this.fileVersion = '1058';
	this.appDescription = '';
	this.splash = 'default_splash.png';
	this.splashBackground = '3947526';
	this.orientation = {
		portrait: '',
		landScapeLeft: '',
		landScapeRight: '',
		upsideDown: ''
	}
};

exports.Config2 = Config2;
exports.Config = Config;
exports.android = require('./android');
exports.ios = require('./ios');