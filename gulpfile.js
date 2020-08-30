const gulp = require('gulp');
const del = require('del');
var sortStream = require('sort-stream');
var embedTemplates = require('gulp-angular-embed-templates');
var concat = require('gulp-concat');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');


// used for sorting a stream of files - will always look for the file specified by the regular expression 
// and put it first. Everything else is sorted in alphabetical order of the path
// This was put in place so that the concatenated files are always stitched together in the same order, so that
// file diffs weren't being fooled by just random file order changes
function putFileFirst(regExp, a, b) {
    let aScore = a.path.match(regExp) ? 1 : 0;
    let bScore = b.path.match(regExp) ? 1 : 0;

    if (aScore) {
        return -1;
    }

    if (bScore) {
        return 1;
    }

    return (a.path < b.path) ? -1 : 1;

}  // putAppFirst

function putAppFirst(a, b) {
    return putFileFirst(/app.js$/, a, b);
}

function putDirectivesFirst(a, b) {
    return putFileFirst(/directives.js$/, a, b);
}

function putServicesFirst(a, b) {
    return putFileFirst(/services.js$/, a, b);
}

function alphabetically(a, b) {
    return (a.path < b.path) ? -1 : 1;
}



gulp.task('clean', function () {

    return del(['./build']);

});


gulp.task('ts', () => {

    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('build'));

});

gulp.task('client-html', () => {

    return gulp.src(['src/client/**/*.html'], { base: './src/client' })
        .pipe(gulp.dest('build/client'));

});

gulp.task('client-js', () => {

    // combines all the Angular code from /src along with the dual Angular/Node code from /js
    return gulp.src(['src/client/**/*.js'], { base: './src/client' })
        .pipe(gulp.dest('build/client/js'));


});

gulp.task('client-ts', () => {

    return gulp.src('src/**/*.ts')
        .pipe(ts({
            "esModuleInterop": true,
            "module": "es6",
            "target": "esnext",
            "rootDir": "./src",
            "sourceMap": false
        }))
        .pipe(gulp.dest('build/client/js'));

});



gulp.task('client', gulp.parallel('client-html', 'client-js', 'client-ts'));


gulp.task('default',
    gulp.series('clean', gulp.parallel('ts', 'client')));