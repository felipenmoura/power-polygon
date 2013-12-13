/*============================================================================*/
// Power Polygon Service: utils
// This module offers a bunch of useful tools and features to be accessed
// globally by other modules.
/*============================================================================*/

var path= require('path'),
    root= path.resolve('./')+'/',
    fs= require('fs');

global.path= path;
global.root= root;

module.exports = {
	require: function(what){
        var ar= Array.prototype.slice.call(arguments, 1);
        //ar.unshift(root+'ppw/_node-modules/'+what+'.js');

        var ret= require(root+'ppw/_node-modules/'+what+'.js');
		//var ret= require(root+'ppw/_node-modules/'+what+'.js');
		if(typeof ret == 'function' && ar.length > 0){
			return ret.apply(this, ar);
		}
		return ret;
	},

	listDir: function(path){
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
    },

	deliver: function(url, req, res, apply){

        url= url.replace(/(\/\..*)|(\?.*)|(\#.*)/ig, '');

        if(url[url.length-1] == '/')
            url+= 'index.html';

        fs.readFile(root+url, function(err, data){

            if (err) {
                res.writeHead(500);
                return res.end('[PPS] Error loading file: ' + root + url);
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
                data= '{ "error": "Empty file!" }';

            if(typeof apply == 'function')
                data= apply(data);

            res.end(data);

        });
    },
    isFn: function(fn){
        return typeof fn == 'function'? true: false;
    },
    isLogged: function(){
    	return true;
    }
};




