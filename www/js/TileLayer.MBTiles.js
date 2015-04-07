// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	//db: SQLitePlugin
	mbTilesDB: null,

	initialize: function(url, options, db) {
		// Set the mtiles
		this.mbTilesDB = db;

		this._url = url;

		L.Util.setOptions(this, options);
	},
	getTileUrl: function (tilePoint, callback) {
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
				callback(src);
			}, function (er, error) {
	//alert("something wrong with the sql");
	//alert(JSON.stringify(er));
	//alert(JSON.stringify(error));
				console.log('error with executeSql', er);
			});

		});
	},
	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint, function() {
			console.log("_loadTitle callback function");
			console.log("going to add title:"+tilePoint.x+" y: "+tilePoint.y);
			if (tile.parentNode !== this._tileContainer) {
				console.log("going to apend to child");
				container.appendChild(tile);
			}
		}.bind(this));
		//});

	},
	_loadTile: function (tile, tilePoint, cb) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

this.something = "something";
console.log("going to load tile:"+JSON.stringify(tilePoint));
		this._adjustTilePoint(tilePoint);
		this.getTileUrl(tilePoint, function(src) {
			console.log("got back the src:"+src);
			console.log("this is got back from src");
			console.log(typeof this.fire);
			console.log(this.something);
			console.log("this is got back from src after tiledjfkdjfdkjfkdjfjdkfj");
			tile.src = src;

			this.fire('tileloadstart', {
				tile: tile,
				url: tile.src
			});
			console.log("this is after fire tile load start");

			cb(true);
		}.bind(this));
		//});

	}
});
