global.phantom= require('node-phantom');
var write= global.write;

if(!phantom.create)
    throw new Error('no phantomjs found');

global.phantomPage= true;

var create= function(o){
    //try{
      //  global.phantomPage.close();
    //}catch(e){};
    
    global.phantom.create(function(err, ph) {
        
        if(ph && ph.createPage){
            return ph.createPage(function(err,page) {
                
                if(o.verbose)
                    write.out('info', "Listening for changes on talks and slides");
                
                page.set('viewportSize', { width: 1024, height: 768 });
                page.set('settings.loadImages', true);

                global.phantomPage= page;
                if(o.verbose){
                    write.out('checkpoint', '2/2 :: Starting services');
                    write.out('info', 'Talk emulator started in background');
                }
                
                if(o.oncreate && typeof o.oncreate == 'function'){
                    o.oncreate();
                }
            });
        }else{
            if(o.verbose){
                write.out('warn', '2/2 :: Starting services');
                write.out('info', 'phantomjs not found, no thumbnails will be');
                write.out('info', 'generated for slides.');
            }
            return false;
        }
    }, {parameters:{'ignore-ssl-errors':'yes'}});
}

exports.create= create;
exports.load= function(o, force){
    if(force){
        var oldComplete= o.complete||function(){};
        o.oncreate= function(){
            if(o.console && typeof o.console == 'function'){
                global.phantomPage.onConsoleMessage= o.console;
            }else{
                global.phantomPage.onConsoleMessage= function(){};
            }
            global.phantomPage.open(o.url, oldComplete);
        }
        create(o);
    }else{
        if(o.console && typeof o.console == 'function'){
            global.phantomPage.onConsoleMessage= o.console;
        }else{
            global.phantomPage.onConsoleMessage= function(){};
        }
        global.phantomPage.open(o.url, oldComplete);
    }
}