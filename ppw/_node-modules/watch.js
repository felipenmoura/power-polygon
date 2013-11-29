"use strict";

var fs = require('fs');
var write= require('./write.js');
var thumb= require('./thumbnail.js');

var parsePath= function(path){
    
    //TODO: create a customizable settings for the valid extensions
    if(!path.match(/(\.txt|\.js|\.css|\.html|\.tpl|\.php)$/i))
        return false;
        
    path= path.split(/\//g);
    path.shift();
    
    var ret= {
        talk: path[0],
        isSlide: false,
        slide: null
    }
    if(path[1] != 'index.html'){
        ret.isSlide= true;
        ret.slide= path[path.length -2];
    }
    
    return ret;
};

(function(){
    
    var editinTalk= null,
        tmpFilesDir= false;
    
    exports.watch= function(dir, conf){
        var chokidar = require('chokidar');
        var watcher = chokidar.watch(dir, conf);

        watcher
          .on('add', function(path) {
              write.out('info', 'new file added[nothing to do with it]');
          })
          .on('change', function(path) {
              
              var file= parsePath(path);
      
              if(!file.slide){
                  // index was changed, lets generate thumbs for all the internal slides
                  write.out('info', 'Talk "'+file.talk+'" changed');
                  thumb.generate(file.talk, false);
              }else{
                  // an external slide was changed, generate thumbnail for this slide only
                  write.out('info', 'Slide "'+file.slide+'" changed');
                  thumb.generate(file.talk, file.slide);
              }
              
              /*if(file.isSlide){
                  
              }*/
          })
          .on('unlink', function(path) {
              write.out('info', 'file deleted');
              // TODO:
              // if(talk/talkname)
              //     remove reference from tmp for that talk
              // if(talk/talkname/slides/slidename)
              //     remove reference from tmp for that slide
              // 
          })
          .on('error', function(error) {
              write.out('error', 'There was a problem watching a file!', error);
          });
    };
})();