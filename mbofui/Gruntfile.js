module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // configure jshint
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      // when this task is run, lint the Gruntfile and all js files in src
      build: ['Gruntfile.js', 'app/js/*.js']
    },

    // configure uglify to minify and concatenate js
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n',
        sourceMap:true,
        sourceMapName : 'all.min.js.map',
        separator: ';',
        stripBanners:true,
        mangle: false
      },
      build: {
        files: {
          'app/js/dist/all.min.js': 'app/js/*js'
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint','uglify']);

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
