// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	//db: SQLitePlugin
	mbTilesDB: null,

	initialize: function(url, options, db) {
		alert("mbtiles leaflet tile init");
		// Set the mtiles
		this.mbTilesDB = db;

		this._url = url;
		options = L.setOptions(this, options);
	console.log("this is the end of initialize");
		// Call the parent initialization
		//L.TileLayer.prototype.initialize.call(this, url, options);
	},
	getTileUrl: function (tilePoint, callback) {
		console.log("get tile url");
		// Create a deferred object
		//var r = $.Deferred();

		var z = tilePoint.z;
		var x = tilePoint.x;
		var y = tilePoint.y;
		var base64Prefix = 'data:image/png;base64,';

		var src;


		var msg = "gettint tile url: z -> "+z+' x -> '+x+' y->'+y;
		/*
		setTimeout(function() {
			var result = L.Util.template(this._url, L.extend({
				s: this._getSubdomain(tilePoint),
				z: tilePoint.z,
				x: tilePoint.x,
				y: tilePoint.y
			}, this.options));

		console.log(msg + ' -> ' + result);
			callback(result);
		}.bind(this), Math.round(Math.random() *10) * 500);
		*/
		this.mbTilesDB.transaction(function(tx) {
		console.log();
			//tx.executeSql("SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (tx, res) {
			tx.executeSql("SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (tx, res) {
	//alert("got tile from sqlite db");
//alert(res.rows.length);
	for (var i = 0; i < res.rows.length; i++) {
//alert("inside the for loop");
		var row = res.rows.item(i);
//alert(row);
	//	alert.log(JSON.stringify(row));
		src = base64Prefix + row.tile_data;
		//alert(msg + ' -> got tile data');
	}
		
	console.log(msg + ' callback ');
	//alert("src for it");
	//alert(src);
		callback(src);
				// Call resolve on the deferred object
				//r.resolve(src);
			}, function (er, error) {
/*
	alert("something wrong with the sql");
	alert(JSON.stringify(er));
	alert(JSON.stringify(error));
	*/
				console.log('error with executeSql', er);
			});

		});

		// Return the deferred object
		//return r;
	},
	_loadTile: function (tile, tilePoint, callback) {
		console.log("load tile called");
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		var msg = "load tile : z -> "+tilePoint.z+' x -> '+tilePoint.x+' y->'+tilePoint.y;
		//alert(msg);
		this._adjustTilePoint(tilePoint);
		this.getTileUrl(tilePoint, function(src) {
			console.log("this is getting back:"+src);
			tile.src = src;
			this.fire('tileloadstart', {
				tile: tile,
				url: tile.src
			});

			callback(true);
		}.bind(this));

	}

});
