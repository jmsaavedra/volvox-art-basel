/***
// SYNC WITH LOCAL DROPBOX FOLDER
// PULL OUT PATHS
//
*/


var fs 	= require('fs');
var dir = require('node-dir');
var _		= require('underscore');
var path = require('path');
var async = require('async');
// var osc 	= require('osc'); https://www.npmjs.org/package/osc
var OscReceiver = require('osc-receiver');
var OscEmitter = require('osc-emitter');


/***
// SETUP
//
*/
var SEND_ADDR,
		SEND_PORT,
		RECV_PORT;
// var SEND_IP = 'localhost' //production
// // var SEND_IP = '192.168.0.3'; //dev
// var SEND_PORT = 7000;
// var RECV_PORT = 7001;
// var receiver;
// var emitter;



var setup = function(sendAddr, sendPort, recvPort){

	//-- emitter
	emitter = new OscEmitter();
	emitter.add(sendAddr, sendPort); //SEND ON 7000

	//-- receiver
	receiver = new OscReceiver();

	receiver.bind(recvPort);						//RECEIVE ON 7001

	receiver.on('message', function() {
	  // handle all messages
	  var address = arguments[0];
	  var args = Array.prototype.slice.call(arguments, 1);
		console.log("OSC RECEIVED : ".green + address);
		console.log(JSON.stringify(args));
	});

	SEND_ADDR = sendAddr;
	SEND_PORT = sendPort;
	RECV_PORT = recvPort;
	console.log("OSC SEND_ADDR: ".yellow + sendAddr);
	console.log("OSC SEND_PORT: ".yellow + sendPort);
	console.log("OSC RECV_PORT: ".yellow + recvPort);
	console.log(">> OSC Controller setup complete <<".green);
}


/***
// SEND
//
*/
var send = function(screen, type, name, cb){
	console.log("sending OSC to port ".yellow + SEND_PORT)
	// console.log('screen: '+screen);
	// console.log('type: '+type);
	// console.log('name: '+name);
	//*** option 1 ***//
	// var route = '/screen_'+screen.toString();
	// emitter.emit(route, type, name);
	// cb(route, type, name);

	//*** option 2 ***//
	var route = '/screen_'+screen.toString()+'/'+type.toString();
	console.log("route: "+route);
	emitter.emit(route, 1);
	setTimeout( function(){ emitter.emit(route, 0) }, 25);
	cb(route, type, name);
}

/***
// MODULE EXPORTS
//
*/
module.exports = {
	setup: setup,
	send: send
}
