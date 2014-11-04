/***
*  Volvox Controller
*
*
*
*/


/* includes and dependencies */
var path    = require('path');
var fs      = require('fs');

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

  var allLocs = LOCATIONS.all();

  return function(req, res){

    //get screen from req.query
    var screen = 1;
    var type = "[location/property/img/like/share]";// get from req.query
    var location = "[/DIR/TO/LOC/OR/IMAGE]";// get from req.query
    OSC.send(screen, type, location, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })


    res.status(200).send("hit /update POST route")
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

  var allLocs = LOCATIONS.all();
  return function(req, res){
    //get screen from req.query
    var screen = 1;
    OSC.send(screen, "share", 0, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })

    res.status(200).send("hit /share POST route")
  }
}

/***
// ABOUT
//
*/
var about = function(LOCATIONS, OSC){

  var allLocs = LOCATIONS.all();

  return function(req, res){

    //get screen from req.query
    var screen = 1;
    OSC.send(screen, "about", 0, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })


    res.status(200).send("hit /about")
  }
}

/***
// LIKE
//
*/
var like = function(LOCATIONS, OSC){

  var allLocs = LOCATIONS.all();

  return function(req, res){

    //get screen from req.query
    var screen = 1;
    var property = req.params.id;
    OSC.send(screen, "like", property, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })


    res.status(200).send("hit /like")
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
