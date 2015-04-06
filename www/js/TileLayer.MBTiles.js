// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	//db: SQLitePlugin
	mbTilesDB: null,

	initialize: function(url, options, db) {
		alert("mbtiles leaflet tile init");
		// Set the mtiles
		this.mbTilesDB = db;

		this._url = url;

		L.Util.setOptions(this, options);
	},
	getTileUrl: function (tilePoint) {
		// Create a deferred object
		var r = $.Deferred();

		var z = tilePoint.z;
		var x = tilePoint.x;
		var y = tilePoint.y;
		var base64Prefix = 'data:image/png;base64,';

		var src;

		this.mbTilesDB.transaction(function(tx) {
		console.log("gettint tile url: z -> "+z+' x -> '+x+' y->'+y);
			tx.executeSql("SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (tx, res) {
	//alert("got tile from sqlite db");
//alert(res.rows.length);
	for (var i = 0; i < res.rows.length; i++) {
//alert("inside the for loop");
		var row = res.rows.item(i);
//alert(row);
	//	alert.log(JSON.stringify(row));
		src = base64Prefix + row.tile_data;
	}
		
	//alert("src for it");
	//alert(src);
				// Call resolve on the deferred object
				r.resolve(src);
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
		return r;
	},
	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		this.getTileUrl(tilePoint).done(function(src) {
			tile.src = src;
		});

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},
});
