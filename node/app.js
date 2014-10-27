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


/***
// dropbox directory path!
//
*/
var DropBoxDirectory = "/Users/jmsaavedra/Dropbox\ (Personal)/STRUCTURE";

/***
// custom modules
//
*/
var LOCATIONS = require('./modules/DropboxSync');
LOCATIONS.setup(DropBoxDirectory);


/***
// express server + socket setup
//
*/
var app = require('express')();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');



/***
// app routes
//
*/
var locations = require('./routes/locations');
var property = require('./routes/single-property');


/***
// HTTP routes
//
*/

app.get ( '/' , locations.index(LOCATIONS.all()) );
// app.get ( '/location/:name', locations.index(LOCATIONS.all));



/***
// go go go
//
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log();
  console.log('  Volvox Client Server Running     '.white.inverse);
  var listeningString = '  Listening on port '+ app.get('port') +"    ";
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
