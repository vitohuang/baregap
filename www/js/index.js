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

// Path for the database
var dbAbsPath;
var dbFullPath;

// Logger
var vlog;

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

	// Start the logger
	vlog = new vLogger($('#log-display'));

	vlog.add("Device is ready");

	vlog.add(getDeviceInfo());
	console.log("device is ready");
	// Maksure the database directory is there
	ensureDatabaseDirectory(function(error, result) {
		vlog.add("The database directory is on the system");

		console.log("ok, the database directory is there, no go to fetch test.mbtiles");
		go();

	});

	// Init map
	//initMap();

	// Trying to get the db
	//testDb();

	// Test the file system path
	//testFs();

	bindDomEvents();
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
var defaultZoom = 2;
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

	// Set the tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// Automatically calculate the device size and resize the map
function resizeMap(el) {
	var mapEl = el || $('#map');

	// Find the window size
	mapEl.width($(document).width() * 0.5);
	mapEl.height($(document).height() * 0.5);

	console.log("this is the height");
	var mapHeight = mapEl.height();
	console.log(mapHeight);
}

function testDb() {

alert("testDb");
	var db = window.sqlitePlugin.openDatabase({name: "my.db", androidLockWorkaround: 1});

alert(JSON.stringify(db));




db.transaction(function(tx) {
alert("going to do the transaction");
    tx.executeSql('DROP TABLE IF EXISTS test_table');
    tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text, data_num integer)');

    // demonstrate PRAGMA:
    db.executeSql("pragma table_info (test_table);", [], function(res) {
alert("executed sql: pragma");
      console.log("PRAGMA res: " + JSON.stringify(res));
    });

    tx.executeSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["test", 100], function(tx, res) {
alert("stuff inserted");
      console.log("insertId: " + res.insertId + " -- probably 1");
      console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");

      db.transaction(function(tx) {
        tx.executeSql("select count(id) as cnt from test_table;", [], function(tx, res) {
alert("result from select");
alert(JSON.stringify(res));

          console.log("res.rows.length: " + res.rows.length + " -- should be 1");
          console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
        });
      });


    }, function(e) {
      console.log("ERROR: " + e.message);
    });
  });
}

function go(remoteFile, localFileName, targetPath) {
console.log("go() to get remote file and put it in the local direxory");

	// The filename of the local mbtiles file
	localFileName = localFileName || 'test.db';
	// the url of the remote mbtiles file to be downloaded
	remoteFile = remoteFile || 'http://178.62.13.207/test.mbtiles';
	var msg;			// the span to show messages

	var fs;				// file system object
	var ft;				// TileTransfer object

/*
alert("app directory:"+cordova.file.applicationDirectory);
alert("app storage directory:"+cordova.file.applicationStorageDirectory);
alert("cache data directory:"+cordova.file.cacheDirectory);
alert("data directory:"+cordova.file.dataDirectory);
alert("external root data directory:"+cordova.file.externalRootDirectory);
alert("external storage data directory:"+cordova.file.externalApplicationStorageDirectory);
*/

	var targetDirectory = targetPath || dbAbsPath;
	msg = document.getElementById('message');
	
	console.log('requesting file system...');
	window.resolveLocalFileSystemURL(targetDirectory, function(dEntry) {
vlog.add("resolved data Directory:"+dEntry.name+" -> path:"+dEntry.fullPath);
vlog.add("file full path in go() to checked: "+localFileName);
		// check to see if files already exists
		var file = dEntry.getFile(localFileName, {create: false}, function (entry) {
			// file exists
			console.log('exists');

vlog.add("file already exist");
vlog.add(JSON.stringify(entry));
			msg.innerHTML = 'File already exists on device. Building map...';

			buildMap(localFileName);
		}, function () {
vlog.add("file not exist download it now");
			// file does not exist
			console.log('does not exist');

			msg.innerHTML = 'Downloading file...';

			console.log('downloading sqlite file...');
			console.log(remoteFile);
			ft = new FileTransfer();
			ft.download(remoteFile, targetDirectory +  localFileName, function (entry) {
vlog.add("download complete");
msg.innerHTML = "download complete:"+entry.fullPath;
				console.log('download complete: ' + entry.fullPath);

				buildMap(localFileName);

			}, function (error) {
				vlog.add("there is something wrong with download");
vlog.add(JSON.stringify(error));
			msg.innerHTML = 'error with download'+JSON.stringify(error);
				console.log('error with download', error);
			});
		});

	},
	function(error) {
		vlog.add("failed to open the dataDirectory:"+JSON.stringify(error));
	});
}

