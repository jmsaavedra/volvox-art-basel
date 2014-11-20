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
var path = require('path');

var Locations = [];
var Properties = [];

var visitorLogFilePath;

/***
// setup
//
*/
var setup = function(dropboxDirectory, cb){
	console.log("\nLooking for Dropbox in Directory:\n~".yellow+dropboxDirectory);

	// console.log( new Date().toString("hh:mm tt"));

	Locations = [];

	var locId = 0;
	var imgId = 0;
	var propId = 0;

	//get all locations from dropbox top level
	//if(fs.exists(dropboxDirectory)){
	// var stats = fs.stat(dropboxDirectory);
	// console.log(stats);
	if (fs.existsSync(dropboxDirectory)) {
	// if(stats.isDirectory()){
		visitorLogFilePath = path.dirname(dropboxDirectory)+"/VISITOR\ LOGS/visitor_log.txt";

		fs.open(visitorLogFilePath, 'a', function(err, fd){
			if(err) console.log("error creating visitor log file: ".red + err);
			else {
				//console.log("created file: "+visitorLogFilePath);
				fs.close(fd);
			}
		})

		var locs = _.sortBy(_.without(fs.readdirSync(dropboxDirectory), ".DS_Store"), function(name){return name});

		async.eachSeries(locs, function(loc, callback){
			var thisLoc = {};
			var thisLocProps = []
			var splitLoc = loc.split(" ");
			var finalLocName = "";
			for(var i=2; i<splitLoc.length; i++){
				finalLocName += splitLoc[i];
				if(i<splitLoc.length-1)finalLocName+=" ";
			}
			//thisLoc.name = loc.toLowerCase().capitalize();
			thisLoc.name = finalLocName;
			thisLoc.folder = loc;
			// thisLoc.slug = slug(thisLoc.name.toLowerCase());
			thisLoc.id = "loc"+locId.toString();
			locId++;

			//get properties for this loc
			var theseProps = _.sortBy(_.without(fs.readdirSync(dropboxDirectory+"/"+loc), '.DS_Store'), function(name){return name});
			var propCount = 0;

			async.eachSeries(theseProps, function(prop, _callback){
				var thisProp = {};
				thisProp.dir = dropboxDirectory+"/"+loc+"/"+prop;

				var splitProp = prop.split(" ");
				var finalPropName = "";
				for(var i=2; i<splitProp.length; i++){
					finalPropName += splitProp[i];
					if(i<splitProp.length-1)finalPropName+=" ";
				}
				// console.log("finalPropName: "+finalPropName);
				// reg = new RegExp('   ', 'g');
				// finalPropName = finalPropName.replace(reg, '&nbsp;&nbsp;&nbsp;');
				thisProp.name = finalPropName;
				thisProp.folder = prop;
				// thisProp.slug = slug(thisProp.name.toLowerCase());
				thisProp.parent_id = "loc"+(locId-1);
				thisProp.parent_name = thisLoc.name;
				thisProp.id = "property_"+propId.toString();
				thisProp.count = "prop"+propCount.toString();
				var imgs = _.without(fs.readdirSync(thisProp.dir), 'info.txt', '.DS_Store');
				imgs.forEach(function(img, i){
					imgs[i] = {id: "img_"+imgId.toString(), url: "/"+loc+"/"+prop+"/"+imgs[i]};
					imgId++;
				})
				thisProp.img = imgs;
				var thisInfoDir = thisProp.dir+"/info.txt";
				// fs.existsSync(thisProp.dir+"/info.txt", function(exists){
				// 	if (exists){
				// 		//thisProp.info = fs.readFileSync(thisProp.dir+"/info.txt").toString();
				// 	} else {
				// 		console.log("ERROR:".red.inverse + " property: "+thisProp.name + " MISSING info.txt file");
				// 	}
				// });
				var rawInfo = fs.readFileSync(thisProp.dir+"/info.txt").toString();
				var find = '\n' // find this line break in info file
				var reg = new RegExp(find, 'g');
				thisProp.info = rawInfo.replace(reg, '<br>'); //replace with <br> to add visual breaks
				find = '\r';
				reg= new RegExp(find, 'g');
				thisProp.info = thisProp.info.replace(reg, '');
				// reg = new RegExp(' ', 'g');
				// thisProp.info = thisProp.info.replace(reg, '&nbsp;');
				propId ++; //global property id
				propCount++; //this location property id
				thisLocProps.push(thisProp);
				Properties.push(thisProp);
				_callback();
				// checkInfoFile( thisInfoDir, function(e, thisDir){
				// 	thisProp.info = fs.readFileSync(thisInfoDir).toString();
				// 	propId ++; //global property id
				// 	propCount++; //this location property id
				// 	thisLocProps.push(thisProp);
				// 	Properties.push(thisProp);
				// 	_callback();
				// });
			}, function(_err){ //finished with all properties
				if(!_err) thisLoc.properties = thisLocProps;
				else console.log("error iterating properties: ".red+_err);
			})

			Locations.push(thisLoc)
			callback();

		}, function(err){
			if(!err){
				console.log(">> DropboxSync setup complete <<\n".green);
				cb(null, Locations);
			}
			else{
				console.log("error iterating locations: ".red+err);
				cb(err, null);
			}
		});
	} else {

		console.log("\n\n!!  ERROR:  ".red.inverse + " DROPBOX FOLDER COULD NOT BE FOUND".red);
		console.log(">>> check DropBoxDirectory string in app.js file <<<\n\n");
		process.exit(0);
	}
}




var checkInfoFile = function(thisDir, cb){



	 fs.stat(thisDir, function (err, stats) {
        if (err) {
            console.log(err);
						if(err.code === 'ENOENT'){
							fs.writeFileSync(thisDir, 'PROPERTY NAME HERE\n\n- a note\n- another note');
							console.log("Created File: ".green+thisDir);
							cb(null, thisDir);
						} else return; // exit here since stats will be undefined
        }

        if (stats.isFile()) {
					//console.log("found file: "+thisDir)
						cb(null, thisDir)

        }
        // if (stats.isDirectory()) {
        //     walk(file, calback);
				//
        // }
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
			else cb("null property found when looping for "+id, null);
		}
		else cb(err, null);
	});
}

String.prototype.capitalize = function() {
    // return this.charAt(0).toUpperCase() + this.slice(1);
		return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}


var getVisitorLog = function(){

	return visitorLogFilePath;
}

/***
// MODULE EXPORTS
//
*/
module.exports = {
	all: all,
	setup: setup,
	getPropertyById: getPropertyById,
	getVisitorLog: getVisitorLog
}
