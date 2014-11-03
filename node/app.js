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
var io = require('socket.io')(http);
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
var controller = require('./routes/controller');
var property = require('./routes/single-property');


/***
// HTTP routes
//
*/

app.get ( '/' , admin.index( LOCATIONS.all()) );
app.get ( '/init', admin.init(DropBoxDirectory));
// app.get ( '/location/:name', locations.index(LOCATIONS.all));
app.post( '/update', controller.update());
app.post( '/share', admin.share());


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
