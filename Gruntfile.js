module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({

		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},

		coveralls: {
			options: {
				debug: true,
				coverageDir: 'log/coverage',
				dryRun: false,
				force: true,
				recursive: true
			}
		},

		uglify: {
			options: {
				compress: {
					drop_console: true // jshint ignore:line
				},
				preserveComments: 'all'
			},
			source: {
				files: {
					'dist/logItDown.min.js': ['src/logItDown.js']
				}
			}
		},

		copy: {
			main: {
				src: 'src/logItDown.js',
				dest: 'dist/logItDown.js'
			}
		}
	});
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-karma-coveralls');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('release', ['karma', 'coveralls', 'uglify', 'copy']);
	grunt.registerTask('test', ['karma', 'coveralls']);
};