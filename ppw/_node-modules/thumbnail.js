
var fs = require('fs');
var write= require('./write.js');
var talkIndexGeneratesAll= true;
var timeLimit= 6000;
var timeOutObj= false;
var PH= require('./phantom.js');
var forcedGeneration= false;
global.editinTalk= null;
global.talkSlides= null;

var copy= function(from, to){
    var inStr = fs.createReadStream(from);
    var outStr = fs.createWriteStream(to);
    inStr.pipe(outStr);
};

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

        var slides= global.talkSlides.slides,
            l= slides.length,
            i= 0, count= 0, found= 0, slideIdx= 0;
            picked= false;

        for(i=0; i<l; i++){
            
            if(slides[i] && (talkIndexGeneratesAll || slides[i].internal)){
                count++;
                found++;
                if(slides[i].generated != true && !picked){
                    
                    generate(talk, slides[i].id, (function(i){
                        return function(){
                            slides[i].generated= true;
                            generateInternalSlides(talk);
                        }
                    })(i), true);
                    picked= found;
                    slideIdx= i;
                }
            }
        };
        if(picked)
            write.out('info', picked+'/'+count+ ' :: Generating slide "'+ slides[slideIdx].id + '"');
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

    function render(fn, timeout){
        if(!slide){
            write.out('error', slide);
            return true;
        }
        
        var imgSrc= tmpFilesDir+ '/'+slide;
        if(!fs.existsSync(imgSrc)){
            fs.mkdirSync(imgSrc);
        }
        imgSrc+= '/'+slide;
        //global.editinTalk

        setTimeout((function(imgSrc, slide){
            return function(){
                global.phantomPage.render(imgSrc+'.png');
                if(timeout)
                    write.out('info', "Forced thumbnail generation for timeou("+slide+")");
                else
                    write.out('info', 'Generated thumbnail for "'+slide+'"');
                if(fn && typeof fn == 'function')
                    fn(talk);
            }
        })(imgSrc, slide), 1000);
    };

    if(!talk)
        return false;

    urlToPrint+= talk+'/?serverRequest='+(slide || 'true');
    urlToPrint+= '&transition=trans-cut';
    
    if(slide){
        urlToPrint+= '#'+slide;
    }

    // verify directories and files
    var tmpFilesDir= 'ppw/tmp/talks/';
    
    if(!fs.existsSync(tmpFilesDir)){
        fs.mkdirSync(tmpFilesDir);
    }
    
    tmpFilesDir+= talk;
    if(!fs.existsSync(tmpFilesDir)){
        fs.mkdirSync(tmpFilesDir);
    }
    
    // open url(if phantomPage has loaded)
    if(global.phantomPage && global.phantomPage !== true){
        
        //global.phantomPage.onConsoleMessage = 
        PH.load({
            url: urlToPrint,
            verbose: false,
            oncreate: false,
            console: function(msg, line, source) {

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
                if(msg.indexOf('====DONE-LOADING====') >= 0){
                    clearTimeout(timeOutObj);

                    //if(slide){
                        render(fn);
                    /*}else{
                        // was the index file from a talk
                        write.out('info', 'Talk index changed, must get talk information');
                        write.out('info', 'and (re)generate each internal slide...');
                        global.talkSlides= false;
                    }*/
                }
                //console.log('[ppw]', msg)
            },
            complete: function(){}
        }, forcedGeneration);
        /*global.phantomPage.open(urlToPrint, function(status){
            
        }, function(err){
            write.out('error', err);
        });*/
        timeOutObj= setTimeout(function(){ render(fn, true); forcedGeneration= true }, timeLimit+(forcedGeneration? 2000: 0));
        forcedGeneration= false;
    }
}

exports.generate= generate;