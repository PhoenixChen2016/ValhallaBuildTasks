/*jslint es6*/

const gulp = require("gulp4");
const jsonEditor = require("gulp-json-editor");
const fs = require("fs");
const shell = require("gulp-shell");
const del = require("del");
const vinylPaths = require("vinyl-paths");
const path = require("path");

gulp.task(
    "set-sdk",
    function() {
        'use strict';
        return gulp
            .src(["*/task.json"])
            .pipe(vinylPaths(function(file) {
                console.log(`Paths: ${path.dirname(file)}`);
                let taskJson = JSON.parse(fs.readFileSync(file));
                if (taskJson.execution.PowerShell3) {
                    return new Promise((resolve, reject) => {
                        gulp.src("node_modules/vsts-task-sdk/VstsTaskSdk/**/*")
                            .pipe(gulp.dest(`${path.dirname(file)}/ps_modules/VstsTaskSdk`))
                            .on("end", function() {
                                resolve();
                            });
                    });

                } else {
                    return Promise.resolve();
                }
            }));
    });

gulp.task(
    "build",
    gulp.series([
        "set-sdk",
        shell.task([
            "tfx extension create --rev-version"
        ])
    ]));

gulp.task(
    "clean",
    function() {
        'use strict';
        return gulp
            .src([
                "*.vsix",
                "*/ps_modules"
            ])
            .pipe(vinylPaths(del));
    });