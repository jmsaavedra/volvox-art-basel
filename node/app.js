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


/***
// dropbox directory path!
//
*/

// var DropBoxDirectory = "/Volumes/Dropbox/Dropbox/STRUCTURE/LOCATIONS"; // APON !!
var DropBoxDirectory = "C:/Users/WS_5/Dropbox/STRUCTURE/LOCATIONS"; //VOLVOX!!
// var DropBoxDirectory = "/Users/jmsaavedra/Dropbox\ (Personal)/STRUCTURE/LOCATIONS"; //JOE!!

/***
// custom modules
//
*/
var LOCATIONS = require('./modules/DropboxSync');
LOCATIONS.setup(DropBoxDirectory, function() {});

var OSC = require('./modules/OscController');
OSC.setup();


/***
// express server + socket setup
//
*/
var app = require('express')();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

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


app.get ( '/'         , admin.index( LOCATIONS, OSC ));
app.get ( '/init'     , client.init( LOCATIONS, DropBoxDirectory, OSC ));
app.post( '/update'   , client.update( LOCATIONS, OSC ));
app.post( '/share'    , client.share( LOCATIONS, OSC ));
app.get ( '/about'    , client.about( LOCATIONS, OSC ));

//TODO: this is a hack just for my browser prototype. property id will be passed in via POST.
app.get ( '/like/:id' , client.like( LOCATIONS, OSC));  // :property.id

app.get('/location/:id', admin.location(LOCATIONS, OSC));
app.get('/property/:id', admin.property(LOCATIONS, OSC));
app.get('/property/:id/:imgid', admin.image(LOCATIONS, OSC));


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
