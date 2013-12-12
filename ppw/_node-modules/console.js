/*============================================================================*/
// Power Polygon Service: console
// This module manages messages from third party software and the console
// itself.
/*============================================================================*/

var path= require('path'),
    root= path.resolve('./')+'/',
    fs= require('fs'),
    warnFlag= false,
    appPrefix= '[ppw]',
    logFile= 'ppw/tmp/third-party-messages.log';

var warnLength= 10;
var thirdPartyLog= {warn:[], log:[]};
var colors= require('cli-color');
// write is a writer for fancy messages and logs for this specific project
var write= global.write||require(root+'ppw/_node-modules/write.js');

// storing the original log
var originalLog= console.log;
// overwriting the original log function
console.log = function(){
    if(arguments[0] == appPrefix){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        // we are not storing log messages, but we could
        //thirdPartyLog.log.push(arguments);
    }
};

// catching uncaught exceptions not to let the app to crash
// this is supposed to never be used, once the app should
// manage its exceptions.
// also, thirdParty software errors might end up here
process.on('uncaughtException', function(err, extra) {
    // handle the error safely
    write.out('error', err.message);
    if(extra)
        write.out('info', extra);
});

// overwriting console.warning
// also creating an alias for console.warn
console.warning= console.warn= function(){

    // if it is an internal log and should be shown
    if(arguments[0] == appPrefix){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        // it is a third party software warning
        var ar= Array.prototype.slice.call(arguments, 0);
        thirdPartyLog.warn.push('- '+ar.join('\n- '));
    }
    
    // cached X warnings, should flush it into a file and clear
    // the list from memory
    if(thirdPartyLog.warn.length > warnLength){
        var baseForLogs= logFile;
        var logFile= root+baseForLogs,
            dt= new Date();

        if(warnLength > 10){
            write.out('warning', 'There are '+thirdPartyLog.warn.length+" warning messages from third party modules!");
            write.out('info', 'These logs were saved at '+baseForLogs);
        }else{
            // if warnLength was set to less than 10, we show this message only once
            // otherwise, it could be too often on the console
            if(!warnFlag){
                warnFlag= true;
                write.out('warning', 'There are warning messages from third party softwares');
                write.out('info', 'These logs were saved at '+baseForLogs);
            }
        }

        // flushing to file
        fs.appendFile(logFile, '\n'+dt.toString()+'\n'+thirdPartyLog.warn.join('\n'), 'utf8');
        thirdPartyLog.warn= [];
    }
};

exports= console;
