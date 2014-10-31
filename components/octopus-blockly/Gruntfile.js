module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      core: {
	    files: [ 'blockly/core/*.js' ],
        tasks: [ 'browserify', 'uglify:core' ]
      },
      blocks: {
	    files: [ 'blocks/*.js' ],
        tasks: [ 'concat:blocks', 'uglify:blocks' ]
      },
      pythonocto: {
	    files: [ 'generators/python-octo.js', 'generators/python-octo/*.js' ],
        tasks: [ 'concat:pythonocto', 'uglify:pythonocto' ]
      }, 
    },
    browserify: {
      'dist/blockly.js': [ 'blockly/core/blockly.js' ]
    },
	concat: {
      blocks: {
        src: [ 'blocks/*.js' ],
        dest: 'dist/blocks.js'
      },
      pythonocto: {
        src: [ 'generators/python-octo.js', 'generators/python-octo/*.js' ],
        dest: 'dist/python-octo.js'
      }
	},
	uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! blockly <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      core: {
        files: {
          'dist/blockly.min.js': ['dist/blockly.js']
        }
      },
      blocks: {
        files: {
          'dist/blocks.min.js': ['dist/blocks.js']
        }
      },
      pythonocto: {
        files: {
          'dist/python-octo.min.js': ['dist/python-octo.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
