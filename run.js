/* SERVER DEFAULT CONFIGURATION */
var serverConf= {
    usedefaultuser: true,
    defaultuser: 'admin',
    dbsrc: '.sqldb',
    port: 8081,
    serverSecret: 'onlyMeAndGitHubUsersKnowIt! - Please,change this for your use'
}

var thirdPartyLog= {warn:[], log:[]};
var colors= require('cli-color');
global.write= require('./ppw/_node-modules/write.js');

var originalLog= console.log;
console.log = function(){
    if(arguments[0] == '[ppw]'){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        //thirdPartyLog.log.push(arguments);
    }
};

console.warning= console.warn= function(){
    if(arguments[0] == '[ppw]'){
        var ar= Array.prototype.slice.call(arguments, 1);
        originalLog.apply(this, ar);
    }else{
        thirdPartyLog.warn.push(arguments);
    }
    if(thirdPartyLog.warn.length > 100){
        write.out('warning', 'There are '+thirdPartyLog.warn.length+" warning messages from third party modules!");
        rl.question("Would you like to see them all?\nType YES to show the messages and clean the list or NO to just clean the list\n > ",
                    function(answer){
                        if(answer.toLowerCase() == 'yes'){
                            console.log('[ppw]', thirdPartyLog.warn);
                        }
                        thirdPartyLog.warn= [];
                    });
    }
};

var page = null;

//global.phantomjs= require('phantomjs');

try{
    require('./ppw/_node-modules/phantom.js').create({verbose: true});
}catch(e){
    global.phantomPage= false;
}

/* DEFINITIONS */
var express = require('express')
  , app = express()
  , fs = require('fs')
  , io = null
  , _token= false
  , server = null
  , store  = new express.session.MemoryStore
  , readline = require('readline')
  , sqlite3 = require('sqlite3').verbose()
  , db = null // ':memory:'
  , rl = readline.createInterface({
             input: process.stdin,
             output: process.stdout
         });

/* MIDLEWARES */
app.use(express.compress());
app.use(express.cookieParser());
app.use(express.json({
    keepExtensions: true,
    uploadDir: '/ppw/tmp/',
    expires: new Date(Date.now() + (120 * 60 * 1000)) // expires in two hours
}));
app.use(express.urlencoded());
app.use(express.session({
    secret: serverConf.serverSecret,
    store: store
}));

/**
 * Useful services to work with the API
 */
