
var colors= require('cli-color');

var write= function(type){
    if(type == 'error'){
        type= 'red'
        typeLabel= " [PPW]::Error   | ";
    }else if(type == 'warn' || type == "warning"){
        type= 'yellow'
        typeLabel= " [PPW]::Warning | ";
    }else if(type == 'checkpoint' || type == 'green'){
        type= 'green'
        typeLabel= " [PPW]::OK      | ";
    }else if(type == 'step'){
        type= 'white'
        typeLabel= "                - ";
    }else if(type == 'line'){
        console.log('[ppw]', " --------------------------------------------------------------------------");
        return;
    }else{
        type= 'white'
        typeLabel= "      ::        - ";
    }
    
    var ar= Array.prototype.slice.call(arguments, 1);
    ar.unshift(colors[type](typeLabel));
    ar.unshift('[ppw]');
    
    console.log.apply(this, ar);
};

exports.out= write;