// Handlers
function errorHandler(tx, error) {
alert("error:"+error.message+" code: "+error.code);
}

function nullHandler(){};

function buildMap(dbFileName) {
//dbFileName = 'test.mbtiles';
var i = 1;
	// Replace the file:// at the start
vlog.add("build map:"+dbFileName);
resizeMap();
var db = null;
	//var db = window.sqlitePlugin.openDatabase({name: dbFileName, androidLockWorkaround: 1, createFromLocation: 1});
	var db = window.sqlitePlugin.openDatabase({name: dbFileName, androidLockWorkaround: 1});

vlog.add("going to display map");
	// Make a new map without zoom control
	map = L.map('map', {
		zoomControl: false
	});

	// Set the view
	map.setView(
		home,
		defaultZoom
	);

	// Limit the bound to the world
	var bounds = L.latLngBounds([[-85,-180.0],[85,180.0]]);
	map.setMaxBounds(bounds);

	var lyr = new L.TileLayer.MBTiles('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {maxZoom: 4, minZoom: 1, scheme: 'tms'}, db);

vlog.add("after full layeriiiiiiii - adding it to map");
	lyr.addTo(map);
}

function clearMap() {
	if (map) {
		map.eachLayer(function(layer) {
			map.removeLayer(layer);
		});
	}
}


// Bind all dom events
function bindDomEvents() {
console.log("bind dom events");
	// App data refresh button event
	$('#refresh-db-directory').click(function(event) {
		refreshDirectory($('#app-db-list'), dbAbsPath);
	});
	refreshDirectory($('#app-db-list'), dbAbsPath);

	// Delete the test.mbtiles file
	$('#delete-the-route').click(function(event) {
		console.log('going to delet test.mbtiles');
		
		getDirectory(dbAbsPath + 'test.mbtiles', function(error, result) {
			result.remove(function(entry) {
				console.log("test mbtiles deleted");
			});
		});
	});

var i = 0;
	// Download remote file event
	$('#download-button').click(function(event) {
		var remoteFile = $('#remote-file').val();

		if (remoteFile) {
i++;
			console.log("going to download: "+remoteFile);
			go(remoteFile, 'download'+i+'.db');
		}
	});
}

function refreshDirectory(directoryEl, path) {
	console.log("going to refresh directory:"+path);
	// Get the directory content
	getDirectory(path, function(error, result) {
		// Empty the directory el content
		directoryEl.empty();

		console.log("get result from get directory");
		result.forEach(function(entry) {
			// Create a list element
			if (entry.isFile) {
				entry.file(function(file) {

					directoryEl.append($('<li>'+file.name+' - '+file.size+'</li>'));
				});
			} else {
					directoryEl.append($('<li>'+entry.name+' - D</li>'));
			}

		});
	});
}
// Get directory content - will return directory entries or file if path is file
function getDirectory(path, callback) {
	window.resolveLocalFileSystemURL(path, function(entry) {
		console.log("resolve path");
		console.log(entry);
		console.log(entry.fullPath);
		console.log(entry.name);

		// Just return the file entry if its file
		if (entry.isFile) {
			callback(null, entry);
		} else {
			// Read the directory content
			var result = [];
			var reader = entry.createReader();
			reader.readEntries(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					console.log(entries[i].name);
					result.push(entries[i]);
				}

				// Callback
				callback(null, result);
			}, callback);
		}
	});
}

// Make sure the databases directory is there, created if its not there
function ensureDatabaseDirectory(callback) {
	// Make sure there is a callback
	callback = callback || function(){};

	// Set all variables
	var directoryName = 'databases';
	dbAbsPath = cordova.file.applicationStorageDirectory + directoryName + '/';
	dbFullPath = dbAbsPath.replace('file://', '');

	vlog.add('go function -> dbAbsPath:'+dbAbsPath+ ' -> '+dbFullPath);

	console.log("ensure the database diretory is there");
	console.log('dbAbsPath:'+dbAbsPath+ ' -> '+dbFullPath);

	window.resolveLocalFileSystemURL(dbAbsPath, callback, function(error) {
		// Something is wrong - probably need to create the directory
		vlog.add("the db abs path is no there - something is wrong, try to create directory");
		console.log("the db abs path is no there - something is wrong");
		console.log(error);

		// Try to create the directory
		window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function(entry) {
			vlog.add("got hold of the application storage directory");
			console.log("got hold of the application storage directory");
			entry.getDirectory(directoryName, {create: true, exclusive: false}, function(dbEntry) {
				console.log("datatabase directory created");
				callback(null, dbEntry);
			});

		});
		
	});
}
