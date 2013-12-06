/*============================================================================*/
// Power Polygon resource: dml
// This module defines the structure for the database and also the queries
/*============================================================================*/
var sqlite3 = require('sqlite3').verbose()
  , fs = require('fs')
  , db = null // ':memory:'

module.exports= {
	dbExists: function(serverConf){
		var stats = null;
	    try{
	        stats= fs.existsSync(serverConf.dbsrc);
	    }catch(e){}
	    return stats? true: false;
	},
	connect: function(serverConf){
		db= new sqlite3.Database(serverConf.dbsrc);
	},
	createDB: function(serverConf, _token, fn){
		db.serialize(function(){

            // TABLE SERVERCONFIG
            db.run("CREATE TABLE serverconfig (confid INTEGER, usedefaultuser INTEGER, defaultuser TEXT)");
            var stmt = db.prepare("INSERT INTO serverconfig VALUES (?, ?, ?)");
            stmt.run(1, serverConf.usedefaultuser, serverConf.defaultuser);
            stmt.finalize();

            // TABLE USERDATA
            db.run("CREATE TABLE userdata (userid INTEGER, username TEXT, usertoken TEXT)");

            var stmt = db.prepare("INSERT INTO userdata VALUES (?, ?, ?)");
            stmt.run(1, serverConf.defaultuser, _token);
            stmt.finalize();

            if(typeof fn == 'function'){
            	try{
            		fn();
            	}catch(e){
            		throw new Error('Failed executing callback after creating the database'+
            						'\n                   '+e.message);
            	}
            }

        });
	}
};







