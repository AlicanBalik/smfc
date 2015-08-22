var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var utility = require('../utility');

var Sample = (function() {
	var sampleJson = require('./sample.json');
	var Default = require('./tag');
	var SAMPLES_DIR = Default.def.SAMPLES_DIR;

	function getAvailableNames() {
		var res = [];
		_.each(sampleJson.samples, function(item) {
			res.push(item.name);
		});
		return res;
	}

	function getAvailableLink(_name) {
		var index = _.findIndex(sampleJson.samples, {
			name: _name
		});
		if (index !== -1) {
			return sampleJson.samples[index].link;
		}
	}

	function getSampleFolder(_name) { // SAMPLES_DIR subfolders.
		var res = undefined;
		if (name) {
			var sampleFolderPath = path.join(SAMPLES_DIR, _name);
			if (utility.safeControlDirectory(sampleFolderPath)) {
				res = sampleFolderPath;
			}
		}
		return res;
	}

	function getSamplePaths(validater) { // need projectValidater for  realy smfc projects folder.
		var res = [];
		var _validater = validater || validateProjectFolder;
		if (utility.safeControlDirectory(SAMPLES_DIR)) {
			var folders = fs.readdirSync(SAMPLES_DIR);
			_.each(folders, function(item) {
				var input = path.join(SAMPLES_DIR, item);
				if (_.isFunction(_validater)) {
					if (_validater(input) === true) {
						res.push(input);
					}
				} else {
					res.push(input);
				}
			});
		}
		return res;
	}

	function getSampleNames(validater) { // need projectValidater for  realy smfc projects folder.
		var res = [];
		var _validater = validater || validateProjectFolder;
		if (utility.safeControlDirectory(SAMPLES_DIR)) {
			var folders = fs.readdirSync(SAMPLES_DIR);
			_.each(folders, function(item) {
				var input = path.join(SAMPLES_DIR, item);
				if (_.isFunction(_validater)) {
					if (_validater(input) === true) {
						res.push(item);
					}
				} else {
					res.push(item);
				}
			});
		}
		return res;
	}

	function validateProjectFolder(input) { // validate project folder
		var answered = require('./answered');
		var convertAbsolute = utility.convertAbsolute.convert;
		var res = false;
		var projPath = convertAbsolute(input);
		if (utility.safeControlDirectory(projPath)) {
			if (answered.workSpaceType === Default.def.WORKSPACE.DESKTOP) {
				// TO DO DESKTOP ıde sfpx, data control.
			} else {
				if (utility.safeControlFile(path.join(projPath, 'config', 'project.json'), 'json')) {
					if (utility.safeControlFile(path.join(projPath, 'config', 'Android', 'PackageProfiles.xml'), 'xml')) {
						res = true;
					}
				}
			}
		}
		return res;
	}

	return {
		getAvailableNames: getAvailableNames,
		getAvailableLink: getAvailableLink,
		getSampleFolder: getSampleFolder,
		getSamplePaths: getSamplePaths,
		getSampleNames: getSampleNames
	};

})();

module.exports = Sample;