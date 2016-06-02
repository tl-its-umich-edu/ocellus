module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // configure jshint
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      // when this task is run, lint the Gruntfile and all js files in src
      build: ['app/js/*.js']
    },

    // configure uglify to minify and concatenate js
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n',
        sourceMap: true,
        sourceMapName: 'all.min.js.map',
        separator: ';',
        stripBanners: true,
        mangle: false
      },
      build: {
        files: {
          'app/js/dist/all.min.js': 'app/js/*js'
        }
      }
    },
    watch: {
      javascript: {
        files: 'app/js/*.js',
        tasks: ['jshint', 'uglify']
      }
    }
  });

  grunt.registerTask('docker', ['uglify']);
  grunt.registerTask('dev', ['uglify', 'jshint']);
  grunt.registerTask('js-dev', ['uglify', 'jshint','watch']);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
