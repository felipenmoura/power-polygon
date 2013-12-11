/*============================================================================*/
// Power Polygon Service: routes
// This module manages the routes power polygon services are goint to use
/*============================================================================*/


module.exports = function(app, passport){

    var utils= global.utils,
        deliver= utils.deliver,
        viewsDir= 'ppw/_views/';

    app.get('/', function(req, res){
        url= viewsDir+'index.html';
        api= utils.require('api');
        deliver(url, req, res, function(str){
            str= str.toString().replace('<!--#include loggin -->', api.drawLoginButtons());
            return str;
        });
    });

    app.get('/run.js', function(req, res){
        url= viewsDir+'';
        deliver(url, req, res);
    });

    // API - get
    app.get('/api', function(req, res){
        var url= viewsDir+'api-help.html';
        api= utils.require('api');

        data= api.list();

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        //res.writeHead(200);
        res.end(JSON.stringify(data));
    });

    app.get('/api/:command', function(req, res){

        var api= utils.require('api'),
            list = api.list(),
            command= req.params.command,
            data= false;

        if(command in list){
            data= api[command](req.params);
        }else{
            data= {error: 'command '+command+ ' does not exist in the API'};
        }

        /*var data= {
                demos: [],
                talks: [],
                errors: [],
                auth: utils.isLogged(req)
            },
            api= utils.require('api');

        switch(req.params.command){
            case "verifylogin":{
                    // will just return the data object as it is
                break;
            }
            case "getTalksList":{
                    //data.talks= _buildTalksData(Services.listDir('./talks/'));
                break;
            }
            case "getDemosList":{
                    //data.demos= _buildTalksData(Services.listDir('./_demos/'));
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
        }*/
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

        if(!utils.isLogged(req, res)){
            return false;
        }
    });

    // filtering only authenticated users
    app.get(/^\/ppw\/_tools\/remote\/(basic|full)\/.*/, function(req, res){
        if(utils.isLogged(req, res))
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



        /*app.post("/login"
                ,passport.authenticate('local',{
                        successRedirect : "/",
                        failureRedirect : "/login",
                })
        );*/
}









