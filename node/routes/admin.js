/***
*  Volvox Controller
*
*
*
*/


/* includes and dependencies */
var path    = require('path');
var fs      = require('fs');

var dropbox = require('../modules/DropboxSync');

/***
// INIT
// - re-setup the dropbox folder sync. return master JSON object.
//
*/
var init = function(dropboxDir){

  return function(req, res){
    dropbox.setup(dropboxDir, function(e, locations){
      console.log("LOCATION INITED: ".green);
      console.log(JSON.stringify(locations, null, '\t'));
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify(locations,null,'\t'));
      //res.send(JSON.stringify(locations,null,'\t'));
    });
  }
}


/***
// INDEX
//
// - what is served at the GET '/' route
*/
var index = function(LOCATIONS){

  return function(req, res){

    res.render('locations/index',
      { title: 'Douglas Elliman Controller',
        slug: 'index',
        locations: LOCATIONS
      }
    );
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
// MODULE EXPORTS
//
*/
module.exports = {
  init: init,
  index: index,
  share: share

}
