const gulp = require('gulp');
const del = require('del');
var concat = require('gulp-concat');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');


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
    return gulp.src(['src/client/**/*.js'])
        .pipe(concat('poker-js.js'))
        .pipe(gulp.dest('build/client/js'));


});

gulp.task('client', gulp.parallel('client-html', 'client-js'));


gulp.task('default',
    gulp.series('clean', gulp.parallel('ts', 'client')));