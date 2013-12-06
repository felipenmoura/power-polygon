/*============================================================================*/
// Power Polygon Service: server
// This module is responsible for the app/server behaviours
/*============================================================================*/


var serverData= null;
//var passport= require('passport');

module.exports= function(data){
	serverData= data;
	var express = require('express'),
  		app = express(),
  		http = require('http');

  	app.configure(function () {
		app.set('port', serverData.port || 8081);
		app.set('views', __dirname + '/ppw/_views');
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.session({ secret: 'keyboard cat' }));
		//app.use(passport.initialize());
		//app.use(passport.session());
		app.use(express.methodOverride());
		//app.use(flash());
		app.use(app.router);
		app.use(express.static(path.join(__dirname, 'public')));

		app.use(express.compress());
		app.use(express.json({
		    keepExtensions: true,
		    uploadDir: serverData.uploadDir,
		    expires: new Date(Date.now() + (120 * 60 * 1000)) // expires in two hours
		}));
		app.use(express.urlencoded());
		app.use(express.session({
		    secret: serverData.serverSecret,
		    store: new express.session.MemoryStore
		}));
		app.locals.compileDebug = false;
	});

  	app.start= function(){
  		app.listen(serverData.port);
  	}

	global.server= app;
	return app;
};