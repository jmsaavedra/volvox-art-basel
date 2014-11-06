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
// INDEX
//
// - what is served at the GET '/' route
*/
var index = function(LOCATIONS, OSC){

  return function(req, res){

    var allLocs = LOCATIONS.all();

    console.log('GET index '.blue); //JSON.stringify(allLocs));
    //screen, type, msg, cb
    OSC.send(1, "home", 1, function(addr, type, name){
      console.log(" OSC SENT ".green.inverse +" route: ".green+ addr + "  msg: ".green+type+" "+name);
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
var location = function(LOCATIONS, OSC){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();
    var locId = parseInt(id.split("loc")[1]);

    console.log('GET loc: '.blue+id +" : "+ JSON.stringify(allLocs[locId].name));

    var location = allLocs[locId].folder.toString();
    OSC.send(1, id, "", function(addr, type, name){
      console.log(" OSC SENT ".green.inverse +" route: ".green+ addr + "  msg: ".green+type+" "+name);
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
var property = function(LOCATIONS, OSC){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();

    LOCATIONS.getPropertyById(id, function(e, property){

      console.log('GET property: '.blue+id +" : "+ JSON.stringify(property,null,'\t'));

      // screen, type, name, cb
      var location = property.parent_name.toString() + "/" + property.folder.toString();
      OSC.send(1, property.parent_id+"/"+property.count, "", function(addr, type, name){
        console.log(" OSC SENT ".green.inverse +" route: ".green+ addr + "  msg: ".green+type+" "+name);
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
var image = function(LOCATIONS, OSC){

  return function(req, res){

    var allLocs = LOCATIONS.all();
    var id = req.params.id.toString();
    console.log("looking for property id: ".red+id);
    var imgid = req.params.imgid.toString();

    console.log('GET img: '.blue+imgid);

    if(imgid != "left" && imgid != "right"){
      LOCATIONS.getPropertyById(id, function(e, property){
        var thisImg = new Object(_.where(property.img, {id: imgid})[0]);
        console.log("thisImg: "+JSON.stringify(thisImg));
              //(screen, type, name, cb)
        OSC.send(1, property.parent_id+"/"+property.count+"/"+imgid,function(addr, type, name){
          console.log(" OSC SENT ".green.inverse +" route: ".green+ addr + "  msg: ".green+type+" "+name);
        })

        res.render('locations/index',
          { title: 'Douglas Elliman Controller',
            slug: 'property',
            property: property
          }
        );
      });
    }else { //we hit left or right
      LOCATIONS.getPropertyById(id, function(e, property){
        //console.log("got property: ".green + JSON.stringify(property, null, '\t'));
        OSC.send(1, "/"+imgid, "",function(addr, type, name){
          console.log(" OSC SENT ".green.inverse +" route: ".green+ addr + "  msg: ".green+type+" "+name);
        });
        res.render('locations/index',
          { title: 'Douglas Elliman Controller',
            slug: 'property',
            property: property
          }
        );
      });
    }
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
