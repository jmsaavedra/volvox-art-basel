/***
*  Volvox Controller
*
*
*
*/


/* includes and dependencies */
var path    = require('path');
var fs      = require('fs');
var _       = require('underscore');


/***
// INIT
// - re-setup the dropbox folder sync. return master JSON object.
//
*/
var init = function(dropboxDir, LOCATIONS){

  return function(req, res){
    console.log("/init requested".cyan);
    LOCATIONS.setup(dropboxDir, function(e, locations){
      //console.log("LOCATION INITED: ".green);
      //console.log(JSON.stringify(locations, null, '\t'));
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify(locations,null,'\t'));
      //res.send(JSON.stringify(locations,null,'\t'));
    });
  }
}


/***
// SHARE
//
// - what'll happen after POST to '/share'
*/
var share = function(){

  return function(req, res){
    res.status(200).send("hit share route");
  }
}


/***
// INDEX
//
// - what is served at the GET '/' route
*/
var index = function(LOCATIONS){

  var allLocs = LOCATIONS.all();
  return function(req, res){

    res.render('locations/index',
      { title: 'Douglas Elliman Controller',
        slug: 'index',
        locations: allLocs
      }
    );
  }
}



/***
// INDEX
//
// - what is served at the GET '/' route
*/
var location = function(LOCATIONS){

  var allLocs = LOCATIONS.all();
  return function(req, res){
    var locId = req.params.id;
    console.log(allLocs[locId]);
    console.log('get loc: '+locId);
    res.render('locations/index',
      { title: 'Douglas Elliman Controller',
        slug: 'location',
        locations: allLocs[locId]
      }
    );
  }
}


/***
// MODULE EXPORTS
//
*/
module.exports = {
  init: init,
  share: share,
  index: index,
  location: location

}
