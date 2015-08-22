function collect(task, platform) {

}

function run(config) {
	spawn('node', ['index.js',
		'--task="android-full-publish"',
		'--config="experiment/emptysmf/config.json"',
		//'--sfpx="C:/Users/user/Desktop/NewProject2.sfpx"',
		'--projectroot="C:/Users/user/Desktop/NewProject2_data"',
		'--license="test-files/input/data2.sfd"',
		'--signapk="test-files/output/smartfaceDemoSigned.apk"',
		'--signer="bin/SignApk.jar"',
		'--java="C:/Program Files (x86)/Java/jdk1.7.0_75/bin/java"',
		'--keypass="mobinex"',
		'--aliasname="smartface_demo"',
		'--keystore="test-files/input/smartface_demo.keystore"',
		'--df="test-files/output/SmartfacePlayer"',
		'--sf="test-files/output/SmartfacePlayer"',
		'--apktool="bin/apktool.jar"',
		'--source', "bin/SmartfacePlayer.apk", //-s
		'--dest', "test-files/output/SmartfacePlayerEdited.apk" //-d
	], {
		stdio: 'inherit'
	});
}

module.exports = {
	collect: collect,
	run: run
};

/*
var spawn = require('child_process').spawnSync;


var child = spawn('node', ['lib/main.js',
	'--task="android-full-publish"',
	'--sfpx="C:/Users/user/Desktop/NewProject2.sfpx"',
	'--projectroot="C:/Users/user/Desktop/NewProject2_data"',
	'--license="test-files/input/data2.sfd"',
	'--signapk="test-files/output/smartfaceDemoSigned.apk"',
	'--signer="bin/SignApk.jar"',
	'--java="C:/Program Files (x86)/Java/jdk1.7.0_75/bin/java"',
	'--keypass="mobinex"',
	'--aliasname="smartface_demo"',
	'--keystore="test-files/input/smartface_demo.keystore"',
	'--df="test-files/output/SmartfacePlayer"',
	'--sf="test-files/output/SmartfacePlayer"',
	'--apktool="bin/apktool.jar"',
	'--sourcePlayer', "bin/SmartfacePlayer.apk",
	'-d', "test-files/output/SmartfacePlayerEdited.apk"
], {
	stdio: 'inherit'
});


var timestamp = new Date();
var signConfig = config.build.android.sign;

function outputFolderGenerator(config, timestamp) {
	var suffix = '/' + config.info.name + '/' + timestamp;
	return function(mobilePlatform) {
		mobilePlatform = mobilePlatform.toLowerCase();
		if (mobilePlatform === 'android') {
			return config.output.android.outputFolder + suffix;
		} else if (mobilePlatform === 'ios') {
			return config.output.iOS.outputFolder + suffix;
		}
	};
}

var projectTimestamp = new Date();

function createTaskConfig(task, platform, config) {
	var taskInterface;
	if (platform === 'linux') {
		if (task === 'android-full-publish') {
			taskInterface = require('tasks/android/full-publish');
		} else if (task === 'ios-full-publish') {
			taskInterface = require('tasks/ios/full-publish');
		}
	}
	if (!config) {
		config = taskInterface.collect(task, platform);
	}
	taskInterface.run(config);
}


var task_args = {
	task: argv.task,
	projectroot: __dirname,
	apktool: "bin/apktool.jar",
	signer: "bin/SignApk.jar",
	java: "java",
	keypass: signConfig.keyPass,
	aliasname: signConfig.aliasName,
	keystore: signConfig.keystoreFile,
	df: outputFolderGenerator(config, projectTimestamp),
	sf: outputFolderGenerator(config, projectTimestamp),
	signapk: output.android.outputFolder + timestamp,
	'-s': "bin/SmartfacePlayer.apk",
	'-d': "test-files/output/SmartfacePlayerEdited.apk"
};

var unix_child = spawn('node', ['lib/main.js',
	'--task="android-full-publish"',
	'--sfpx="C:/Users/user/Desktop/NewProject2.sfpx"',
	'--projectroot="C:/Users/user/Desktop/NewProject2_data"',
	'--license="test-files/input/data2.sfd"',
	'--signapk="test-files/output/smartfaceDemoSigned.apk"',
	'--signer="bin/SignApk.jar"',
	'--java="C:/Program Files (x86)/Java/jdk1.7.0_75/bin/java"',
	'--keypass="mobinex"',
	'--aliasname="smartface_demo"',
	'--keystore="test-files/input/smartface_demo.keystore"',
	'--df="test-files/output/SmartfacePlayer"',
	'--sf="test-files/output/SmartfacePlayer"',
	'--apktool="bin/apktool.jar"',
	'-s', "bin/SmartfacePlayer.apk",
	'-d', "test-files/output/SmartfacePlayerEdited.apk"
], {
	stdio: 'inherit'
});
*/