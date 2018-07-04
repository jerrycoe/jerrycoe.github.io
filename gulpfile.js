var gulp = require('gulp');
var watch = require('gulp-watch');
const minify = require('gulp-minify');

gulp.task('compress', function() {
	gulp.src(['app.js'])
		.pipe(minify())
		.pipe(gulp.dest('_includes'))
});

gulp.task('watch', function() {
	gulp.watch('app.js',['compress']);
});