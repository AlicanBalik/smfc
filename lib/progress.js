var chalk = require('chalk');

var args = require('minimist')(process.argv.slice(2));

function startProgress() { // topper progress
	var interval = args.interval || 100;
	var str = args.str || 'Please wait ...';
	var i = -1,
		j = -1,
		progress = ['▄', '▀'];
	var down = false;
	var limitLen = str.length + 1;
	var maxLen = str.length + 35;
	var cursorIndex = limitLen;
	process.stdout.write('\x1b[?25l'); // cursor hide.
	return setInterval(function() {
		++j;
		j = j % progress.length;
		++i
		i = i % 7;
		if (cursorIndex > maxLen) {
			down = true;
		}
		process.stdout.clearLine();
		if (down) {
			--cursorIndex;
			if (cursorIndex === limitLen) {
				down = false;
			}

		} else {
			++cursorIndex;
		}
		process.stdout.cursorTo(0);
		process.stdout.write(chalk.styles.cyan.open + str + chalk.styles.cyan.close);
		process.stdout.cursorTo(cursorIndex);
		process.stdout.write(progress[j]);

	}, interval);

}


process.on('SIGINT', function() { // got kill signal.
	clearInterval(timer, function() {
		process.stdout.clearLine();
		process.stdout.write('\x1b[?25h'); // cursor show.
		process.exit();
	});

});

// start progress ...
var timer = startProgress();