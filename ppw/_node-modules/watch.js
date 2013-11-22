"use strict";

var fs = require('fs');

global.phantomjs= require('phantomjs');

// https://github.com/gruntjs/grunt-lib-phantomjs

//var page = require('webpage').create();
/*global.phantomjs.create(function(ph) {
    console.log('created');
});*/

//var phantom = require('phantomjs');
//var page = require('webpage').create();
//var phantomjsWrapper = require('phantomjs-wrapper');

//phantomjsWrapper({timeout: 60000}, function(err, phantomjs) {
  //phantomjs.createPage(function(err, page) {
    //page.open('http://www.google.com', function(err) {
      /*page.on('alert', function(msg) {
        console.log('Alert:', msg);
      }); */
      /*page.once('loadFinished', function() {
        page.render('google-reloaded.png', function() {
          page.close(function() {
            phantomjs.close(function() {
              console.log('done!');
            }); 
         });
        });
      });*/
      /*page.evaluateJavaScript('(function() { alert("hello!"); })');
      page.includeJs('http://code.jquery.com/jquery-2.0.3.min.js', function() {
        page.evaluateJavaScript('(function() { $("a").remove(); })');
        page.render('google-no-anchors.png', function() {
          page.reload();
        });
      });*/
    //});
  //});
//});




/*var phantom = require('phantomjs');
phantom.create(function(ph) {
  return ph.createPage(function(page) {
    return page.open("http://www.google.com", function(status) {
      console.log("opened google? ", status);
      return page.evaluate((function() {
        return document.title;
      }), function(result) {
        console.log('Page title is ' + result);
        return ph.exit();
      });
    });
  });
});*/


/*
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

var Talk= function(name){
    var tSrc= 'talks/'+name+'/index.html';
    if(fs.existsSync(tSrc)){
    
        page.open('http://github.com/', function () {
            page.viewportSize = { width: 1024, height: 768 };
            page.render('');
            phantom.exit();
        });
    
    }
};

var getTalkConf= function(talk){
    var t= new Talk(talk);
    console.log(t);
};*/

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
        ret.slide= path[path.length -2]
    }
    
    console.log(ret);
    return ret;
};

(function(){
    
    var write= require('./write.js');
    
    exports.watch= function(dir, conf){
        var chokidar = require('chokidar');
        var watcher = chokidar.watch(dir, conf);

        watcher
          .on('add', function(path) {
              write.out('info', 'new file added[nothing to do with it]');
          })
          .on('change', function(path) {
              var file= parsePath(path);
              
              if(!file)
                  return false;
              
              write.out('info', 'file changed');
              // TODO: get talkConf
              // if(talks/talkname/index.html)
              //     go through slides verifying if they exist
              //     if(slide doesn't exist)
              //        create slide structure using a slide boilerplate
              //     create reference in temp dir for the talk
              //     stop previous proccess for the talk, if any
              //     create thumbs from slide
              // if(talks/talkname) // renamed
              //     rename reference in tmp dir
              // if(talks/talkname/slides/slidename/slidename.html)
              //     if(slide is in talkConf)
              //         create thumbs for that slide
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

        write.out('checkpoint', "Listening for changes on talks and slides");
        
    };
})();