Services= (function(){

    var listDir= function(path){
        var files= fs.readdirSync(path);

        var i= files.length-1;

        var list= [];
        do{
        //while(i>=0 && --i){
            if(files[i][0] != '.' && files[i] != 'README')
                list.push(files[i]);
        //}
        }while(i--);
        return list;
    };

    var deliver= function(url, req, res){

        url= url.replace(/(\/\..*)|(\?.*)|(\#.*)/ig, '');
        if(url[url.length-1] == '/')
            url+= 'index.html';

        fs.readFile(__dirname+url, function(err, data){

            if (err) {
                res.writeHead(500);
                return res.end('Error loading: ' + __dirname + url);
            }

            if(url.match(/\.js(\?|$)/i)){
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            }
            if(url.match(/\.json(\?|$)/i)){
                res.setHeader('Content-Type', 'text/json; charset=utf-8');
            }
            if(url.match(/\.html(\?|$)/i)){
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            if(url.match(/\.css$/i)){
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
            }
            if(url.match(/\.png$/i)){
                res.setHeader('Content-Type', 'image/png');
            }
            if(url.match(/\.jpg$/i)){
                res.setHeader('Content-Type', 'image/jpg');
            }
            if(url.match(/\.gif$/i)){
                res.setHeader('Content-Type', 'image/gif');
            }

            res.writeHead(200);

            // fixing a bug in nodejs, for empty files(explodes the gzip module!)
            if(!data || !data.length)
                data= "// Empty file!";

            res.end(data);

        });
    };

    var _logoff= function(req, res){
        var data= { status: 'done' };
        req.session.destroy();
        res.writeHead(200);
        res.end(JSON.stringify(data));
    };

    var _isLogged= function(req){
        return req.session.auth? true: false;
    };

    var _login= function(req, res){

        var token= req.body.token,
            qr= "SELECT userid,\
                        username,\
                        usertoken\
                   FROM userdata\
                  WHERE usertoken= ?",
            auth= false,
            data= {};

        // if already logged
        if(_isLogged(req)){
            res.writeHead(200);
            res.end(JSON.stringify({auth: true, status: 200}));
            return;
        }

        db.serialize(function(){
            db.each(qr, token, function(err, row){
                auth= row.usertoken;
                return false;
            }, function(){

                if(auth){
                    data.auth= true;
                    data.status= 200;

                    req.session.token= token;
                    req.session.auth= true;
                }else{
                    req.session= null;
                    data.status= 200;
                    data.auth= false;
                }

                res.writeHead(200);
                res.end(JSON.stringify(data));
            });
        });

    };

    var _socketsEvents= function (socket) {

        socket.on('listening', function (talk) {
            socket.set('watchingTo', talk);
            socket.join(talk);
            write.out('info', 'Socket connection')
        });
        socket.on('remote-control-send', function (data) {
            socket.get('watchingTo', function(err, watchingTo){
                socket.broadcast
                      .to( watchingTo )
                      .emit('control-command', data);
            });
        });
    }

    var _init= function(){

        var url= "",
            root= '/ppw/_tools/remote/index.html';

        app.get('/run.js', function(req, res){
            url= root;
            deliver(url, req, res);
        });
        app.get('/', function(req, res){
            url= root;
            deliver(url, req, res);
        });

        // API - get
        app.get('/api/:command', function(req, res){

            var data= {
                demos: [],
                talks: [],
                errors: [],
                auth: _isLogged(req)
            }

            res.setHeader('Content-Type', 'text/json; charset=utf-8');
            switch(req.params.command){
                case "verifylogin":{
                        // will just return the data object as it is
                    break;
                }
                case "getTalksList":{
                        data.talks= Services.listDir('./talks/');
                    break;
                }
                case "getDemosList":{
                        data.demos= Services.listDir('./_demos/');
                    break;
                }
                case "logoff":{
                    _logoff(req, res);
                    return;
                    break;
                }
                case "remoteControl":{
                    //
                    break;
                }
            }
            res.end(JSON.stringify(data));
        });

        // API - post
        app.post('/api/:command', function(req, res){

            var postData= req.body;
            res.setHeader('Content-Type', 'text/json; charset=utf-8');

            if(req.params.command == 'auth'){
                _login(req, res);
                return;
            }

            if(!_isLogged(req, res)){
                return false;
            }
        });

        // filtering only authenticated users
        app.get(/^\/ppw\/_tools\/remote\/(basic|full)\/.*/, function(req, res){
            if(_isLogged(req, res))
                deliver(req.url, req, res);
            else{
                res.redirect('/');
            }
        });

        // File deliveries
        app.get(/^\/ppw\/.*/, function(req, res){
            deliver(req.url, req, res);
        });

        app.get(/^\/talks\/.*/, function(req, res){
            deliver(req.url, req, res);
        });

        app.get(/^\/_demos\/.*/, function(req, res){
            deliver(req.url, req, res);
        });
        
        console.log('[ppw]', "+==========================================================================+");
        console.log('[ppw]', "|                             Power Polygon Web                            |");
        console.log('[ppw]', "+==========================================================================+");
        console.log('[ppw]', ' Thanks for using Power Polygon.');
        console.log('[ppw]', ' Please report any issue at ', colors.yellow.underline("http://github.com/braziljs/power-polygon/"));
        console.log('[ppw]', ' Check the licenses at ppw/_licenses');
        write.out('line');
        
        write.out('checkpoint', 'Initializing...');
        write.out('info', 'Type '+colors.yellow("q/quit/exit")+' to exit by any time');

        // listeners
        server= app.listen(serverConf.port);
        global.server= server;
        // just announcing the server initialization...
        if(server){
            write.out('checkpoint', 'HTTP server listening on port '+ colors.yellow(serverConf.port));
            write.out('info', 'Access your HTTP server in your browser like this:');
            write.out('info', '   '+colors.underline('http://yourIP:'+serverConf.port+ '/'));
            //write.out('line');
        }else{
            write.out('warning', "It was not possible to start the server at port "+serverConf.port+"!\nPlease verify if you have permission to do so.\n");
        }
        
        write.out('checkpoint', 'Starting sockets interface');
        io= require('socket.io').listen(server, {log: false});
        io.sockets.on('connection', _socketsEvents);
        write.out('info', 'Sockets allow you to control your talk remotelly');
        //write.out('line');
        
        if(_token)
            write.out('checkpoint', 'Your token is ' + _token);

        if(!global.phantomPage){
            write.out('warning', 'Failed loading phantomJS!');
            write.out('info', 'That means no thumbnails can be created for your slides.');
            write.out('info', 'Please install PhantonJS in order to have slides');
            write.out('info', 'thumbnails and a better printable version of your talk.');
        }else{
            write.out('checkpoint', 'PhantomJS identified');
            write.out('info', 'With PhantomJS you can:');
            write.out('info', '   Use a better printable version for your talk');
            write.out('info', '   See thumbnails for your slides in presentation tool');
            write.out('info', '   See thumbnails for the first slide on startup screen');
        }
        write.out('line');
        write.out('checkpoint', '1/2 :: Initialized...starting services');
        if(global.phantomPage)
            startWatchingForChanges();
        global.rl= rl;
        rl.question("",
                    function(answer){
                        answer= answer.toLowerCase();
                        if(   answer == 's'
                           || answer == 'q'
                           || answer == 'stop'
                           || answer == 'exit'
                           || answer == 'quit'){
                            write.out('info', 'Power Polygon service finished');
                            process.exit();
                        }
                    });
    };

    return {
        init: _init,
        listDir: listDir
    }
})();

/**
 * Asks for the token, on the CONSOLE, the first time the user runs it.
 */
var getToken= function(fn, repeat){

    if(!repeat)
        write.out('checkpoint', "It looks like it is your first time here!\n      Please, define a secret token to identify the ADMIN user:");

    rl.question("> ",
                function(answer){
                    if(answer.length<3){
                        write.out('error', "At least 3 characters, please!");
                        getToken(fn, true);
                        return;
                    }else{
                        write.out('checkpoint', "Your token was set!\n      You will use it to activate locked features.\n");
                        _token= answer;
                        if(fn && typeof fn == 'function'){
                            try{
                                fn(_token);
                            }catch(e){
                                write.out('error', "Failed executing the callback for getToken!");
                            }
                        }
                    }
                });
};

/**
 * Verifies wether the database exists or not.
 *
 * In case it does not exist, it is created with its tables.
 */
var verifyDB= function(){

    var stats = null;
    try{
        stats= fs.lstatSync(serverConf.dbsrc);
    }catch(e){}

    db= new sqlite3.Database(serverConf.dbsrc);

    // DATABASE does not exist
    if(!stats){

        // must create the database
        db.serialize(function(){

            // TABLE SERVERCONFIG
            db.run("CREATE TABLE serverconfig (confid INTEGER, usedefaultuser INTEGER, defaultuser TEXT)");
            var stmt = db.prepare("INSERT INTO serverconfig VALUES (?, ?, ?)");
            stmt.run(1, serverConf.usedefaultuser, serverConf.defaultuser);
            stmt.finalize();

            // TABLE USERDATA
            db.run("CREATE TABLE userdata (userid INTEGER, username TEXT, usertoken TEXT)");
            getToken(function(token){
                var stmt = db.prepare("INSERT INTO userdata VALUES (?, ?, ?)");
                stmt.run(1, serverConf.defaultuser, token);
                stmt.finalize();
                Services.init();
            });
        });
    }else{

        // database exists, let's verify the server config
        db.each("SELECT confid, usedefaultuser, defaultuser FROM serverconfig", function(err, row) {
            if(err){
                write.out('error', err);
            }else{
                // if the server config has changed, let's update it.
                if(serverConf.usedefaultuser != row.usedefaultuser
                    ||
                   serverConf.defaultuser != row.defaultuser){
                    var stmt = db.prepare("UPDATE serverconfig SET usedefaultuser=?, defaultuser=? where confid=1");
                    stmt.run(serverConf.usedefaultuser, serverConf.defaultuser);
                    stmt.finalize();
                }

                if(process.argv.indexOf('renew') >= 0 ){
                    getToken(function(token){
                        var stmt = db.prepare("UPDATE userdata SET usertoken=? where username=?");
                        stmt.run(token, serverConf.defaultuser);
                        stmt.finalize();
                        Services.init();
                    });
                }else{
                    Services.init();
                }
            }
        });
    }
}

/**
 * Returns the current user(from session or from submited login).
 */
var getUser= function(req){
    // if it should use a default user
    // what means, no other users will work on this server
    if(serverConf.usedefaultuser){
        return serverConf.defaultuser;
    }else{
        // needs the req to work
        if(!req || !req.session){
            return false;
        }
        // returns the currently logged user
        return req.session.username;
    }
};

var startWatchingForChanges= function(){
    var eye= require("./ppw/_node-modules/watch.js");
    eye.watch('talks/',
              {
                  ignored: /^\./,
                  persistent: true,
                  ignoreInitial: true,
                  usePolling: true
                  //ignoreInitial: true,
                  //interval: 1000,
                  //binaryInterval: 3000
              });
}

// initializing everything, starting by calling the verifyDB.
verifyDB();