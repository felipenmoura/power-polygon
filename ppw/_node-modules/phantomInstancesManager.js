/*============================================================================*/
// Power Polygon module: Phantom Instances Manager
// This manager takes care of a number of instances of phantomJS.
// Also, it manages the requisitions queue for the given instances.
/*============================================================================*/

var utils= global.utils,
    write= utils.require('write');

var numberOfInstances= 1;
var incrementable= false;
var _error= [];
var _instances= [];
var _phantom= require('node-phantom');

var _freeInstance= function(){

};

var _createInstances= function(l, fn){
	l--;
	if(l<0) l== 0;
	_phantom.create(function(err, ph){
		if(err || !ph || !ph.createPage){
			_triggerErrors(err, 'Could not initialize Phantomjs!');
			return false;
		}
		_instances.push({
			ph: ph,
			status: 'idle'
		});
		if(l){
			_createInstances(l, fn);
		}else{
			if(typeof fn == 'function')
				fn(true, _instances.length);
		}
	});
};

var _triggerErrors= function(err, extra){
	var l= _error.length;
	for(i=0; i<l; i++){
		try{
			error(err, extra);
		}catch(e){
			console.error('Failed executing callback for errors on phantomjs manager!', e, err);
		}
	}
};

module.exports= {

	add: function(url, fn){

	},
	getInstances: function(){
		return _instances;
	},
	error: function(fn){
		if(typeof fn == 'function'){
			_error.push(fn);
		}
	},
	setUp: function(len, inc){
		numberOfInstances= (len && !isNaN(len))?
								len:
								numberOfInstances;
		incrementable= inc? true: false;
		return this;
	},
	init: function(fn){

		var status= true;

		if(!_phantom.create){
			_triggerErrors('Not PhantomJS found!');
			return false;
		}
		_createInstances(numberOfInstances, fn);

		return this;
	}
};