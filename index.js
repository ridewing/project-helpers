/*!
 * Project Helpers v0.0.1
 * http://ridewing.se
 *
 * Copyright 2014 Nicklas Ridewing and other contributors
 * Released under the MIT license
 *
 * Date: 2014-11-22T17:11Z
 */

(function () {
	'use strict';
	
	// Load all external libs 
	var packageInfo = require('./package.json'),
		gulp		= require('gulp'),
		typescript	= require('gulp-type'),
		less		= require('gulp-less'),
		imagemin	= require('gulp-imagemin'),
		del			= require('del'),
		notify		= require("gulp-notify"),
		concat		= require("gulp-concat"),
		sourcemaps	= require('gulp-sourcemaps'),
		newer 		= require('gulp-newer'),
		uglify 		= require('gulp-uglify'),
		gutil		= require('gulp-util'),
		path		= require('path');
	
	// Set version
	var version = "v" + packageInfo.version;
	
	// Default settings
	var settings = {
		name			: 'Unnamed Project-Helpers',
		
		// Folders and structure
		sourcePath		: 'source/',
		buildPath		: 'build/',
		componentsPath	: 'components/',
		stylesFolder	: 'styles',
		scriptsFolder	: 'scripts',
		imagesFolder	: 'images',
		mainLessFile	: false,
		
		// Booleans
		debug			: false,
		typescript		: false
	};
	
	var ProjectHelpers = function () {}

	ProjectHelpers.prototype.setSourcePath = function (path) {
		this.sourcePath = path;
	}

	ProjectHelpers.prototype.setBuildPath = function (path) {
		this.buildPath = path;
	}

	ProjectHelpers.prototype.registerComponent = function (name, path) {
		
		if (!path) {
			var bowerFile = require(process.cwd() + '/' + this.componentsPath + name + '/bower.json');
			path = bowerFile.main;
		}
		
		this.components.push({
			'name' : name,
			'path' : this.componentsPath + name + '/' + path
		});
	}
	
	ProjectHelpers.prototype.setup = function (settingsObject) {
		
		var self = this;
	
		updateSettings(settingsObject);
		gutil.log(gutil.colors.cyan('Running project: '+gutil.colors.white(settings.name)+', with the help of Project-Helper '+gutil.colors.white(version)));
		gutil.beep();
		
		
		this.name 			= settings.name;
		this.sourcePath		= settings.sourcePath;
		this.buildPath		= settings.buildPath;
		this.componentsPath	= settings.componentsPath;
		
		this.directories = {
			styles 		: settings.stylesFolder,
			scripts 	: settings.scriptsFolder,
			images 		: settings.imagesFolder
		};

		this.paths = {
			scripts		: this.sourcePath + this.directories.scripts + '/**/*' + ((settings.typescript)?'.ts':'.js'),
			images		: this.sourcePath + this.directories.images + '/**/*',
			styles 		: this.sourcePath + this.directories.styles + '/**/*.less'
		};
		
		this.components = [];
		
		if(settings.typescript)
		{
			var typescriptProject = typescript.createProject({
				sortOutput			: true,
				declarationFiles	: false,
				noExternalResolve	: false
			});
			
			gulp.task('ph-typescript', function () {
				var ts = gulp.src(self.paths.scripts)
					.pipe(typescript(typescriptProject).on("error", error("Typescript")));

				return ts.js
					.pipe(concat('main.min.js'))
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Typescript"));
			});
		}
		
		gulp.task('ph-scripts', function () {
			if(settings.typescript)
			{
				gulp.run('ph-typescript');
			}
			else
			{	
				gulp.src(self.paths.scripts)
					.pipe(sourcemaps.init())
					.pipe(concat('main.min.js'))
					.pipe(uglify().on("error", error("Scripts")))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Scripts"));
			}
		});
		
		gulp.task('ph-components', function()
		{
			var components = [];
			
			for(var key in self.components)
			{
				components.push(self.components[key].path);
				
				if(settings.debug)
				{
					console.log('Adding component:', self.components[key].name, '('+self.components[key].path+')');
				}
			}
			
			gulp.src(components)
					.pipe(sourcemaps.init())
					.pipe(concat('components.min.js'))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Components"));
		});
		
		gulp.task('ph-images', function(event)
		{
			gulp.src(self.paths.images)
				.pipe(newer(self.buildPath + 'images'))
				.pipe(imagemin({optimizationLevel: 5}))
				.pipe(gulp.dest(self.buildPath + self.directories.images))
				.pipe(notify("Images"));
		});
		
		gulp.task('ph-styles', function () {
			var style = less().on("error", error("LESS"));
			
			var lesssrc = (settings.mainLessFile) ? self.sourcePath + self.directories.styles + '/' + settings.mainLessFile: self.paths.styles;
			
			gulp.src(lesssrc)
				.pipe(style)
				.pipe(gulp.dest(self.buildPath + self.directories.styles))
				.pipe(alert("LESS"));
		});
		
		gulp.task('ph-clean', function () {
			self.clean();
		});
	}
	
	ProjectHelpers.prototype.watch = function () {
		
		var components = [];
			
		for(var key in this.components)
		{
			components.push(this.components[key].path);
		}
		
		gulp.watch(components, 				['ph-components']);
		gulp.watch(this.paths.scripts, 		['ph-scripts']);
		gulp.watch(this.paths.images, 		['ph-images']);
		gulp.watch(this.paths.styles, 		['ph-styles']);
	}
	
	ProjectHelpers.prototype.clean = function () {
		del([
			this.buildPath + 'styles/**/*', 
			this.buildPath + 'scripts/**/*', 
			this.buildPath + 'images/**/*'
		], {force : true});
	}
	
	ProjectHelpers.prototype.build = function () {
		gulp.start(['ph-styles', 'ph-scripts', 'ph-components', 'ph-images']);
	}
	
	ProjectHelpers.prototype.default = function () {
		this.clean();
		this.build();
		this.watch();
	}

	function updateSettings (settingsObject) {
		for(var i in settingsObject)
		{
			settings[i] = settingsObject[i];
		}
	}
	
	/*
	 * Private functions
	 */

	function alert (msg) {
		notify.logLevel((settings.debug)?2:0);
		
		msg = "Completed: " + msg;
		
		gutil.log(gutil.colors.green(msg));
		
		return notify({
        	title	: msg,
			icon	: false,
        	subtitle: settings.name
		})
	}
	
	function error (msg) {
		return notify.onError({
			title	: msg,
			message : "<%= error.message %>",
			subtitle: settings.name,
			icon	: false,
			notifier : function (options, callback) {
				gutil.log(gutil.colors.red('Error with task: ' + options.title));
				gutil.log(gutil.colors.white(options.message));
				callback();
			}	
		})
	}
	
	module.exports = new ProjectHelpers;
	
})();

