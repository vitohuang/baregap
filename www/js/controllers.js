angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the download modal
  $scope.downloadUrl = '';

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

  // Perform the download action when the user submits the download form
  $scope.doDownload= function() {
    console.log('Doing download', $scope.loginData);

    // Simulate a download delay. Remove this and replace with your download 
    // code if using a download system
    $timeout(function() {
      $scope.closeDownload();
    }, 1000);
  };
})
.controller('MapCtrl', ["$scope", "$q", "$stateParams",  "leafletData", function($scope,$q, $stateParams, leafletData) {
	console.log("this is the map controller");
	console.log($stateParams);
	$scope.london = {
		lat: 51.505,
		lng: -0.09,
		zoom: 8
	};
	console.log("trying to get leaflet object");
	console.log(leafletData.getMap());

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
		this.clearMap().then(function(map) {
			console.log("going to add the cycling map to it");
if (typeof cordova == 'undefined') {
			var cyclingTileLayer= new L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
				attribution: 'Map data',
				maxZoom: 18
			});
			cyclingTileLayer.addTo(map);

} else {
console.log("going to add the mbtiles");
var dbFileName = 'test.mbtiles';
	var db = window.sqlitePlugin.openDatabase({name: dbFileName, androidLockWorkaround: 1});

	var lyr = new L.TileLayer.MBTiles('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {maxZoom: 4, minZoom: 1, scheme: 'tms'}, db);
console.log("this is after the mbtiles");
console.log(lyr);
	lyr.addTo(map);
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
		directory.list(dbAbsPath, function(error, result) {
			console.log("get content from the:"+dbAbsPath);
			$scope.maps = result;

			console.log("going to broadcast the refresh is complete");
			// Its complete
			$scope.$broadcast('scroll.refreshComplete');

			// Kick the digest cycle
			$scope.$apply();
		});
	}

	$scope.doRefresh();
  //$scope.maps = directory.list();
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
});
