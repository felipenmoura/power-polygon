
var path= require('path'),
    root= path.resolve('./')+'/',
    fs= require('fs');

global.path= path;
global.root= root;

module.exports = {
	require: function(what, data){
		var ret= require(root+'ppw/_node-modules/'+what+'.js');
		if(typeof ret == 'function' && data){
			return ret(data);
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

	deliver: function(url, req, res){

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
                data= "// Empty file!";

            res.end(data);

        });
    },
    isLogged: function(){
    	return true;
    }
};




