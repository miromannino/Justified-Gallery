'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('justifiedGallery.jquery.json'),
    banner: '/*!\n' +
      ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' * Licensed under the <%= _.pluck(pkg.licenses, "type").join(", ") %> license.\n' + 
      ' */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        files: {
          'dist/js/jquery.<%= pkg.name %>.js': ['src/js/<%= pkg.name %>.js'],
          'dist/css/<%= pkg.name %>.css': ['dist/css/<%= pkg.name %>.css'],
          'dist/css/<%= pkg.name %>.min.css': ['dist/css/<%= pkg.name %>.min.css']
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['dist/js/jquery.<%= pkg.name %>.js'],
        dest: 'dist/js/jquery.<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/js/*.js']
      }
    },

    less: {
      development: {
        options: {
          paths: ["src/less"]
        },
        files: {
          'dist/css/<%= pkg.name %>.css': ['src/less/<%= pkg.name %>.less']
        }
      },
      production: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          'dist/css/<%= pkg.name %>.min.css': ['dist/css/<%= pkg.name %>.css']
        }
      }
    },

    csslint: {
      options: {
        csslintrc: 'src/less/.csslintrc'
      },
      src: [
        'dist/css/*.css'
      ]
    },

  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'less', 'csslint', 'concat', 'uglify']);

};
