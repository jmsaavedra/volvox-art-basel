/***
 *  Volvox Controller
 *
 *  express node app, running forever.
 *
 */

/***
// module dependencies
//
*/
var http = require('http');
var colors = require('colors');
var express = require('express');

console.log("\n******  INIT VOLVOX SERVER  *****".zebra);
/***
// dropbox directory path!
//
*/
 var DropBoxDirectory = "C:/Users/WS_5/Dropbox/STRUCTURE/LOCATIONS"; //VOLVOX!!
//var DropBoxDirectory = "/Users/jmsaavedra/Dropbox\ (Personal)/STRUCTURE/LOCATIONS"; //JOE!!
//var DropBoxDirectory = "/Volumes/Dropbox/Dropbox/STRUCTURE/LOCATIONS"; // APON !!


/***
// custom modules
//
*/
var LOCATIONS = require('./modules/DropboxSync');
LOCATIONS.setup(DropBoxDirectory, function() {});

var OSC_ADDR = "localhost";
var OSC_SEND_PORT = 7000;
var OSC_RECV_PORT = 7001;
var OSC = require('./modules/OscController');
OSC.setup(OSC_ADDR, OSC_SEND_PORT, OSC_RECV_PORT);


/***
// express server + socket setup
//
*/
var app = require('express')();
app.use('/', express.static(DropBoxDirectory));
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'jade');
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});


/***
// app routes
//
*/
var admin = require('./routes/admin');
var client = require('./routes/client');



/***
// HTTP routes
//
*/

//client ( iOS ) routes
app.get ( '/init'     , client.init( LOCATIONS, DropBoxDirectory, OSC ));
app.post( '/update'   , client.update( LOCATIONS, OSC ));
app.post( '/favorite' , client.favorite( LOCATIONS, OSC ));
app.post( '/share'    , client.share( LOCATIONS, OSC ));
app.post( '/about'    , client.about( LOCATIONS, OSC ));

//admin (BROWSER) routes
app.get ( '/'         , admin.index( LOCATIONS, OSC ));
app.get ( '/like/:id' , admin.like( LOCATIONS, OSC));  // :property.id
app.get ( '/about'    , client.about( LOCATIONS, OSC ));
app.get ( '/location/:id', admin.location(LOCATIONS, OSC));
app.get ( '/property/:id', admin.property(LOCATIONS, OSC));
app.get ( '/property/:id/:imgid', admin.image(LOCATIONS, OSC));


/***
// go go go
//
*/

http.createServer(app).listen(app.get('port'), function(){
  console.log();
  console.log('\n  Volvox Client Server Running  '.white.inverse);
  var listeningString = '    Listening on port '+ app.get('port') +"      \n\n";
  console.log(listeningString.cyan.inverse);
});




// /***
// // LOCALS - global object
// //
// */
// var PROTOTYPE_VERSION = '1A'
// app.locals._ = require('underscore');
// app.locals.version = PROTOTYPE_VERSION;
//
//
