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
var http      = require('http');
var express   = require('express');
var path      = require('path');
var fs        = require('fs');
var less      = require('less-middleware');
var colors    = require('colors');
var busboy    = require('busboy');
var cookieParser = require('cookie-parser'); //https://www.npmjs.org/package/cookie-parser
// var expressSession = require('express-session'); //for cookies
// var cookie    = require('cookie') //https://www.npmjs.org/package/cookie
// var bodyParser = require('body-parser');
// var sessions = require("client-sessions"); //https://github.com/mozilla/node-client-sessions



/***
// custom modules
//
*/
var Folders   = require('./modules/FolderSync');
Folders.setup(__dirname);






/***
// express server setup
//
*/
var app = express();
var port = 55555;
app.set('port', process.env.PORT || port);
app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// app.use(expressSession({secret:'somesecrettokenhere'}));
// app.use(bodyParser());



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


//
//
//
//
// /***
// // LOCALS - global object
// //
// */
// var PROTOTYPE_VERSION = '1A'
// app.locals._ = require('underscore');
// app.locals.version = PROTOTYPE_VERSION;
//
//
//
// /***
// // site routes
// //
// */
// var capture = require('./routes/capture');
//
//
//
// /***
// // HTTP routes
// //
// */
// app.get ( '/capture/:id/:user_number' , capture.momentAndUser(Database) );
// app.get ( '/capture/:id' , capture.moment(Database) );
// app.post( '/upload'      , capture.upload(Database) );
// app.get ( '/thanks'      , capture.thanks(Database) );
