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
var OSC     = require('../modules/OscController')





/***
// INDEX
//
// - what is served at the GET '/' route
*/
var index = function(LOCATIONS){

  return function(req, res){

    var allLocs = LOCATIONS.all();

    console.log('GET index '.blue); //JSON.stringify(allLocs));

    OSC.send(1, "home", 0, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })


    res.render('locations/index',
      { title: 'Douglas Elliman Controller',
        slug: 'index',
        locations: allLocs
      }
    );
  }
}



/***
// LOCATION
//
// - GET /location/:id
*/
var location = function(LOCATIONS){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();
    var locId = parseInt(id.split("_")[1]);

    console.log('GET loc: '.blue+id +" : "+ JSON.stringify(allLocs[locId].name));

    var location = allLocs[locId].folder.toString();
    OSC.send(1, "location", location, function(addr, type, name){
      console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
    })


    res.render('locations/index',
      { title: 'Douglas Elliman Controller',
        slug: 'location',
        location: allLocs[locId]
      }
    );
  }
}

/***
// PROPERTY
//
// - GET /location/:id
*/
var property = function(LOCATIONS){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();

    LOCATIONS.getPropertyById(id, function(e, property){

      console.log('GET property: '.blue+id +" : "+ JSON.stringify(property.name));

      // screen, type, name, cb
      var location = property.parent_name.toString() + "/" + property.folder.toString();
      OSC.send(1, "property", location, function(addr, type, name){
        console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
      })


      res.render('locations/index',
        { title: 'Douglas Elliman Controller',
          slug: 'property',
          property: property
        }
      );

    });
    //var locId = parseInt(id.split("_")[1]);
  }
}



/***
// IMAGE
//
// - GET /location/:id
*/
var image = function(LOCATIONS){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();
    var imgid = req.params.imgid.toString();

    console.log('GET img: '.blue+imgid);

    LOCATIONS.getPropertyById(id, function(e, property){
      var thisImg = new Object(_.where(property.img, {id: imgid})[0]);
      console.log("thisImg: "+JSON.stringify(thisImg));
            //(screen, type, name, cb)
      OSC.send(1, "image", thisImg.url.toString(),function(addr, type, name){
        console.log("OSC SENT TO: ".green.inverse + addr + "  msg: ".green+type+" "+name);
      })

      res.render('locations/index',
        { title: 'Douglas Elliman Controller',
          slug: 'property',
          property: property
        }
      );

    });
    //var locId = parseInt(id.split("_")[1]);
  }
}

/***
// MODULE EXPORTS
//
*/
module.exports = {
  index: index,
  location: location,
  property: property,
  image: image

}
