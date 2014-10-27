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
// START - load index page
//
*/
var index = function(LOCATIONS){
  console.log("index received LOCATIONS: ".green);
  console.log(JSON.stringify(LOCATIONS));
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
// MODULE EXPORTS
//
*/
module.exports = {
  index: index

}
