#project-helpers
===============
##Helper class to develop project with gulp.
Compile less, sass or stylus, optimize images and compress javascript.

####Example gulpfile.js

    var gulp = require('gulp');
    var ph = require('project-helpers')({
        styleType : 'less',
        mainStyleFile : 'main.less',
        enableImages : true
    });
    
    // Register external components (Recommend: Install with bower)
    ph.registerComponent('elements-sass');
    ph.registerComponent('jquery');
    ph.registerComponent('jquery-ui');
    
    // Tell project helper that everything is ready to go
    ph.ready();
    
    // Register default gulp task
    gulp.task('default', function () {
        ph.default();
    });
    
    // Register gulp build tast (optional)
    gulp.task('build', function () {
        ph.build();
    });
    
#### Available settings and default values
    {
        name            : 'Unnamed Project',
		
		// Folders and structure
		sourcePath      : 'source/',            // Where can we find everything
		buildPath       : 'build/',             // Where should we save eveything
		componentsPath  : 'source/components/', // External components folder
		styleType       : 'less',               // less, sass, scss and stylus

		// Type folders
		stylesFolder    : 'styles',             // Name of styles folder
		scriptsFolder   : 'scripts',            // Name of scripts folder
		imagesFolder    : 'images',             // Name of images folder
		fontsFolder     : 'fonts',              // Name of fonts folder

        // Main style file to compile
		mainStyleFile	: false,                // Useful if you import all styles into one main file
		
		// Booleans
		debug			: false,                // Just different log level when true

		// Type flags (What types to move and compile)
		enableScripts   : true,
		enableStyle     : true,
		enableImages    : false,
		enableFonts     : false
    }