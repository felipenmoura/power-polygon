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
    'merge-ppw-js': {
      data: {}
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

    var fs= require('fs');
    var template= fs.readFileSync('ppw/ppwjs/ppw.js', 'utf8');
    var file= null;
    var fileContent= '';
    var rx= null;

    matches= template.match(/\/\*\!\#include (\S+) \*\//g);
    for(inc in matches){
      file= 'ppw/ppwjs/'+matches[inc].replace(/\#include|\s|[^a-zA-Z0-9\-\.\_]/g, '') + '.js';
      fileContent= fs.readFileSync(file, 'utf8');
      console.log(matches[inc]);
      //rx= new RegExp(matches[inc], 'g');
      template= template.replace(matches[inc], fileContent);
    }
    fs.writeFileSync('ppw/ppw.js', template, 'utf8');
    //console.log(this.data);
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  //grunt.registerTask('watch', ['merge-ppw-js', 'uglify']);

};