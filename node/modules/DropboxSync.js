/***
// SYNC WITH LOCAL DROPBOX FOLDER
// PULL OUT PATHS
//
*/


var fs 	= require('fs');
var dir = require('node-dir');
var _		= require('underscore');
var path = require('path');
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
	var propId = 0;
	var locId = 0;

	//get all locations from dropbox top level
	var locs = _.sortBy(_.without(fs.readdirSync(dropboxDirectory), ".DS_Store"), function(name){return name});

	async.eachSeries(locs, function(loc, callback){
		var thisLoc = {};
		var thisLocProps = []
		thisLoc.name = loc.toLowerCase().capitalize();
		thisLoc.slug = slug(thisLoc.name);
		thisLoc.id = locId;
		locId++;

		//get properties for this loc
		var theseProps = _.sortBy(_.without(fs.readdirSync(dropboxDirectory+"/"+loc), ".DS_Store"), function(name){return name});

		async.eachSeries(theseProps, function(prop, _callback){
			var thisProp = {};
			thisProp.dir = dropboxDirectory+"/"+loc+"/"+prop;
			thisProp.name = prop.toLowerCase().capitalize();
			thisProp.slug = slug(thisProp.name);
			thisProp.id = propId;
			thisProp.img = _.without(fs.readdirSync(thisProp.dir), "info.txt");
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
			console.log("dropboxsync setup complete".green);
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
}
