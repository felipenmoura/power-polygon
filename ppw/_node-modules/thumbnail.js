
var fs = require('fs');
var write= require('./write.js');
global.editinTalk= null;
global.talkSlides= null;

var evaluateLoaded= function(fn){
    write.out('info', 'Retrieving talk information');
    global.phantomPage.evaluate(function() {
        return window.publicServerInformation;
    }, function(x, information){
        if(information)
            fn(information);
        else
            setTimeout(evaluateLoaded, 100);
    });
};

var generateInternalSlides= function(){
    if(global.talkSlides){
        // for each internal slide not yet generated
        //generate(talk, curSlide, generateInternalSlides);
        // mark curSlide as generated
    }else{
        setTimeout(generateInternalSlides, 1000);
    }
}

exports.generate= function(talk, slide){
    var serverData= server._connectionKey.split(':'),
    urlToPrint= 'http://'+serverData[1]+':'+serverData[2]+'/talks/';

    if(!talk)
        return false;

    urlToPrint+= talk+'/?serverRequest='+(slide || 'true');
    urlToPrint+= '&transition=trans-cut';
    
    if(slide){
        urlToPrint+= '#'+slide;
    }

    // verify directories and files
    tmpFilesDir= 'ppw/tmp/talks/'+talk;
    
    if(!fs.existsSync(tmpFilesDir)){
        fs.mkdirSync(tmpFilesDir);
    }
    
    // open url(if phantomPage has loaded)
    if(global.phantomPage && global.phantomPage !== true){

        //global.phantomPage.injectScript(function (msg) {
            
        //});
        if(!slide){
            global.phantomPage.onConsoleMessage = function(msg, line, source) {
                if(msg.indexOf('====publicServerInformation====') >= 0){
                    global.talkSlides= JSON.parse(msg.replace(/\=\=\=\=publicServerInformation\=\=\=\=/g, ''));
                }
            }
        }else{
            global.phantomPage.onConsoleMessage = function(msg, line, source) {});
        }

        global.phantomPage.open(urlToPrint, function(status){
            //setTimeout(function(){
                if(slide){
                    var imgSrc= tmpFilesDir+ '/'+slide;
                    if(!fs.existsSync(imgSrc)){
                        fs.mkdirSync(imgSrc);
                    }
                    imgSrc+= '/'+slide;
                    //global.editinTalk

                    global.phantomPage.render(imgSrc+'.png');
                    write.out('info', "Generated thumbnail for '"+slide+"'");
                }else{
                    // was the index file from a talk
                    write.out('info', 'Talk index changed, must get talk information');
                    write.out('info', 'and regenerate each internal slide...');
                    
                    generateInternalSlides();
                    
                    /*global.phantomPage.evaluate(function() {
                        return document.querySelectorAll('.ppw-slide-container');
                    }, function(x, information){
                        write.out('warn', x, information);
                    });*/
                    /*evaluateLoaded(function(information){
                        // set the editingTalk information(talk settings)
                        write.out('info', 'Got talk information, generating all the internal slides');
                        //console.log('[ppw]', information);
                    });*/
                }
                
            //}, 1000);
        }, function(err){
            write.out('error', "!!!", err);
        });
    }
    
}