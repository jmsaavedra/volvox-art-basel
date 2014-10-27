/***
// SYNC WITH LOCAL DROPBOX FOLDER
// PULL OUT PATHS 
//
*/


var fs = require('fs');
var dir = require('node-dir');

var locs = [];

function Location(name, id) {
	this.name = name;
	this.id = id;
}


/***
// setup
//
*/
var setup = function(dropboxDirectory){
	//TODO: query dropbox folder with fs, populate with that
	locs = [
		new Location("CALIFORNIA", 0),
		new Location("CONNECTICUT", 1),
		new Location("DELAWARE", 2),
		new Location("VERMONT", 3)
	];

	dir.subdirs( dropboxDirectory, function(err, subdirs){
		console.log(subdirs);
	});

}


/***
// return all locations
//
*/
var all = function(){
	console.log("hit all Locs");
	return locs
}



/***
// MODULE EXPORTS
//
*/
module.exports = {
	all: all,
	setup: setup

}
