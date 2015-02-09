/*!
 * Project Helpers v0.0.1
 * http://ridewing.se
 *
 * Copyright 2014 Nicklas Ridewing and other contributors
 * Released under the MIT license
 *
 * Date: 2014-11-22T17:11Z
 */

var ProjectHelpers = function(settings) {

	'use strict';

	var packageInfo = require('./package.json');

	// Load all external libs
	var modules = {
		gulp 		: require('gulp'),
		del 		: require('del'),
		notify 		: require("gulp-notify"),
		gutil 		: require('gulp-util'),
		path 		: require('path'),

		// Styles
		less 		: null,
		sass 		: null,
		stylus		: null,

		// Scripts
		concat 		: null,
		sourcemaps 	: null,
		uglify 		: null,

		// Images
		imagemin 	: null,
		newer 		: null
	};

	// Set version
	var version = "v" + packageInfo.version;

	// Default settings
	var defaults = {
		name			: 'Unnamed Project',
		
		// Folders and structure
		sourcePath		: 'source/',
		buildPath		: 'build/',
		componentsPath	: 'source/components/',
		styleType 		: 'less',

		// Type folders
		stylesFolder	: 'styles',
		scriptsFolder	: 'scripts',
		imagesFolder	: 'images',
		fontsFolder		: 'fonts',

		mainStyleFile	: false,
		
		// Booleans
		debug			: false,

		// Type flags (What types to handle)
		enableScripts 	: true,
		enableStyle 	: true,
		enableImages 	: false,
		enableFonts 	: false
	};

	settings = _extend(defaults, settings);

	modules.gutil.log(modules.gutil.colors.cyan('Running project: '+modules.gutil.colors.white(settings.name)+', with the help of Project-Helper '+modules.gutil.colors.white(version)));

	// Register modules for scripts
	if(settings.enableScripts){
		modules.concat 		= require("gulp-concat");
		modules.uglify 		= require('gulp-uglify');
		modules.sourcemaps 	= require('gulp-sourcemaps');
	}

	// Register modules for style
	if(settings.enableStyle){
		if(settings.styleType == 'less'){
			modules.less = require('gulp-less');
		}
		else if(settings.styleType == 'sass' || settings.styleType == 'scss'){
			modules.sass = require('gulp-sass');
		}
		else if(settings.styleType == 'stylus'){
			modules.stylus = require('gulp-stylus');
		}
	}

	// Register modules for images
	if(settings.enableImages){
		modules.newer 		= require("gulp-newer");
		modules.imagemin 	= require('gulp-imagemin');
	}

	if(settings.enableFonts){
		// Nothing special to register, we just copy the files
	}

	var project = require('./Project.js')(modules, settings);

	return project;

	/*
	 * Private functions
	 */
	function _extend (defaults, newObject) {
		for(var i in newObject)
		{
			defaults[i] = newObject[i];
		}

		return defaults;
	}
};

module.exports = ProjectHelpers;

