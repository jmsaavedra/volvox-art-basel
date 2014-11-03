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
var colors    = require('colors');
var express   = require('express');


/***
// dropbox directory path!
//
*/
var DropBoxDirectory = "/Users/jmsaavedra/Dropbox\ (Personal)/STRUCTURE/LOCATIONS";

/***
// custom modules
//
*/
var LOCATIONS = require('./modules/DropboxSync');
LOCATIONS.setup(DropBoxDirectory, function(){});

var OSC = require('./modules/OscController');
OSC.setup();


/***
// express server + socket setup
//
*/
var app = require('express')();
app.use('/', express.static(DropBoxDirectory));
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'jade');



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

app.get ( '/'         , admin.index( LOCATIONS, OSC ));
app.get ( '/init'     , client.init( LOCATIONS, DropBoxDirectory, OSC ));
app.post( '/update'   , client.update( LOCATIONS, OSC ));
app.post( '/share'    , client.share( LOCATIONS, OSC ));
app.get ( '/about'    , client.about( LOCATIONS, OSC ));
app.get ( '/like/:id' , client.like( LOCATIONS, OSC));


app.get ( '/location/:id', admin.location( LOCATIONS, OSC ));
app.get ( '/property/:id', admin.property( LOCATIONS, OSC ));
app.get ( '/property/:id/:imgid', admin.image( LOCATIONS, OSC ));


/***
// go go go
//
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log();
  console.log('  Volvox Client Server Running  '.white.inverse);
  var listeningString = '    Listening on port '+ app.get('port') +"      ";
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
