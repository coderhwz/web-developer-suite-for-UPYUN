module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: ['dist/upyun.js'],
				dest: 'dist/upyun.min.js'
			}
		},
		jshint: {
			verify: {
				options: {
					'-W083': true,
				},
				src: ['uploader.js','media-center.js','jquery.upyun.js'],
			},
			// afterconcat: ['dist/uploader.min.js']
		},
		copy:{
			main:{
				src:'themes/**',
				dest:'dist/'

			}
		},
		concat: {
			options: {
				separator: ';',
			},
			dist: {
				src: ['uploader.js', 'media-center.js', 'jquery.upyun.js'],
				dest: 'dist/upyun.js',
			},
		},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-contrib-concat');

	// Default task(s).
	grunt.registerTask('default', ['jshint','concat','uglify','copy']);

};
