# Coding-Guidelines

# SublimeText

Install SublimeText, version 2 is available for free at the time

Install its [Package Manager](https://packagecontrol.io/)

It might require a restart for the Package Manager to work

Press CMD (or probably CTRL for Windows) - Shift - P to trigger the Command Palette.

Start typing "install" and choose "Package Control: Install Package" from the list.

Once the downloadable plugins list appears, start typing to filter.

Install "Javascript Beautify" plugin (by enginespot).

Once installed, go to "SublimeText / Preferences / Package Settings / Javascript Beautify / Settings - User" and click.

A file is opened, make sure it is as below

	{
		"format_on_save": true,
		"indent_with_tabs": true
	}

This will save the files everytime so that it will handle formatting for you.

Make sure to pay attention to couple details that may mess up the formatting.

When you start a function as a variable, make sure to put a var in front, and not start with a comma from above.

	var some_variable;
	var some_function = function(){

	};

Not like this

	var some_variable,
		some_function = function(){

		}

If a function is defined as a variable, make sure to put a comma after it.

# Coding Tips

On top of the js files, make sure you first require Node.js core modules, then third party modules and then our own modules.

If a variable is global in that file's scope (meaning it can be used in local functions' scope), you should declare it after all require statements are written.

Otherwise declare the variable where it will be used.

If any variables are to be called with `new`, try to declare them together after the require statements.

For a re-worked example, please check the `3604b93` commit for the diff on lib/main.js file.