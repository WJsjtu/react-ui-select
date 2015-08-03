var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require('webpack');
var less = require("gulp-less");
var taskNames =[];
var clean = require('gulp-clean');
gulp.task('clean', function () {
    return gulp.src('./build', {read: false})
        .pipe(clean());
});

require("./require.uncache.js")(require);

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> v<%= pkg.version %> <%= pkg.description %>',
  ' * Repository <%= pkg.repository.url %>',
  ' * Homepage <%= pkg.homepage %>',
  ' * Copyright 2015 <%= pkg.author.name %>',
  ' * Licensed under the <%= pkg.license %> License',
  ' */',
  ''].join('\n');

var reactWrapper = require("./wrapper.js");
var reactUglify = require("./react-uglify.js");

var cssmin = require("gulp-cssmin");
var rename = require("gulp-rename");

gulp.task("less", ["clean"], function () {
  return gulp.src("./src/less/default.less")
    .pipe(less())
    .pipe(cssmin({keepSpecialComments: 0}))
    .pipe(rename("style.css"))
    .pipe(gulp.dest("./build"));
});

(function(){

    var dev = function(){
        GLOBAL.__MODE__ = 1;
        require.uncache("./webpack.config.js");
        var webpackConfigDev = require("./webpack.config.js");

        var taskName = "&dev=" + GLOBAL.__MODE__ + "&" + GLOBAL.__BUNDLE__ ;

        gulp.task("webpack" + taskName, ["less"], function(callback){
            // run webpack
            webpack(webpackConfigDev, function(err, stats){
                if(err) throw new gutil.PluginError("webpack", err);
                gutil.log("[webpack]", stats.toString({
                    // output options
                }));
                callback();
            });
        });

        gulp.task("build" + taskName, ["webpack" + taskName], function(callback){
            return gulp.src(webpackConfigDev.output.filename)
                .pipe(reactWrapper(banner + "\n", "", {pkg : pkg}))
                .pipe(gulp.dest("./build"));
        });
        taskNames.push("build" + taskName);
    };

    var build = function(){
        GLOBAL.__MODE__ = 0;
        require.uncache("./webpack.config.js");
        var webpackConfigBuild = require("./webpack.config.js");

        taskName = "&dev=" + GLOBAL.__MODE__ + "&" + GLOBAL.__BUNDLE__ ;

        gulp.task("webpack" + taskName, ["less"], function(callback){
            // run webpack
            webpack(webpackConfigBuild, function(err, stats){
                if(err) throw new gutil.PluginError("webpack", err);
                gutil.log("[webpack]", stats.toString({
                    // output options
                }));
                callback();
            });
        });

        gulp.task("build" + taskName, ["webpack" + taskName], function(callback){
            return gulp.src(webpackConfigBuild.output.filename)
                .pipe(reactUglify(null, (
                    "prototype bind state props exports setState PropTypes func bool string findDOMNode refs " + 
                    "push map length replace preventDefault stopPropagation " + 
                    "allowCreate asyncOptions autoload backspaceRemoves className clearable clearAllText clearValueText delimiter disabled " +
                    "ignoreCase inputProps matchPos matchProp name addLabelText noResultsText onChange onOptionLabelClick options placeholder " +
                    "searchable searchPromptText value isFocused isLoading isOpen input selectMenuContainer control"
                    ).split(" ")
                ))
                .pipe(gulp.dest("./build"));
        });
        taskNames.push("build" + taskName);
    };

    GLOBAL.__BUNDLE__ = 0;
    dev();
    GLOBAL.__BUNDLE__ = 1;
    dev();
    GLOBAL.__BUNDLE__ = 0;
    build();
    GLOBAL.__BUNDLE__ = 1;
    build();
})();

gulp.task("default", taskNames, function(){

});