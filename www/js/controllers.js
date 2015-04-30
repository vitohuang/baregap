angular.module('starter.controllers', [])

.controller('AppCtrl', ['$scope', '$ionicModal', '$state', '$timeout', 'downloader', function($scope, $ionicModal, $state, $timeout, downloader) {
  // Form data for the download modal
  $scope.download = {
	  url: ''
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/download.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the download modal to close it
  $scope.closeDownload= function() {
    $scope.modal.hide();
  };

  // Open the download modal
  $scope.download = function() {
    $scope.modal.show();
  };

  // Listen to remove
  $scope.$on('$destroy', function() {
	  $scope.modal.remove();
  });

  // Use the <a> tag as url parser
  var urlParser = document.createElement('a');

  // Perform the download action when the user submits the download form
  $scope.doDownload= function() {
    console.log('Doing download:'+$scope.download.url);
    var rawUrl = $scope.download.url;
    var url = 'http://'+rawUrl;

    urlParser.href = url;

    console.log(urlParser.pathname);
    if (urlParser.pathname) {
	    // Get the last bit of the pathname as local file name
	    var fileName = urlParser.pathname.split('/').pop();
	    console.log(fileName);

	    // Download service to download
	    downloader.get(url, fileName).then(function(result) {
		    console.log("get back from download:"+result);
		    // clear the download url
		    $scope.download.url = '';

		    console.log("going to close the download modal");
		    // Simulate a download delay. Remove this and replace with your download 
		    // code if using a download system
		    $timeout(function() {
		      $scope.closeDownload();
		    }, 1000);
	    });
    }

  };

}])
.controller('MapCtrl', ["$scope", "$q", "$stateParams",  "leafletData", function($scope,$q, $stateParams, leafletData) {

	// Listen to the current location
	$scope.currentMarker = null;
	$scope.locateMeStatus = '';
	$scope.$on('currentPosition', function(event, position) {
	});

	  // Find the current location
	  $scope.locateMe = function() {
		  console.log("trying to get the current location");
		$scope.locateMeStatus = 'finding';
		  navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
	  };

	  var onLocationSuccess = function(position) {
		$scope.locateMeStatus = 'success';
		  console.log(position);
		  var coords = position.coords;
		  $scope.currentLocation = position;

		  // transition to the map state
		  $state.transitionTo("app.map");
		  console.log("going to transition to app.map");
		  $scope.$broadcast('currentPosition', position);

		console.log("got the current postion and going to draw it on the map");
		console.log(position);

		// Update the status
		$scope.locateMeStatus = 'success';
		leafletData.getMap().then(function(map) {
			if ($scope.currentMarker) {
				map.removeLayer($scope.currentMarker);
			}

			// Current marker
			var currentMarker =  L.marker([position.coords.latitude + Math.random(), position.coords.longitude + Math.random()]);

			currentMarker.addTo(map);
			currentMarker.bindPopup("<b>"+position.coords.latitude + ", "+position.coords.longitude+"</b>").openPopup();

			$scope.currentMarker = currentMarker;
		});
	  };

	  var onLocationError = function(error) {
		$scope.locateMeStatus = 'fail';
		  alert("code:"+error.code+"\n message:" + error.message);
		  console.log(error);
	  }

	console.log("this is the map controller");
	console.log($stateParams);
	$scope.london = {
		lat: 51.505,
		lng: -0.09,
		zoom: 3
	};
	console.log("trying to get leaflet object");
	//console.log(leafletData.getMap());

	this.clearMap = function() {
		var deferred = $q.defer();
		leafletData.getMap().then(function(map) {
			console.log("after getting the leaflet map object");
			console.log(map.getCenter());
			console.log("going to remove all layers");
			map.eachLayer(function(layer) {
				map.removeLayer(layer);
			});

			// Resolve the defer
			deferred.resolve(map);
		});

		// return a promise
		return deferred.promise;
	};

	this.addTile = function(path) {
		console.log("going to add tile");
		this.clearMap().then(function(map) {
			console.log("going to add the cycling map to it");
if (typeof cordova == 'undefined') {
	var tileUrl = 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png';
	if ($stateParams.mapId) {
		tileUrl = 'http://www.cluelesscycling.com:8181/getTile?dbName='+$stateParams.mapId+'&x={x}&y={y}&z={z}';
	}
			var cyclingTileLayer= new L.tileLayer(tileUrl, {
				attribution: 'Map data',
				maxZoom: 18
			});
			cyclingTileLayer.addTo(map);

} else {
console.log("going to add the mbtiles");
var dbFileName = 'test.db';
if ($stateParams.mapId) {
	dbFileName = $stateParams.mapId;
}
	var db = window.sqlitePlugin.openDatabase({name: dbFileName, androidLockWorkaround: 1});

	var centre = [51.505, -0.08];
	var maxZoom = 10;
	var minZoom = 1;

	// Limit the bound to the world
	var bounds = L.latLngBounds([[-85,-180.0],[85,180.0]]);
	map.setMaxBounds(bounds);

	// Do some test transaction
	db.transaction(function(tx) {
	//alert("going to do the transaction");

		tx.executeSql(
			'SELECT key, value FROM meta_data;',
			[],
			function(ttx, result) {
				//alert("got stuff from meta_data table");
				//alert(JSON.stringify(result));
				if (result != null && result.rows != null) {
					//alert("there are stuff in the meta data table");
					//alert(result.rows.length);
					for (var j = 0; j < result.rows.length; j++) {
						var row = result.rows.item(j);
						//alert(row.key+' -> '+row.value);

						if (row.key == 'centre') {
							centre = JSON.parse(row.value);
							//alert("centre");
							//alert(centre);
						}

						if (row.key == 'zoom') {
							//alert("zoom");
							var zoom = JSON.parse(row.value);
							maxZoom = zoom.max || maxZoom;
							minZoom = zoom.min || minZoom;
							//alert(zoom);
						}

						if (row.key == 'bounds') {
							//alert("bounds");
							var bounds = JSON.parse(row.value);
							//alert(bounds);
	var maxBounds = L.latLngBounds(bounds);
	map.setMaxBounds(maxBounds);
						}
					}
	map.setView(
		centre,
		minZoom	
	);
	var lyr = new L.TileLayer.MBTiles('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {'maxZoom': maxZoom, 'minZoom': minZoom, scheme: 'tms'}, db);
console.log("this is after the mbtiles");
console.log(lyr);
	lyr.addTo(map);
				}
			},
			errorHandler
		);
	});

}

		});
	};

console.log("db abs path");
console.log(dbAbsPath);
	this.addTile();
}])

.controller('MapsCtrl', ['$scope', 'directory', function($scope, directory) {
	console.log('list directory content');

	console.log(dbAbsPath);
	// Refresh the view
	$scope.doRefresh = function() {
		console.log("do refresh");
		// Fake maps if there is no db path
		if (!dbAbsPath) {
			$scope.maps = [
				{name: '1430134582968', size: '123'},
				{name: '1430134457805', size: '321'}
			];

			$scope.$broadcast('scroll.refreshComplete');
			return true;
		}

		// Do a directory listing
		directory.list(dbAbsPath, function(error, result) {
			console.log("get content from the:"+dbAbsPath);
			
			var files = [];
			// Check if the results is file or directory
			result.forEach(function(entry) {
				console.log("checking out the entry:"+entry.name);
				// Create a file element
				if (entry.isFile) {
					console.log("its a file");
					entry.file(function(file) {
						files.push(file);
					});
				} else {
					files.push(entry);
				}
			});
			$scope.maps = files;

			console.log("going to broadcast the refresh is complete");
			// Its complete
			$scope.$broadcast('scroll.refreshComplete');

			// Kick the digest cycle
			$scope.$apply();
		});
	}

	$scope.doRefresh();
}])

.controller('LogCtrl', function($scope) {
  $scope.entries = [
    { title: 'log', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
	console.log($stateParams);
});
