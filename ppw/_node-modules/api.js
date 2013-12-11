var apiMethods= {
	list: {
		desc: 'Returns the list of available methods',
		exec: function(){ return apiMethods; }
	},
	getDemos: {
		desc: 'Returns the list of demos',
		exec: function(){
			return {a:'aaa'};
		}
	},
	getMyTalks: {
		desc: "Returns the list of talks from the currently logged user",
		exec: function(){
			return {};
		}
	},
	getTalkInfo: {
		desc: "",
		exec: function(){
			return {};
		}
	},
	search: {
		desc: "Searches through public talks, or talks of the currently logged user",
		exec: function(){
			return {};
		}
	},
	drawLoginButtons: {
		desc: 'Returns the HTML structure for the login buttons',
		exec: function(){
			return "<strong>LOGIN BUTTONS HERE</strong>";
		}
	}/*,
	getTalkInfo: {
		desc: "",
		exec: function(){
			return {};
		}
	}*/
}

module.exports= (function(){

	var o = {};

	for(i in apiMethods){
		o[i]= apiMethods[i].exec;
	}

	return o;
})();