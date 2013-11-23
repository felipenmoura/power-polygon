"use strict";

var fs = require('fs');
var write= require('./write.js');

/*
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
              var file= parsePath(path),
                  serverData= server._connectionKey.split(':'),
                  urlToPrint= 'http://'+serverData[1]+':'+serverData[2]+'/talks/';
              
              if(!file)
                  return false;
              write.out('info', 'file changed(running tasks in background)');
              
              urlToPrint+= file.talk+'/?serverRequest='+(file.slide || 'true');
              urlToPrint+= '&transition=trans-cut';
              if(file.isSlide){
                  urlToPrint+= '#'+file.slide;
              }else{
                  
              }
              console.log(urlToPrint);
              
              // verify directories and files
              tmpFilesDir= 'ppw/tmp/talks/'+file.talk;
              console.log('============ VOU VERIFICAR SE EXISTE', tmpFilesDir, fs.existsSync(tmpFilesDir));
              if(!fs.existsSync(tmpFilesDir)){
                  console.log('============ NAO EXISTIA, VOU CRIAR');
                  fs.mkdirSync(tmpFilesDir);
                  console.log('============ CRIEI');
              }else{
                  
              }
              
              // open url
              if(global.phantomPage && global.phantomPage !== true){
                  
                  global.phantomPage.onConsoleMessage = function (msg) {
                      //console.log('[ppw]', 'internal message: ', msg);
                  };
                  global.phantomPage.open(urlToPrint, function(status){
                      //console.log('CARREGOU ', status);
                      setTimeout(function(){
                          var imgSrc= tmpFilesDir+ '/'+(file.slide||'cover');
                          global.phantomPage.render(imgSrc+'.png');
                          /*global.phantomPage.evaluate(function () {
                              return document.title;
                          }, function(result, a){
                              console.log('[ppw]', 'Page title is ', result, a);
                          });*/
                            
                          /*var resizer = require('resizer')
                            , fs = require('fs')
                            , inputImage = fs.createReadStream(imgSrc+'.png')
                            , outputImage = fs.createWriteStream(imgSrc+'-thumb.png');*/

                          //inputImage.pipe(resizer.contain({height: 225, width:300})).pipe(outputImage);
                          write.out('info', "Generated thumbnail for '"+(file.slide||'cover')+"'");
                          //console.log(99999999999999999, "Generating thumbnail for "+(file.slide||'cover'));
                      }, 2000);
                  });
              }
              
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
              editinTalk= file.talk;
              if(file.isSlide){
                  
              }
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