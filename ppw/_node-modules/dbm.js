/*============================================================================*/
// Power Polygon Service: dbm
// This module is a layer abstraction for the database
/*============================================================================*/

var databaseManager= 'sqlite3' // currently supporting sqlite
  , fs = require('fs')
  , readline = require('readline')
  , rl = readline.createInterface({
             input: process.stdin,
             output: process.stdout
         })
  , utils= global.utils
  , write= utils.require('write')
  , queries= utils.require('resources/dml.'+databaseManager);

module.exports= function(serverConfig, fn){

	var _token= false,
		_this= this,
		serverConf= serverConfig;

	var _init= function(){
		if(!dbExists(serverConf)){
			createDB();
		}else{
			queries.connect(serverConf);
			ready(_this);
		}
	};

	var dbExists= function(){
		return queries.dbExists(serverConf);
	};

	var getToken= function(fn){
		rl.question("> ",
	                function(answer){
	                    if(answer.length<3){
	                        write.out('error', "At least 3 characters, please!");
	                        getToken(fn, true);
	                        return;
	                    }else{
	                        _token= answer;
	                        if(fn && typeof fn == 'function')
	                        	fn(_token);
	                    }
	                });
	};

	var createDB= function(){
		if(!_token){
			write.out('question', 'It looks like it is your first time here!');
			write.out('info', 'Please, define a secret token to identify the ADMIN user:');
			getToken(createDB);
		}else{
			try{
				queries.connect(serverConf);
				queries.createDB(serverConf, _token, function(){
	                        		write.out('checkpoint', "Your token was set!\n      You will use it to activate locked features.\n");
		                        	ready(_this);
		                         });
			}catch(e){
				write.out('error', 'Failed creating the database!');
				write.out('info', e).message;
			}
		}

	};

	this.renewToken= function(fn){
		write.out('question', 'Please, type the new token for admin');
		getToken(function(token){
					queries.renewToken(token);
					write.out('checkpoint', "Your new token was set");
					if(typeof fn == 'function')
						fn();
			    });
	};

	var ready= (typeof fn == 'function')? fn: function(){};

	_init();

	return this;

};