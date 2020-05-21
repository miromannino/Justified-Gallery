'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
      ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' * Licensed under the <%= pkg.license %> license.\n' +
      ' */\n',

    // Task configuration.
    clean: {
      files: ['dist']
    },

    // Copy the src files to the dist files, also appending the banner
    concat: {
      main: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true
        },
        files: {
          'dist/js/jquery.<%= pkg.name %>.js': ['src/js/jquery.<%= pkg.name %>.js'],
          'dist/css/<%= pkg.name %>.css': ['dist/css/<%= pkg.name %>.css'],
          'dist/css/<%= pkg.name %>.min.css': ['dist/css/<%= pkg.name %>.min.css']
        }
      }
    },

    replace: {
      main: {
        src: ['dist/js/jquery.<%= pkg.name %>.js'],
        dest: 'dist/js/jquery.<%= pkg.name %>.js',
        replacements: [{
          from: /\/\/JG-CONTROLLER((.|\n)*)\/\/END JG-CONTROLLER/m,
          to: '<%= grunt.file.read("src/js/" + pkg.name + ".js").replace(/\\/\\*[\\s\\S]*?\\*\\/(\\n|\\s)*/, "").replace(/\\n/g, "\\n  ") %>'
        }]
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

    // compress the zip with the distribution, to allow fast downloads from GitHub
    compress: {
      main: {
        options: {
          archive: 'dist/<%= pkg.name %>.zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/css/',
            src: ['<%= pkg.name %>.css'],
            dest: '/'
          },
          {
            expand: true,
            cwd: 'dist/js/',
            src: ['jquery.<%= pkg.name %>.js'],
            dest: '/'
          }
        ]
      },
      minified: {
        options: {
          archive: 'dist/<%= pkg.name %>.min.zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/css/',
            src: ['<%= pkg.name %>.min.css'],
            dest: '/'
          },
          {
            expand: true,
            cwd: 'dist/js/',
            src: ['jquery.<%= pkg.name %>.min.js'],
            dest: '/'
          }
        ]
      }
    },

    // Task to update the dependencies in the test HTMLs, to use when new tests have been added
    wiredep: {
      target: {
        devDependencies: true,
        includeSelf: true,
        src: ['test/main/*.html', 'test/related/*.html'],
        exclude: [ 'node_modules/requirejs' ],
        overrides: {
          "swipebox": {
            "main": ["src/js/jquery.swipebox.min.js", "src/css/swipebox.min.css"]
          },
          "colorbox": { 
            "main": ["jquery.colorbox.js", "example1/colorbox.css"]
          }

        }
      }
    },

    publish: {
      main: {
        options: {
            ignore: [
              'node_modules'
            ]
        },
        src: ['./']
      }
    }

  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Default task (release mode)
  grunt.registerTask('default', ['jshint', 'less', 'csslint', 'concat', 'replace', 'uglify', 'compress']);

  // Debug mode (when the library is needed to be compiled only for the tests)
  grunt.registerTask('debug', ['less', 'concat', 'replace']);


};
