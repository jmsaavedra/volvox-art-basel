/***
// SYNC WITH LOCAL DROPBOX FOLDER
// PULL OUT PATHS
//
*/


var fs 	= require('fs');
var dir = require('node-dir');
var _		= require('underscore');
var async = require('async');
var slug = require('slug');

var Locations = [];
var Properties = [];


/***
// setup
//
*/
var setup = function(dropboxDirectory, cb){
	//TODO: query dropbox folder with fs, populate with that
	Locations = [];
	var propId = 0;
	var locId = 0;
	var imgId = 0;

	//get all locations from dropbox top level
	var locs = _.sortBy(_.without(fs.readdirSync(dropboxDirectory), ".DS_Store"), function(name){return name});

	async.eachSeries(locs, function(loc, callback){
		var thisLoc = {};
		var thisLocProps = []
		thisLoc.name = loc.toLowerCase().capitalize();
		thisLoc.folder = loc;
		// thisLoc.slug = slug(thisLoc.name.toLowerCase());
		thisLoc.id = "loc_"+locId.toString();
		locId++;

		//get properties for this loc
		var theseProps = _.sortBy(_.without(fs.readdirSync(dropboxDirectory+"/"+loc), ".DS_Store"), function(name){return name});

		async.eachSeries(theseProps, function(prop, _callback){
			var thisProp = {};
			thisProp.dir = dropboxDirectory+"/"+loc+"/"+prop;
			thisProp.name = prop.toLowerCase().capitalize();
			thisProp.folder = prop;
			// thisProp.slug = slug(thisProp.name.toLowerCase());
			thisProp.parent_id = "loc_"+(locId-1);
			thisProp.parent_name = loc;
			thisProp.id = "prop_"+propId.toString();
			var imgs = _.without(fs.readdirSync(thisProp.dir), "info.txt");
			imgs.forEach(function(img, i){
				imgs[i] = {id: "img_"+imgId.toString(), url: "/"+loc+"/"+prop+"/"+imgs[i]};
				imgId++;
			})
			thisProp.img = imgs;
			//thisProp.img = _.without(fs.readdirSync(thisProp.dir+"/"+thisProp.name), "info.txt");
			thisProp.info = fs.readFileSync(thisProp.dir+"/info.txt").toString();
			propId ++;
			thisLocProps.push(thisProp);
			Properties.push(thisProp);
			_callback();
		}, function(_err){ //finished with all properties
			if(!_err) thisLoc.properties = thisLocProps;
			else console.log("error iterating properties: ".red+_err);
		})

		Locations.push(thisLoc)
		callback();

	}, function(err){
		if(!err){
			console.log("\n>> DropboxSync setup() complete <<".green);
			cb(null, Locations);
		}
		else{
			console.log("error iterating locations: ".red+err);
			cb(err, null);
		}
	});

}


/***
// return all locations
//
*/
var all = function(){
	return Locations
}


var getPropertyById = function(id, cb){
	var property = null;
	async.eachSeries(Properties, function(prop, _callback){
		if (prop.id === id) property = prop;
		_callback();
	}, function(err){
		if(!err){
			//console.log("found property: ".white.inverse+property);
			if(property!=null) cb(null, property)
			else cb(null, null);
		}
		else cb(err, null);
	});
}

String.prototype.capitalize = function() {
    // return this.charAt(0).toUpperCase() + this.slice(1);
		return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

/***
// MODULE EXPORTS
//
*/
module.exports = {
	all: all,
	setup: setup,
	getPropertyById: getPropertyById
}
