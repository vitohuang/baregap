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
		var z = tilePoint.z;
		var x = tilePoint.x;
		var y = tilePoint.y;
		var base64Prefix = 'data:image/gif;base64,';

console.log("gettint tile url: z -> "+z+' x -> '+x+' y->'+y);
		this.mbTilesDB.executeSql("SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (res) {
alert("got tile from sqlite db");
			var src = base64Prefix + res.rows[0].tile_data;
alert("src for it");
alert(src);
		}, function (er, error) {
alert("something wrong with the sql");
alert(JSON.stringify(er));
alert(JSON.stringify(error));
			console.log('error with executeSql', er);
		});
	},
});
