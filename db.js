var express = require('express');
var pgp = require('pg-promise')( /*options*/ )
pgp.pg.defaults.ssl = true;
var db = {};
var database = pgp(process.env.DATABASE_URL);

db.updatePrice = function(queryParams, price){
  db.none("UPDATE magic_cards SET price = $1 WHERE multiversid = $2", [queryParams.multiversid, price])
    .then(function(){

    }).catch(function(err){
      console.log(err)
    })
}

db.queryCardPrice = function(queryParams, callback){
  database.one('SELECT * FROM magic_cards WHERE name = $1', queryParams.name)
    .then(function(data) {
      callback(data);
    })
    .catch(function(err) {
      callback(null);
    });
}

module.export = db;
