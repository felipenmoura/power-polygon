/*============================================================================*/
// Power Polygon Service: write
// This module writes/outputs messages and data to the console
/*============================================================================*/

// module that helps us to use colors on console
var colors= require('cli-color');

// this method outputs messages and data in Power Polygon Service's format
var write= function(type){
    if(type == 'error'){
        type= 'red';
        typeLabel= " [PPW]::Error   | ";
    }else if(type == 'warn' || type == "warning"){
        type= 'yellow';
        typeLabel= " [PPW]::Warning | ";
    }else if(type == 'checkpoint' || type == 'green'){
        type= 'green';
        typeLabel= " [PPW]::OK      | ";
    }else if(type == 'question' || type == 'blue'){
        type= 'blue';
        typeLabel= " [PPW]::Question| ";
    }else if(type == 'step'){
        type= 'white';
        typeLabel= "                - ";
    }else if(type == 'line'){
        console.log('[ppw]', " --------------------------------------------------------------------------");
        return;
    }else{
        type= 'white';
        typeLabel= "      ::        - ";
    }

    var ar= Array.prototype.slice.call(arguments, 1);
    ar.unshift(colors[type](typeLabel));
    ar.unshift('[ppw]');

    console.log.apply(this, ar);
};

// exposes the write method
exports.out= write;

// useful shortcuts for longer messages
// header
exports.writeHead= function(){
        console.log('[ppw]', "+==========================================================================+");
        console.log('[ppw]', "|                             Power Polygon Web                            |");
        console.log('[ppw]', "+==========================================================================+");
        console.log('[ppw]', ' Thanks for using Power Polygon.');
        console.log('[ppw]', ' Please report any issue at ', colors.yellow.underline("http://github.com/braziljs/power-polygon/"));
        console.log('[ppw]', ' Check the licenses at ppw/_licenses');
        write('line');
};

// server started, or did it?
exports.serverStarted= function(status, serverConf){
    if(status){
        write('checkpoint', 'HTTP server listening on port '+ colors.yellow(serverConf.port));
        write('info', 'Access your HTTP server in your browser like this:');
        write('info', '   '+colors.underline('http://yourIP:'+serverConf.port+ '/'));
    }else{
        write('warning', "It was not possible to start the server at port "+serverConf.port+"!\nPlease verify if you have permission to do so.\n");
    }
}
