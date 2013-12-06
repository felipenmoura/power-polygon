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

module.exports= function(serverConf, fn){

	var _token= false;

	var _init= function(){
		if(!dbExists(serverConf)){
			createDB();
		}else{
			ready();
		}
	};

	var dbExists= function(){
		return queries.dbExists(serverConf);
	};

	var getToken= function(){
		rl.question("> ",
	                function(answer){
	                    if(answer.length<3){
	                        write.out('error', "At least 3 characters, please!");
	                        getToken(fn, true);
	                        return;
	                    }else{
	                        write.out('checkpoint', "Your token was set!\n      You will use it to activate locked features.\n");
	                        _token= answer;
	                        createDB();
	                    }
	                });
	};

	var createDB= function(){
		if(!_token){
			write.out('question', 'It looks like it is your first time here!');
			write.out('info', 'Please, define a secret token to identify the ADMIN user:');
			getToken();
		}else{
			try{
				queries.connect(serverConf);
				queries.createDB(serverConf, _token, function(){
		                        	ready();
		                         });
			}catch(e){
				write.out('error', 'Failed creating the database!');
				write.out('info', e).message;
			}
		}

	};

	var ready= (typeof fn == 'function')? fn: function(){};

	_init();

	return this;

};