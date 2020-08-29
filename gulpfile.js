const gulp = require('gulp');
const del = require('del');

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

gulp.task('default',
    gulp.series('clean', gulp.parallel('ts', 'client-html')));