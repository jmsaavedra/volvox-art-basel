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
// INIT - load index page
//
*/
var update = function(dropboxDir){

  return function(req, res){
    dropbox.setup(dropboxDir, function(e, locations){
      console.log("LOCATION INITED: ".green);
      console.log(JSON.stringify(locations, null, '\t'));
      res.render('locations/index',
        { title: 'Douglas Elliman Controller',
          slug: 'index',
          locations: locations
        }
      );
    });
  }
}



/***
// MODULE EXPORTS
//
*/
module.exports = {
  update: update
}
