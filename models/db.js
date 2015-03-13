//db.js
var settings = require('../settings');
var Db = require('mongodb').Db;
var conn = require('mongodb').Connection;
var server = require('mongodb').Server;

module.exports = new Db(settings.db, new server(settings.host, settings.port, {
	auto_reconnect : true
}));