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
var async = require('async');

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

  return function(req, res){
    console.log("/update POST received".cyan);
    var allLocs = LOCATIONS.all();

    var pageId = "pageId";
    var oscRoute = "oscRoute";
    var screenId = "screenId";
    var imgSwipe = null;

    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));

      switch(fieldname){

        case 'page_id':
          pageId = val.toString();
          break;

        case 'screen_id':
          screenId = val.toString();
          break;

        case 'img_direction':
          imgSwipe = val.toString();
          break;

        default:
          // console.log("unrecognized field".red)
          break;
      }
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);
      if(!imgSwipe) {
        processOscRoute(LOCATIONS, pageId, function(route){
          //console.log("created route: ".cyan + route);
          OSC.send(screenId, route, "", function(addr, type, name){
            if (addr != null)
              console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
            //else
              //console.log(" OSC NOT SENT SENT ".red.inverse +" route: "+ addr);
          })
          res.status(200).send("/update OK")
        });
      } else {
        OSC.send(screenId, imgSwipe, "", function(addr, type, name){
          if (addr != null)
            console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
        })
        res.status(200).send("/update OK")
      }
    });
    req.pipe(busboy);

  }
}

var processOscRoute = function(LOCATIONS, page, cb){
  var finishedRoute = "";

  //console.log("index: "+page.indexOf(" "));

  if (page === 'allLocation'){ //   /home
    console.log("got home: ".cyan+page);
    finishedRoute = 'home';
    cb(finishedRoute);
  } else if ( page.indexOf("loc") == 0 ) { // /locId
    console.log("got a location: ".cyan+page);
    finishedRoute = page;
    cb(finishedRoute);
  } else if ( page.indexOf("pro") == 0) { // /locId/propId
    // console.log("got a property: ".cyan+page);
    LOCATIONS.getPropertyById(page, function(e, property){
      if(!e){
        console.log("found property: ".cyan + property.id);
        finishedRoute = property.parent_id+"/"+property.count;
        cb(finishedRoute);
      } else {
        console.log("ERROR when looking up property: ".red + e);
        cb(finishedRoute);
      }
    });
  }
  else { //we're an image most likely //  /left or /right
    console.log("got image: ".cyan+page);
    finishedRoute = "/left/right";
    cb(finishedRoute);
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

  // var screen = 1;     // get from busboy Field
  // var type = "share"; // share event
  // var location = 0;   // no location
  return function(req, res){
    console.log("/share POST received".cyan);
    var allLocs = LOCATIONS.all();
    var currTime = new Date();
    var formattedTime = currTime.getDate() + currTime.getMonth() + currTime.getYear() + " - "+ currTime.getHours()+":"+currTime.getMinutes();
    var favoritedProperties = [];
    var screenId = 1;
    var visitor = {     // placeholder visitor object
      first_name: "first",
      last_name: "last",
      email: "name@addr.com",
      time: currTime.toString("hh:mm tt"),
      properties: []
    }

    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      switch(fieldname){

        case 'firstName':
          visitor.first_name = val.toString();
          break;

        case 'lastName':
          visitor.last_name = val.toString();
          break;

        case 'email':
          visitor.email = val.toString();
          break;

        case 'screen_id':
          screenId = val.toString();
          break;

        case 'favorites[]':
          favoritedProperties.push(val.toString());
          break;

        default:

          break;
      }
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);
      async.eachSeries(favoritedProperties, function(prop, callback){

          LOCATIONS.getPropertyById(prop, function(e, fullProp){
            visitor.properties.push(fullProp.name);
            callback();
          })
      }, function(_err){ //finished with all properties
        if(!_err){

          fs.appendFile(LOCATIONS.getVisitorLog(), ","+ JSON.stringify(visitor, null, '\t'), function (err) {
            if(err) console.log("error saving to visitor log: ".red + err);
            else {
              console.log(" visitor saved: ".green.inverse + JSON.stringify(visitor, null, '\t')+'\n');
              route = "share";
              OSC.send(screenId, route, "", function(addr, type, name){
                if (addr != null)
                  console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
                //else
                  //console.log(" OSC NOT SENT SENT ".red.inverse +" route: "+ addr);
              })
              res.status(200).send("/share OK")
            }
          });
        }
        else console.log("error iterating properties: ".red+_err);
      })

      // OSC.send(screen, type, location, function(addr, type, name){
      //   if (addr != null)
      //     console.log(" OSC SENT ".green.inverse +" route: "+ addr + "  msg: ".green+type+" "+name+'\n');
      // })


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

    var screenId;
    console.log("/about received".cyan);
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));

      switch(fieldname){

        case 'screen_id':
          screenId = val.toString();
          break;

        default:
          // console.log("unrecognized field".red)
          break;
      }
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);

      OSC.send(screenId, "about", "", function(addr, type, name){
        if (addr != null)
          console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
        //else
          //console.log(" OSC NOT SENT SENT ".red.inverse +" route: "+ addr);
      })
      res.status(200).send("/update OK")

    });
    req.pipe(busboy);
  }
}

/***
// FAVORITE
//
*/
var favorite = function(LOCATIONS, OSC){

  return function(req, res){
    console.log("/favorite POST received".cyan);
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));

      switch(fieldname){

        case 'page_id':
          pageId = val.toString();
          break;

        case 'screen_id':
          screenId = val.toString();
          break;

        case 'img_direction':
          imgSwipe = val.toString();
          break;

        default:
          // console.log("unrecognized field".red)
          break;
      }
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!'.green);
      if(!imgSwipe) {
        processOscRoute(LOCATIONS, pageId, function(route){
          //console.log("created route: ".cyan + route);
          //route += "/like";
          route = "like";
          OSC.send(screenId, route, "", function(addr, type, name){
            if (addr != null)
              console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
            //else
              //console.log(" OSC NOT SENT SENT ".red.inverse +" route: "+ addr);
          })
          res.status(200).send("/update OK")
        });
      } else {
        OSC.send(screenId, imgSwipe, "", function(addr, type, name){
          if (addr != null)
            console.log(" OSC SENT ".green.inverse +" route: "+ addr+"\n");
        })
        res.status(200).send("/update OK")
      }
    });
    req.pipe(busboy);

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
  favorite: favorite,
  about: about
}
