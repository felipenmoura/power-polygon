
var path= require('path'),
    root= path.resolve('./')+'/',
    fs= require('fs'),
    warnFlag= false;

var warnLength= 10;
var thirdPartyLog= {warn:[], log:[]};
var colors= require('cli-color');
var write= global.write||require(root+'ppw/_node-modules/write.js');

var originalLog= console.log;
console.log = function(){
    if(arguments[0] == '[ppw]'){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        //thirdPartyLog.log.push(arguments);
    }
};

process.on('uncaughtException', function(err, extra) {
    // handle the error safely
    write.out('error', err.message);
    if(extra)
        write.out('info', extra);
});

console.warning= console.warn= function(){

    if(arguments[0] == '[ppw]'){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        var ar= Array.prototype.slice.call(arguments, 0);
        thirdPartyLog.warn.push('- '+ar.join('\n- '));
    }
    if(thirdPartyLog.warn.length > warnLength){
        var baseForLogs= 'ppw/tmp/third-party-messages.log';
        var logFile= root+baseForLogs,
            dt= new Date();

        if(warnLength > 10){
            write.out('warning', 'There are '+thirdPartyLog.warn.length+" warning messages from third party modules!");
            write.out('info', 'These logs were saved at '+baseForLogs);
        }else{
            if(!warnFlag){
                warnFlag= true;
                write.out('warning', 'There are warning messages from third party softwares');
                write.out('info', 'These logs were saved at '+baseForLogs);
            }
        }

        fs.appendFile(logFile, '\n'+dt.toString()+'\n'+thirdPartyLog.warn.join('\n'), 'utf8');
        thirdPartyLog.warn= [];
    }
};

exports= console;