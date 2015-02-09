var ProjectHelpers = function(modules, settings){

    "use strict";

    var productionMode = false;
    var components = [];
    var gulp = modules.gulp;

    var projectHelpers = {

        paths : {},
        tasks : [],

        settings : null,

        setup : function() {

            this.settings = settings;

            this.directories = {
                styles 		: this.settings.stylesFolder,
                scripts 	: this.settings.scriptsFolder,
                images 		: this.settings.imagesFolder,
                fonts 		: this.settings.fontsFolder
            };

            this.paths = {
                scripts		: this.settings.sourcePath + this.directories.scripts + '/**/*.js',
                images		: this.settings.sourcePath + this.directories.images + '/**/*',
                styles 		: this.settings.sourcePath + this.directories.styles + '/**/*',
                fonts 		: this.settings.sourcePath + this.directories.fonts + '/**/*'
            };

            switch (this.settings.styleType){
                case 'less':
                    this.paths.styles += '.less';
                    break;
                case 'scss':
                case 'sass':
                    this.paths.styles += '.scss';
                    break;
            }

            this.setupTasks();
        },
        setupTasks : function(){

            var self = this;

            if(this.settings.enableScripts){
                gulp.task('ph-scripts', function () {
                    gulp.src(self.paths.scripts)
                        .pipe(_onlyDevelopment(modules.sourcemaps.init()))

                        .pipe(modules.concat('main.min.js'))
                        .pipe(modules.uglify().on("error", _error("Scripts")))

                        .pipe(_onlyDevelopment(modules.sourcemaps.write()))

                        .pipe(gulp.dest(self.settings.buildPath + self.directories.scripts))

                        .pipe(_alert("Scripts"));
                });

                this.tasks.push('ph-scripts');
            }

            if(this.settings.enableStyle){
                gulp.task('ph-styles', function () {

                    var style;

                    switch(self.settings.styleType){

                        case 'less':
                            style = modules.less().on("error", _error("LESS"));
                            break;
                        case 'scss':
                        case 'sass':
                            style = modules.sass({errLogToConsole: true}).on("error", _error(self.settings.styleType.toUpperCase()));
                            break;
                        case 'stylus':
                            style = modules.stylus().on("error", _error(self.settings.styleType.toUpperCase()));
                            break;
                    }

                    var styleFiles = (self.settings.mainStyleFile) ? self.settings.sourcePath + self.directories.styles + '/' + self.settings.mainStyleFile: self.paths.styles;

                    gulp.src(styleFiles)
                        .pipe(style)
                        .pipe(gulp.dest(self.settings.buildPath + self.directories.styles))
                        .pipe(_alert(self.settings.styleType.toUpperCase()));
                });

                this.tasks.push('ph-styles');
            }

            if(this.settings.enableFonts){
                gulp.task('ph-fonts', function () {
                    gulp.src(self.paths.fonts)
                        .pipe(gulp.dest(self.settings.buildPath + self.directories.fonts))
                        .pipe(_alert("Fonts"));
                });

                this.tasks.push('ph-fonts');
            }

            if(this.settings.enableImages){

                gulp.task('ph-images', function () {
                    gulp.src(self.paths.images)
                        .pipe(modules.newer(self.settings.buildPath + self.directories.images))
                        .pipe(modules.imagemin({optimizationLevel: 5}))
                        .pipe(gulp.dest(self.settings.buildPath + self.directories.images))
                        .pipe(modules.notify("Images"));
                });

                this.tasks.push('ph-images');
            }

            gulp.task('ph-components', function () {
                var scripts = [];
                var styles = [];

                for(var key in components)
                {
                    var component = components[key];

                    if(component.type == 'javascript'){
                        scripts.push(components[key].path);
                    } else {
                        styles.push(components[key].path);
                    }
                }

                gulp.src(scripts)
                    .pipe(_onlyDevelopment(modules.sourcemaps.init()))
                    .pipe(modules.concat('components.min.js'))
                    .pipe(_onlyDevelopment(modules.sourcemaps.write()))
                    .pipe(gulp.dest(self.settings.buildPath + self.directories.scripts))
                    .pipe(_alert("Scripts components"));


                var componentsStyle = 'components';

                switch(self.settings.styleType){

                    case 'less':
                        componentsStyle += ".less";
                        break;
                    case 'scss':
                    case 'sass':
                        componentsStyle += ".scss";
                        break;
                    case 'stylus':
                        componentsStyle += ".styl";
                        break;
                }

                gulp.src(styles)
                    .pipe(modules.concat(componentsStyle))
                    .pipe(gulp.dest(self.settings.sourcePath + self.directories.styles))
                    .pipe(_alert("Styles components"));
            });

            this.tasks.push('ph-components');

            gulp.task('ph-clean', function () {
                self.clean();
            });

        },
        registerComponent : function(componentId, paths) {

            if (!paths) {
                var bowerFile = require(process.cwd() + '/' + settings.componentsPath + componentId + '/.bower.json');
                paths = bowerFile.main;
            }

            if(typeof paths != 'array') {
                paths = [paths];
            }

            for(var i in paths){
                var path = paths[i];
                var suffix = '.js';
                var javascript = (path.indexOf(suffix, path.length - suffix.length) !== -1);


                var component = {
                    'name' : componentId,
                    'path' : settings.componentsPath + componentId + '/' + path,
                    'type' : (javascript)?'javascript':'style'
                };

                console.log("Registering component: %s", componentId);
                console.log("Path: %s", component.path);
                console.log("Type: %s", component.type);

                components.push(component);
            }

        },
        watch : function() {

            if(this.settings.enableScripts){
                console.log('Watching scripts', this.paths.scripts);
                gulp.watch(this.paths.scripts, ['ph-scripts']);
            }

            if(this.settings.enableStyle){
                console.log('Watching styles', this.paths.styles);
                gulp.watch(this.paths.styles, ['ph-styles']);
            }

            if(this.settings.enableImages){
                console.log('Watching images', this.paths.images);
                gulp.watch(this.paths.images, ['ph-images']);
            }

            if(this.settings.enableFonts){
                console.log('Watching fonts', this.paths.fonts);
                gulp.watch(this.paths.fonts, ['ph-fonts']);
            }

        },
        clean : function() {
            if(modules.del){
                var self = this;
                modules.del([
                    self.settings.buildPath + self.directories.styles +'/**/*',
                    self.settings.buildPath + self.directories.scripts + '/**/*',
                    self.settings.buildPath + self.directories.image + '/**/*',
                    self.settings.buildPath + self.directories.fonts + '/**/*'
                ], {force : true});
            }
        },
        build : function() {
            productionMode = true;
            gulp.start(this.tasks);
        },
        run : function() {
            gulp.start(this.tasks);
        },
        default : function() {
            this.clean();
            this.run();
            this.watch();
        },
        ready : function(){

            this.isReady = true;
            this.setup();
        }
    };

    function _onlyDevelopment(task){
        if(productionMode){
            return modules.gutil.noop();
        }

        return task;
    }

    function _ifAvailable(module){

        if(module == null){
            return modules.gutil.noop();
        }

        return module();
    }

    function _alert (msg) {
        if(modules.notify) {
            modules.notify.logLevel((settings.debug)?2:0);

            msg = "Completed: " + msg;

            modules.gutil.log(modules.gutil.colors.green(msg));

            return modules.notify({
                title	: msg,
                icon	: false,
                subtitle: settings.name
            })
        } else {
            console.log(msg);
        }
    }

    function _error (msg) {
        if(modules.notify) {
            return modules.notify.onError({
                title	: msg,
                message : "<%= error.message %> in <%= error.fileName %> line <%= error.lineNumber %>",
                subtitle: settings.name,
                icon	: false,
                notifier : function (options, callback) {
                    modules.gutil.log(modules.gutil.colors.red('Error with task: ' + options.title));
                    modules.gutil.log(modules.gutil.colors.white(options.message));
                    callback();
                }
            })
        }
    }

    return projectHelpers;
};

module.exports = ProjectHelpers;