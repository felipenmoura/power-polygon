/*============================================================================*/
// Power Polygon Service: sockets
// This module starts and manages the web socket features and functionalities
/*============================================================================*/

var utils= global.utils,
    write= utils.require('write');

var socketEvents= function(socket){
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

module.exports= {
	start: function(app){
		write.startingSockets();

		var io= require('socket.io').listen(app, {log: false});
		io.sockets.on('connection', socketEvents);
		write.out('info', 'websockets service started');
	},
	stop: function(){}
};