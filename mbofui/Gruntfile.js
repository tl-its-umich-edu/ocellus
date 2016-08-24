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
        sourceMap: true,
        separator: ';',
        stripBanners: true,
        mangle: false
      },
      build: {
        files: {
          'app/js/dist/all.min.js': 'app/js/*js',
          'app/js/dist/all-vendor.min.js': [
          'bower_components/leaflet/dist/leaflet.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
          'bower_components/leaflet-plugins/layer/tile/Google.js',
          'bower_components/jquery/jquery.min.js',
          'bower_components/bootstrap/dist/js/bootstrap.min.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster-src.js',
          'bower_components/ui-leaflet/dist/ui-leaflet.min.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/moment/min/moment.min.js'
          ]
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

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
