
var fs = require('fs');
var write= require('./write.js');
global.editinTalk= null;
global.talkSlides= null;

/*var evaluateLoaded= function(fn){
    write.out('info', 'Retrieving talk information');
    global.phantomPage.evaluate(function() {
        return window.publicServerInformation;
    }, function(x, information){
        if(information)
            fn(information);
        else
            setTimeout(evaluateLoaded, 100);
    });
};*/

var generateInternalSlides= function(talk){
    
    if(global.talkSlides){

        var l= global.talkSlides.length;

        while(l && l--){
            
            if(global.talkSlides[l] && global.talkSlides[l].internal && global.talkSlides[l].generated != true){
                write.out('info', 'generating image for internal slide ', global.talkSlides[l].id);
                
                generate(talk, global.talkSlides[l].id, (function(l){
                    return function(){
                        global.talkSlides[l].generated= true;
                        generateInternalSlides();
                    }
                })(l));
                break;
            }
        };
        // for each internal slide not yet generated
        //generate(talk, curSlide, generateInternalSlides);
        // mark curSlide as generated
    }else{
        setTimeout(generateInternalSlides, 1000);
    }
}



var generate= function(talk, slide, fn){
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
                    generateInternalSlides(talk);
                }
            }
        }else{
            global.phantomPage.onConsoleMessage = function(msg, line, source) {};
        }
//write.out('info', urlToPrint);
        try{ global.phantomPage.close(); }catch(e){};
        global.phantomPage.open(urlToPrint, function(status){
            
            //setTimeout(function(){
                if(slide){
                    var imgSrc= tmpFilesDir+ '/'+slide;
                    if(!fs.existsSync(imgSrc)){
                        fs.mkdirSync(imgSrc);
                    }
                    imgSrc+= '/'+slide;
                    //global.editinTalk

                    setTimeout(function(){
                        global.phantomPage.render(imgSrc+'.png');
                        write.out('info', "Generated thumbnail for '"+slide+"'");
                        if(fn && typeof fn == 'function')
                            fn(talk);
                    }, 1000);
                }else{
                    // was the index file from a talk
                    write.out('info', 'Talk index changed, must get talk information');
                    write.out('info', 'and regenerate each internal slide...');
                    global.talkSlides= false;
                    
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

exports.generate= generate;