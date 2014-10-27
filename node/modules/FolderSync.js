var fs = require('fs');

/* base file linking relative to app root (currently reliant of OF App Structure)
 * example:
 * ./../ or
 * 
 * 30PP/
 * creates hidden system files to store app data
*/
exports.tempDir	  = './.tmp'; 
exports.assetsDir = './public/.assets';
exports.videosDir = exports.assetsDir+'/videos';
exports.imagesDir = exports.assetsDir+'/images';
exports.outputDir = exports.assetsDir+'/output';

//check assetsDirectory
exports.setup = function(){

	var tempDir = exports.tempDir;
	var assetsDir = exports.assetsDir;
	var videosDir = exports.videosDir;
	var imagesDir = exports.imagesDir;
	var outputDir = exports.outputDir;
	
	console.log();
	console.log(" ... Reviewing Folder Status ... ".inverse);
	console.log();
	
	try {
	    // Query the entry
	    var a = fs.lstatSync(assetsDir);
	
	    // Is it a directory?
	    if (a.isDirectory()) {
	        // Yes it is
	        console.log("Directory Assets Exists".green)
	    }else{
		    console.log(" No Assets Directory ".red.inverse)
		    fs.mkdirSync(assetsDir);
	
	    }
	}catch (e) {
	    // ...
	    console.error(" No Assets Directory ".red.inverse);
	    
	    //make a folder
	    fs.mkdirSync(assetsDir);
	   	console.log(" Assets Directory Created ".green.inverse);
	
	}
	//check temp file directory
	try{
		var t = fs.lstatSync(tempDir);
		if(t.isDirectory()){
			console.log("Directory Temp Exists".green);
		}else{
			console.log(" No Temp Directory ".red.inverse);
			fs.mkdirSync(tempDir);
			console.log(" Temp Directory Created ".green.inverse);
		}
		
	}catch(e){
		console.error(" No Temp Directory ".red.inverse);
		fs.mkdirSync(tempDir);
		console.log(" Temp Directory Created ".green.inverse);
	
	}
	
	//check for assets/video
	try{
		
		var v = fs.lstatSync(videosDir);
		if(v.isDirectory()){
			console.log("Video Directory Exists".green);
		}else{
			console.log(" No Video Directory ".red.inverse);
			fs.mkdirSync(videosDir);
			console.log(" Video Directory Created ".green);
		}
	}catch(e){
			console.log(" No Video Directory ".inverse.red);
			fs.mkdirSync(videosDir);
			console.log(" Video Directory Created ".green.inverse);
	
	}
	//check for assets/image
	try{
		
		var i = fs.lstatSync(imagesDir);
		if(i.isDirectory()){
			console.log("Image Directory Exists".green);
		}else{
			console.log(" No Image Directory ".inverse.red);
			fs.mkdirSync(imagesDir);
			console.log(" Image Directory Created ".green);
		}
	}catch(e){
			console.log(" No Image Directory ".inverse.red);
			fs.mkdirSync(imagesDir);
			console.log(" Image Directory Created ".green.inverse);
	}
	//check for assets/image
	try{
		
		var i = fs.lstatSync(outputDir);
		if(i.isDirectory()){
			console.log("Output Directory Exists".green);
		}else{
			console.log(" No Output Directory ".inverse.red);
			fs.mkdirSync(outputDir);
			console.log(" Output Directory Created ".green);
		}
	}catch(e){
			console.log(" No Output Directory ".inverse.red);
			fs.mkdirSync(outputDir);
			console.log(" Output Directory Created ".green.inverse);
	}
	
	console.log();
	console.log(" ... Folder Setup Complete ... ".inverse);
	console.log();
}
