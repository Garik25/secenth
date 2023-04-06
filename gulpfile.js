import gulp from "gulp";
import concat from "gulp-concat";
import autoPrefixer from "gulp-autoprefixer";
import GulpCleanCss from "gulp-clean-css";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import GulpUglify from "gulp-uglify";
import { deleteSync } from "del";
import browserSync from "browser-sync";
import imagemin from "gulp-imagemin";
import gulpGroupCssMediaQueries from "gulp-group-css-media-queries";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";

const sass = gulpSass(dartSass);
const prod = "./build";

async function htmls () {
	return gulp.src("./src/*.html")
		.pipe(gulp.dest(`${prod}/`))
		.pipe(browserSync.stream());
}

async function styles() {
	return gulp.src("./src/sass/styles.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(gulpGroupCssMediaQueries())
		.pipe(sourcemaps.init())
		.pipe(concat("styles.css"))
		.pipe(autoPrefixer({
			overrideBrowserslist: ["> 0.1%"],
			cascade: false
		}))
		.pipe(GulpCleanCss({
			level: 2
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(`${prod}/css/`))
		.pipe(browserSync.stream());
}

async function scripts() {
	return gulp.src("./src/js/**/*.js")
		.pipe(sourcemaps.init())
		.pipe(concat("all.js"))
		.pipe(babel({
			presets: ["@babel/env"]
		}))
		.pipe(GulpUglify({
			toplevel: true
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(`${prod}/js/`))
		.pipe(browserSync.stream());
}

async function pictures () {
	return gulp.src("./src/img/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest(`${prod}/img/`));
}

async function clean () {
	return deleteSync([prod]);
}

async function fonts () {
	return gulp.src("./src/fonts/*")
		.pipe(gulp.dest(`${prod}/fonts/`));
}

async function watch () {
	browserSync.init({
		server: {
			baseDir: prod
		},
		port: 8888,
		tunnel: false
	})

	gulp.watch("./src/*.html", htmls);
	gulp.watch("./src/sass/**/*.scss", styles);
	gulp.watch("./src/js/**/*.js", scripts);
	gulp.watch("./*.html").on("change", browserSync.reload)
}

gulp.task("watch", watch);
gulp.task("prod", gulp.series(clean, gulp.parallel(htmls, styles, scripts, pictures, fonts)));
gulp.task("dev", gulp.series("prod", "watch"));