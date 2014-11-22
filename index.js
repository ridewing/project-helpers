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
		sourcemaps	= require('gulp-sourcemaps');
	
	var ProjectHelpers = function (settings) {
		var self = this;

		self.typescript = settings.typescript || false;
		
		self.sourcePath		= 'source/';
		self.buildPath		= 'build/';
		self.componentsPath	= 'components/';

		self.directories = {
			styles 	: '/styles',
			scripts : '/scripts',
			images 	: '/images/'
		};

		self.paths = {
			components	: self.sourcePath + 'components/**/*.js',
			scripts		: self.sourcePath + 'scripts/app/**/*.' + (self.typescript)?'.ts':'.js',
			images		: self.sourcePath + 'images/**/*',
			styles 		: self.sourcePath + 'styles/**/*.less'
		};
		
		self.components = [];
		
		self.setup();
	}

	ProjectHelpers.prototype.setSourcePath = function (path) {
		this.sourcePath = path;
	}

	ProjectHelpers.prototype.setBuildPath = function (path) {
		this.buildPath = path;
	}

	ProjectHelpers.prototype.registerComponent = function (name, path) {
		this.components.push({
			'name' : name,
			'path' : this.componentsPath + '/' + name + '/' + path;
		});
	}
	
	ProjectHelpers.prototype.setup = function () {
		if(this.typescript)
		{
			var typescriptProject = typescript.createProject({
				sortOutput			: true,
				declarationFiles	: false,
				noExternalResolve	: false
			});
			
			gulp.task('ph-typescript', function () {
				var ts = gulp.src(this.paths.scripts)
					.pipe(typescript(typescriptProject));

				return ts.js
					.pipe(concat('main.min.js'))
					.pipe(gulp.dest(this.buildPath  + 'scripts/'))
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
				gulp.src(this.paths.scripts)
					.pipe(sourcemaps.init())
					.pipe(concat('main.min.js'))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(this.buildPath + 'scripts'))
					.pipe(alert("Script task completed"));
			}
		});
		
		gulp.task('ph-styles', function () {
			var style = less().on("error", error("Error compiling LESS")):
			
			gulp.src(this.paths.styles)
				.pipe(style)
				.pipe(gulp.dest(this.buildPath + 'style/'))
				.pipe(alert("Less task completed"));
		});
		
		gulp.task('ph-watch', function () {
			gulp.watch(this.paths.components, 	['ph-components']);
			gulp.watch(this.paths.scripts, 		['ph-scripts']);
			gulp.watch(this.paths.images, 		['ph-images']);
			gulp.watch(this.paths.styles, 		['ph-styles']);
		});
	}
	
	
	/*
	 * Private functions
	 */

	function alert (msg) {
		return notify({
			message: msg,
        	title: "Project Helpers"
		})
	}
	
	function error (msg) {
		notify.onError({
			message : "<%= error.message %>",
			title 	: msg
		})
	}
	
})();

