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
	
	var gulp		= require('gulp'),
		typescript	= require('gulp-type'),
		less		= require('gulp-less'),
		imagemin	= require('gulp-imagemin'),
		del			= require('del'),
		notify		= require("gulp-notify"),
		concat		= require("gulp-concat"),
		sourcemaps	= require('gulp-sourcemaps'),
		newer 		= require('gulp-newer'),
		uglify 		= require('gulp-uglify'),
		path		= require('path');
	
	var globals = {};
	
	var ProjectHelpers = function () {}

	ProjectHelpers.prototype.setSourcePath = function (path) {
		this.sourcePath = path;
	}

	ProjectHelpers.prototype.setBuildPath = function (path) {
		this.buildPath = path;
	}

	ProjectHelpers.prototype.registerComponent = function (name, path) {
		this.components.push({
			'name' : name,
			'path' : this.componentsPath + name + '/' + path
		});
	}
	
	ProjectHelpers.prototype.setup = function (settings) {
		
		var self = this;
		
		this.name 			= settings.name 			|| 'Unnamed Project-Helpers';
		this.sourcePath		= settings.sourcePath  		|| 'source/';
		this.buildPath		= settings.buildPath  		|| 'build/';
		this.componentsPath	= settings.componentsPath  	|| 'components/';

		globals.title = this.name;
		
		this.directories = {
			styles 		: settings.stylesFolder		|| 'styles',
			scripts 	: settings.scriptsFolder	|| 'scripts',
			images 		: settings.imagesFolder 	|| 'images'
		};

		this.paths = {
			scripts		: this.sourcePath + this.directories.scripts + '/**/*' + ((this.typescript)?'.ts':'.js'),
			images		: this.sourcePath + this.directories.images + '/**/*',
			styles 		: this.sourcePath + this.directories.styles + '/**/*.less'
		};
		
		this.components = [];
		
		this.typescript = settings.typescript 	|| false;
		this.debug 		= settings.debug 		|| false;
		
		if(this.typescript)
		{
			var typescriptProject = typescript.createProject({
				sortOutput			: true,
				declarationFiles	: false,
				noExternalResolve	: false
			});
			
			gulp.task('ph-typescript', function () {
				var ts = gulp.src(self.paths.scripts)
					.pipe(typescript(typescriptProject));

				return ts.js
					.pipe(concat('main.min.js'))
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Typescript compiled successfully"));
			});
		}
		
		gulp.task('ph-scripts', function () {
			if(this.typescript)
			{
				gulp.run('ph-typescript');
			}
			else
			{	
				gulp.src(self.paths.scripts)
					.pipe(sourcemaps.init())
					.pipe(concat('main.min.js'))
					.pipe(uglify())
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Script task completed"));
			}
		});
		
		gulp.task('ph-components', function()
		{
			var components = [];
			
			for(var key in self.components)
			{
				components.push(self.components[key].path);
				
				if(this.debug)
				{
					console.log('Adding component:', self.components[key].name, '('+self.components[key].path+')');
				}
			}
			
			gulp.src(components)
					.pipe(sourcemaps.init())
					.pipe(concat('components.min.js'))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(self.buildPath + self.directories.scripts))
					.pipe(alert("Components task completed"));
		});
		
		gulp.task('ph-images', function(event)
		{
			gulp.src(self.paths.images)
				.pipe(newer(self.buildPath + 'images'))
				.pipe(imagemin({optimizationLevel: 5}))
				.pipe(gulp.dest(self.buildPath + self.directories.images))
				.pipe(notify("Image task completed"));
		});
		
		gulp.task('ph-styles', function () {
			var style = less().on("error", error("Error compiling LESS"));
			
			gulp.src(self.paths.styles)
				.pipe(style)
				.pipe(gulp.dest(self.buildPath + self.directories.styles))
				.pipe(alert("Less task completed"));
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
	
	/*
	 * Private functions
	 */

	function alert (msg) {
		return notify({
        	title	: msg,
			icon	: false,
        	subtitle: globals.title
		})
	}
	
	function error (msg) {
		return notify.onError({
			title	: msg,
			message : "<%= error.message %>",
			subtitle: globals.title,
			icon	: false
		})
	}
	
	module.exports = new ProjectHelpers;
	
})();

