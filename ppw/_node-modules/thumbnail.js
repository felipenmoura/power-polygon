
var fs = require('fs');
var write= require('./write.js');
var talkIndexGeneratesAll= false;
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

        var l= global.talkSlides.length,
            i= 0, count= 0, found= 0, slideIdx= 0;
            picked= false;

        for(i=0; i<l; i++){
            
            if(global.talkSlides[i] && (talkIndexGeneratesAll || global.talkSlides[i].internal)){
                count++;
                found++;
                if(global.talkSlides[i].generated != true && !picked){
                    
                    generate(talk, global.talkSlides[i].id, (function(i){
                        return function(){
                            global.talkSlides[i].generated= true;
                            generateInternalSlides(talk);
                        }
                    })(i), true);
                    picked= found;
                    slideIdx= i;
                }
            }
        };
        if(picked)
            write.out('info', picked+'/'+count+ ' :: Generating slide "'+ global.talkSlides[slideIdx].id + '"');
        else{
            talkIndexGeneratesAll= false;
            //write.out('checkpoint', 'Done')
        }
    }else{
        setTimeout(generateInternalSlides, 1000);
    }
}



var generate= function(talk, slide, fn, auto){
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
    tmpFilesDir= 'ppw/tmp/talks/';
    
    if(!fs.existsSync(tmpFilesDir)){
        fs.mkdirSync(tmpFilesDir);
    }
    
    tmpFilesDir+= talk;
    if(!fs.existsSync(tmpFilesDir)){
        fs.mkdirSync(tmpFilesDir);
    }
    
    // open url(if phantomPage has loaded)
    if(global.phantomPage && global.phantomPage !== true){

        //global.phantomPage.injectScript(function (msg) {
            
        //});
        
        global.phantomPage.onConsoleMessage = function(msg, line, source) {
            if(!auto){
                if(msg.indexOf('====publicServerInformation====') >= 0){
                    var json= msg.replace(/\=\=\=\=publicServerInformation\=\=\=\=/g, '');
                    global.talkSlides= JSON.parse(json);
                    fs.writeFile(tmpFilesDir+'/'+talk+'.json', json, function(){});
                    
                    if(!slide){
                        generateInternalSlides(talk);
                    }
                }
            }
        }
        
//write.out('info', urlToPrint);
        //try{ global.phantomPage.close(); }catch(e){};
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
                        write.out('info', "Done generating thumbnail for '"+slide+"'");
                        if(fn && typeof fn == 'function')
                            fn(talk);
                    }, 1000);
                }else{
                    // was the index file from a talk
                    write.out('info', 'Talk index changed, must get talk information');
                    write.out('info', 'and regenerate each internal slide...');
                    global.talkSlides= false;
                    
                }
                
            //}, 1000);
        }, function(err){
            write.out('error', "!!!", err);
        });
    }
    
}

exports.generate= generate;