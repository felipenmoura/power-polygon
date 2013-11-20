"use strict";

var isTalkIndex= function(path){
    
};
var isTalkDir= function(path){
    
};

var isSlide= function(path){
    
};

var getTalk= function(path){
    
};

var getTalkConf= function(){
    
};

var Talk= function(){
    
};

var Slide= function(){
    
};

(function(){
    
    var write= require('./write.js');
    
    exports.watch= function(dir, conf){
        var chokidar = require('chokidar');
        var watcher = chokidar.watch(dir, conf);

        watcher
          .on('add', function(path) {
              write.out('info', 'new file added');
              //write.out('info', 'File', path, 'has been added');
          })
          .on('change', function(path) {
              write.out('info', 'file changed');
              //write.out('info', 'File', path, 'has been changed');
          })
          .on('unlink', function(path) {
              write.out('info', 'file deleted');
              //write.out('info', 'File', path, 'has been removed');
          })
          .on('error', function(error) {
              write.out('error', 'There was a problem watching a file!', error);
          });

        write.out('checkpoint', "Listening for changes on talks");
        
    };
})();