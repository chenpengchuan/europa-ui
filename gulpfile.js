var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    useref = require('gulp-useref'),
    lazypipe = require('lazypipe'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace'),
    version = require('gulp-version-number'),
    del = require('del');

var dist = process.env.EUROPA_GULP_DIST || "/tmp/europa-gulp-dist";
var packageName = process.env.FULL_PACKAGE_NAME ;

var logo_img_url = process.env.LOGO_IMG_URL;        //登录页面herder的logo图片
var logo_img_url_tmp = process.env.LOGO_IMG_URL_TMP;        //登录页面herder的logo图片
var login_bj_url = process.env.LOGIN_BJ_URL         //登录页面的背景图片
var logo_alt_text = process.env.LOGO_ALT_TEXT;      //当页面的logo图片不显示时出现的替换文字
var header_title = process.env.HEADER_TITLE;        //访问地址栏的标题
var show_login_text = process.env.SHOW_LOGIN_TEXT   //是否显示登录页面logo下面的文字
var header_text = process.env.HEADER_TEXT           //页面头部显示的各个系统介绍文字

if (!packageName) {
    console.log("wrong env FULL_PACKAGE_NAME which should not be null");
    process.exit(1);
}

const versionConfig = {
    'value': '%MD5%',
    'append': {
        'key': 'v',
        'to': ['css', 'js'],
    },
};

gulp.task('clean', function() {
    return del([dist], {force : true}).then(function() {
        console.log("delete old output in " + dist);
    });
});

gulp.task('replace_css', function(){
    console.log(logo_img_url + login_bj_url+ logo_alt_text+header_title+show_login_text+header_text)
    return gulp.src('webapp/app/resources/css/linkoop.css')
        .pipe(replace('_logo_img_url_tmp',logo_img_url_tmp))
        .pipe(replace('_login_bj_url',login_bj_url))
        .pipe(gulp.dest('webapp/app/resources/css'))
});

gulp.task('replace_logo_form', function(){
    return gulp.src('webapp/app/login/login_form.html')
        .pipe(replace('_show_login_text',show_login_text))
        .pipe(gulp.dest('webapp/app/login'))
});


gulp.task('replace_header', function(){
    return gulp.src('webapp/app/common/header.html')
        .pipe(replace('_header_text',header_text))
        .pipe(replace('_logo_alt_text',logo_alt_text))
        .pipe(replace('_logo_img_url',logo_img_url))
        .pipe(gulp.dest('webapp/app/common'))
});

gulp.task('replace_header_xingyun', function(){
    return gulp.src('webapp/app/common/header_xingyun.html')
        .pipe(replace('_logo_alt_text',logo_alt_text))
        .pipe(replace('_header_text',header_text))
        .pipe(gulp.dest('webapp/app/common'))
});

gulp.task('concat', ['clean','replace_logo_form','replace_css','replace_header','replace_header_xingyun'], function() {
    return gulp.src(['webapp/index.html'])
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(sourcemaps.write('maps', {includeContent:false}))
        .pipe(replace('_title_europa',header_title))
        .pipe(replace('_header_text',header_text))
        .pipe(replace('_logo_alt_text',logo_alt_text))
        .pipe(replace('_logo_img_url',logo_img_url))
        .pipe(version(versionConfig))
        .pipe(gulp.dest(dist))
});

gulp.task('copy-mdi-fonts', ['clean'], function(){
    return gulp.src('webapp/bower_components/mdi/fonts/*')
        .pipe(gulp.dest(dist+'/fonts'));
});

gulp.task('copy-bootstrap-fonts', ['clean'], function(){
    return  gulp.src('webapp/bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest(dist+'/fonts'));
});

gulp.task('copy-bootstrap-fonts', ['clean'], function(){
    return  gulp.src('webapp/bower_components/angular-tree-control/fonts/*')
        .pipe(gulp.dest(dist+'/fonts'));
});

gulp.task('copy-other-fonts', ['clean'], function(){
    return gulp.src('webapp/app/resources/fonts/*')
        .pipe(gulp.dest(dist+'/fonts'));
});

gulp.task('copy-images', ['clean'], function(){
    return gulp.src('webapp/app/resources/images/*')
        .pipe(gulp.dest(dist+'/images'));
});

gulp.task('copy-tree-images', ['clean'], function(){
    return gulp.src('webapp/bower_components/angular-tree-control/images/*')
        .pipe(gulp.dest(dist+'/images'));
});

gulp.task('remove-strict', ['concat'], function () {
    return gulp.src(dist+"/scripts/all.js").pipe(replace(/'use strict';/g, ' '))
        .pipe(replace(/_europa\-default\-version_/g, packageName))
        .pipe(gulp.dest(dist+'/remove-strict'));
});

gulp.task('overwrite', ['remove-strict'], function() {
    return gulp.src(dist+'/remove-strict/*')
        .pipe(gulp.dest(dist+'/scripts'));
});

gulp.task('clean-tmp', ['overwrite'], function(){
    return del([dist+'/remove-strict'], {force : true})
        .then(function() {
            console.log("delete remove-strict output in " + dist+'/remove-strict');
        });
});

gulp.task('copy-awes-fonts', ['clean'], function(){
    return  gulp.src('webapp/bower_components/font-awesome/font/*')
        .pipe(gulp.dest(dist+'/font'));
});

gulp.task('default', [
    'copy-mdi-fonts',
    'copy-bootstrap-fonts',
    'copy-other-fonts',
    'copy-images',
    'copy-tree-images',
    'copy-awes-fonts',
    'clean-tmp'], function() {
    console.log('all output to ' + dist + " are done!");
});
