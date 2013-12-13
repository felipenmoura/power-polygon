/*============================================================================*/
// Power Polygon module: Phantom Instances Manager
// This manager takes care of a number of instances of phantomJS.
// Also, it manages the requisitions queue for the given instances.
/*============================================================================*/

var utils= global.utils,
    write= utils.require('write');

var numberOfInstances= 1;
var incrementable= false;
var incrementLimit= 10;
var _error= [];
var _instances= [];
var _phantom= require('node-phantom');
var _waitingList= [];

function PHInstance(ph){

	this.idle= false;
	this.t= (new Date()).getTime();
	this.ph= ph;

	this.setIdle= function(idle){
		this.idle= idle;
		this.t= (new Date()).getTime();
	};

	return this;
};

// adds a method to a waiting list
var _addToWaitingList= function(fn){
	if(utils.isFn(fn))
		_waitingList.push(fn);
};

// is waiting for a free instance of phantom
var _waitingForIdleInstance= function(){
	var inst= _getFreeInstance(false);
	var item= null;
	if(inst){
		item= _waitingList.shift();
		if(utils.isFn(item))
			item(inst);
	}
};

// creates a given number of instances of phantomjs
var _createInstances= function(l, fn, step){
	l--;
	if(l<0) l== 0;
	_phantom.create(function(err, ph){
		if(err || !ph || !ph.createPage){
			_triggerErrors(err, 'Could not initialize Phantomjs!');
			return false;
		}
		_instances.push(new PHInstance(ph));

		if(numberOfInstances > 1 && typeof step == 'function'){
			step(_instances.length, numberOfInstances);
		}

		if(l){
			if(_instances.length <= incrementLimit){
				_createInstances(l, fn, step);
			}else{
				// if there is no free instance and cannot create any extra one
				_addToWaitingList(fn);
			}
		}else{
			if(typeof fn == 'function'){
				fn(true, _instances.length, _instances[_instances.length-1]);
			}
		}
	});
};

// in case of errors in any instance, this method is triggered.
var _triggerErrors= function(err, extra){
	var l= _error.length;
	for(i=0; i<l; i++){
		try{
			_error[i](err, extra);
		}catch(e){
			console.error('Failed executing callback for errors on phantomjs manager!', e, err);
		}
	}
};

// gets the next free instance, seting it as idle
// in case there isn't any, if increment is allowed
// it creates a new instance, otherwise, adds the
// given function to the waiting list.
var _getFreeInstance= function(fn){
	var l= _instances.length;
	for(i=0; i<l; i++){
		ph= _instances[i];
		if(ph.idle){
			ph.idle= false;
			if(typeof fn == 'function')
				fn(ph);
			return ph;
		}
	}

	if(utils.isFn(fn)){
		_createInstances(1, function(status, len, instance){
			instance.idle= false;
			fn(instance);
		});
	}else{
		return false;
	}
}

module.exports= {

	load: function(url, fn){
		var inst= _getFreeInstance(function(instance){

		});
	},
	getInstances: function(){
		return _instances;
	},
	error: function(fn){
		if(typeof fn == 'function'){
			_error.push(fn);
		}
	},
	killInstances: function(fn){

		var l= _instances.length, ph= null;
		for(i=0; i<l; i++){
			try{
				ph= _instances[i].ph;
				ph.exit();
				ph._phantom.kill('SIGTERM');
			}catch(e){
				console.error('Failed killing instances of phantomjs!', e);
			}
		}

		if(typeof fn == 'function'){
			fn();
		}
	},
	setUp: function(len, inc, incLim){
		numberOfInstances= (len && !isNaN(len))?
								len:
								numberOfInstances;
		incrementable= inc? true: false;
		incrementLimit= (incLim && !isNaN(incLim))?
								incLim:
								incrementLimit;
		return this;
	},
	init: function(fn, step){

		var status= true;

		if(!_phantom.create){
			_triggerErrors('Not PhantomJS found!');
			return false;
		}


		var options = {
			encoding: 'utf8',
			timeout: 7000,
			maxBuffer: 200*1024,
			killSignal: 'SIGTERM',
			cwd: null,
			env: null
		}

		//child_process.exec('phantomjs rasterize.js www.google.com 1.png', options, fn);
		_createInstances(numberOfInstances, fn, step);
		setInterval(_waitingForIdleInstance, 1000);

		return this;
	}
};