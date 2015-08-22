var AndroidConfig = function() {
	this.input = {
		java: {
			path: '',
			maxMemory: ''
		},
		apkTool: '',
		inputApk: '',
		inputApkx86: '',
		extractor: {
			inputApk: ''
		},
		builder: {
			inputFolder: ''
		},
		sign: {
			signer: '',
			keystoreFile: '',
			keystorePass: '',
			aliasName: '',
			keyPass: '',
			inputApk: ''

		},
		assets: '',
		scripts: '',
		images: '',
		packageProfiles: [{
			profile: {
				name: '',
				folders: []
			}
		}],
		manifest: {
			data: '',
			edit: {
				appName: '',
				packageName: '',
				appVersion: '1.0.0',
				appDescription: '',
				googleMapKey: '',
				compatibleScreens: '<compatible-screens>\r\n\t</compatible-screens>',
				supportsScreen: '',
				orientation: ''
			}

		},
		plugins: [{
			name: '',
			path: ''

		}],
		license: {
			data: '',
			type: 'Demo',
			name: 'Smartface Demo'
		}
	};
	this.output = {
		outputApk: '',
		extractor: {
			outputFolder: ''
		},
		builder: {
			outputApk: ''
		},
		sign: {
			outputApk: ''
		}
	};

};

module.exports = AndroidConfig;