module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'ppw/ppw.js',
        dest: 'ppw/ppw-min.js'
      }
    },
    watch: {
      scripts: {
        files: ['ppw/ppwjs/*.js'],
        tasks: ['merge-ppw-js'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.registerMultiTask('merge-ppw-js', 'merges peaces of ppw.js into ppw.js and minifies it', function(){
    console.log(this.data);
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  //grunt.registerTask('watch', ['merge-ppw-js', 'uglify']);

};