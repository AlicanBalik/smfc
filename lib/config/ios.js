var IOSConfig = function() {
	this.input = {
		assets: '',
		scripts: '',
		images: '',
		urlIdentifier: '',
		urlSchemes: '',
		plugins: [{
			name: '',
			path: ''

		}],
		license: {
			data: '',
			type: '',
			name: ''
		},
		infoPlist: {
			appName: '',
			appNameShort: '',
			packageName: '',
			productName: '',
			appVersion: ''
		},

		playerZip: ''
	};
	this.output = {
		outputZip: ''
	};
};

module.exports = IOSConfig;