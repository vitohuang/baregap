/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

	// Orientation change
	window.addEventListener('orientationchange', this.onOrientationChange, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

	// Init map
	//initMap();

go();
	// Trying to get the db
	//testDb();

	// Test the file system path
	//testFs();

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	onOrientationChange: function() {
		// Resize map
		resizeMap();
	}


};

// Get device info
function getDeviceInfo() {
	return {
		cordova: device.cordova,
		model: device.model,
		platform: device.platform,
		uuid: device.uuid,
		version: device.version
	}
}

var map = null;
var home = [51.505, -0.08];
var defaultZoom = 4;
function initMap() {
	var mapEl = $('#map');

	// Set the size
	resizeMap();

	// Make a new map without zoom control
	map = L.map('map', {
		zoomControl: false
	});

	// Set the view
	map.setView(
		home,
		defaultZoom
	);

console.log(home);
console.log(defaultZoom);
console.log("going to add tile layer");
	// Set the tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// Automatically calculate the device size and resize the map
function resizeMap(el) {
	var mapEl = el || $('#map');

	// Find the window size
	mapEl.width($(document).width());
	mapEl.height($(document).height());
console.log("this is the height");
var mapHeight = mapEl.height();
console.log(mapHeight);
}

function testDb() {

alert("testDb");
	var db = window.sqlitePlugin.openDatabase({name: "test.mbtiles"});

alert(JSON.stringify(db));
	  db.transaction(function(tx) {
		tx.executeSql("select count(*) as cnt from tiles;", [], function(tx, res) {
console.log("after the select");
		  console.log("res.rows.length: " + res.rows.length + " -- should be 1");
		  console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
		}, function(error) {
alert("this is the error trying to count tiles:"+error);
alert(JSON.stringify(error));
		});
	});
}

function testFs() {
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0 , gotFs, fail);
}

function fail() {
	alert("can't get file system");
}

function gotFs(fileSystem) {
	window.fileSystem = fileSystem;

	/*
	// Try to read the files within the root directory
	var directoryReader = fileSystem.root.createReader();
	directoryReader.readEntries(function(entries) {
		for (var i = 0; i < entries.length; i++) {
			console.log(entries[i].name);
		}
	});
	*/
}


var localFileName;	// the filename of the local mbtiles file
var remoteFile;		// the url of the remote mbtiles file to be downloaded
var msg;			// the span to show messages

localFileName = 'test.mbtiles';
remoteFile = 'http://178.62.13.207/test.mbtiles';

function go() {
	var fs;				// file system object
	var ft;				// TileTransfer object

alert("app directory:"+cordova.file.applicationDirectory);
alert("app storage directory:"+cordova.file.applicationStorageDirectory);
alert("cache data directory:"+cordova.file.cacheDirectory);
alert("data directory:"+cordova.file.dataDirectory);
alert("external root data directory:"+cordova.file.externalRootDirectory);
alert("external storage data directory:"+cordova.file.externalApplicationStorageDirectory);

	msg = document.getElementById('message');
	
	console.log('requesting file system...');
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dEntry) {
alert("resolved data Directory:"+dEntry.name+" -> path:"+dEntry.fullPath);
		var fileFullPath = cordova.file.externalDataDirectory + localFileName;
alert("file full path: "+fileFullPath);
		// check to see if files already exists
		var file = dEntry.getFile(localFileName, {create: false}, function () {
			// file exists
			console.log('exists');

alert("file already exist");
			msg.innerHTML = 'File already exists on device. Building map...';

			buildMap(fileFullPath);
		}, function () {
alert("file not exist creating it now");
			// file does not exist
			console.log('does not exist');

			msg.innerHTML = 'Downloading file...';

			console.log('downloading sqlite file...');
			ft = new FileTransfer();
			ft.download(remoteFile, cordova.file.externalDataDirectory +  localFileName, function (entry) {
alert("download complete");
msg.innerHTML = "download complete:"+entry.fullPath;
				console.log('download complete: ' + entry.fullPath);

				buildMap(fileFullPath);

			}, function (error) {
alert(JSON.stringify(error));
			msg.innerHTML = 'error with download'+JSON.stringify(error);
				console.log('error with download', error);
			});
		});

	},
	function(error) {
		alert("failed to open the externalDataDirectory:"+JSON.stringify(error));
	});

	/*
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
		console.log('file system retrieved.');
		fs = fileSystem;

		// check to see if files already exists
		var file = fs.root.getFile(localFileName, {create: false}, function () {
			// file exists
			console.log('exists');

			msg.innerHTML = 'File already exists on device. Building map...';

			buildMap();
		}, function () {
			// file does not exist
			console.log('does not exist');

			msg.innerHTML = 'Downloading file...';

			console.log('downloading sqlite file...');
			ft = new FileTransfer();
			ft.download(remoteFile, fs.root.fullPath + '/' + localFileName, function (entry) {
alert("download complete");
msg.innerHTML("download complete:"+entry.fullPath);
				console.log('download complete: ' + entry.fullPath);

				buildMap();

			}, function (error) {
alert(JSON.stringify(error));
			msg.innerHTML = 'error with download'+JSON.stringify(error);
				console.log('error with download', error);
			});
		});
	});
	*/
}

function buildMap(fileFullPath) {
alert("build map:"+fileFullPath);
resizeMap();
	var db = window.sqlitePlugin.openDatabase({name: fileFullPath});

	document.body.removeChild(msg);

	var map = new L.Map('map', {
		center: new L.LatLng(40.6681, -111.9364),
		zoom: 11
	});

	var lyr = new L.TileLayer.MBTiles('', {maxZoom: 2, scheme: 'tms'}, db);

	map.addLayer(lyr);
}
