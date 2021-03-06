const gulp = require('gulp');
const del = require('del');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');


gulp.task('clean', function () {

    return del(['./dist']);

});


gulp.task('ts', () => {

    return gulp.src(['src/**/*.ts'])
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));

});


/*
gulp.task('default',
    gulp.series('clean', gulp.parallel('ts')));
*/

gulp.task('default', gulp.parallel('ts'));