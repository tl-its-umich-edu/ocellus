module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // configure jshint
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
    }
  });

  grunt.registerTask('default', ['uglify']);
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
