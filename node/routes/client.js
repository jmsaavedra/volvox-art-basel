/***
*  Volvox Controller
*
*
*
*/


/* includes and dependencies */
var path    = require('path');
var fs      = require('fs');
var inspect = require('util').inspect;
var Busboy = require('busboy');

/***
// INIT
// - re-setup the dropbox folder sync. return master JSON object.
//
*/
var init = function( LOCATIONS, dropboxDir, OSC ){

  return function(req, res){
    console.log("/init requested".cyan);
    LOCATIONS.setup(dropboxDir, function(e, locations){
      //console.log("LOCATION INITED: ".green);
      //console.log(JSON.stringify(locations, null, '\t'));
      res.set('Content-Type', 'application/json');
      res.set("locations", locations);
      res.end(JSON.stringify(locations,null,'\t'));
      //res.send(JSON.stringify(locations,null,'\t'));
    });
  }
}



/***
// UPDATE
//

  client_info: {
    sceen_id: (int) id,
  }
  location: {
  		location: (string) “loc”,
  		property: null / (string) “property_id”,
  		image: null / (int) id
  }

*/
var update = function(LOCATIONS, OSC){

  //get screen from req.query
  var screen = 1; // get from busboy Field
  var type = "[location/property/img/like/share]";// get from busboy Field
  var location = "[/DIR/TO/LOC/OR/IMAGE]";// get from busboy Field



  return function(req, res){
    console.log("/update POST received".cyan);
    var allLocs = LOCATIONS.all();

    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);

      OSC.send(screen, type, location, function(addr, type, name){
        console.log(" OSC SENT ".green.inverse +" route: "+ addr + "  msg: ".green+type+" "+name+'\n');
      })


      res.status(200).send("/update OK")
    });
    req.pipe(busboy);

  }
}



/***
// SHARE
//

	properties: [ (string) “property_id”, (string) “property_id2” ]
	first_name: (string) “firstname”,
	last_name: (string) “lastname”,
	email: (string) “email_addr”

*/
var share = function(LOCATIONS, OSC){


  var screen = 1;     // get from busboy Field
  var type = "share"; // share event
  var location = 0;   // no location

  var visitor = {     // placeholder visitor object
    first_name: "first",
    last_name: "last",
    email: "name@addr.com",
    properties: [
      {"PATH/TO/LOC/":"1401 Myrtle ave"},
      {"PATH/TO/LOC/":"71 Ocean Dr"}
    ]
  }

  return function(req, res){
    console.log("/share POST received".cyan);

    var allLocs = LOCATIONS.all();

    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);

      OSC.send(screen, type, location, function(addr, type, name){
        console.log(" OSC SENT ".green.inverse +" route: "+ addr + "  msg: ".green+type+" "+name+'\n');
      })
      res.status(200).send("/share OK")
    });
    req.pipe(busboy);

  }
}

/***
// ABOUT
//
*/
var about = function(LOCATIONS, OSC){



  return function(req, res){
    console.log("/about received".cyan);
    var allLocs = LOCATIONS.all();
    //get screen from req.query
    var screen = 1;
    OSC.send(screen, "about", 1, function(addr, type, name){
      console.log(" OSC SENT ".green.inverse +" route: "+ addr + "  msg: ".green+type+" "+name+'\n');
    })


    res.status(200).send("hit /about")
  }
}

/***
// LIKE
//
*/
var like = function(LOCATIONS, OSC){

  return function(req, res){
    console.log("/like received".cyan);
    var allLocs = LOCATIONS.all();

    //get screen from req.query
    var screen = 1;
    var property = req.params.id;
    console.log("got id: "+ property);

    LOCATIONS.getPropertyById(property, function(e, _property){
      console.log("got property: ".green + JSON.stringify(_property, null, '\t'));

      OSC.send(screen, "/"+_property.parent_id+"/"+_property.count+"/"+"like", property, function(addr, type, name){
        console.log(" OSC SENT ".green.inverse +" route: "+ addr + "  msg: ".green+type+" "+name+'\n');
      })
      res.render('locations/index',
        { title: 'Douglas Elliman Controller',
          slug: 'property',
          property: _property
        }
      );
    });
    //res.status(200).send("hit /like")
  }
}




/***
// MODULE EXPORTS
//
*/
module.exports = {
  init: init,
  update: update,
  share: share,
  like: like,
  about: about
}
