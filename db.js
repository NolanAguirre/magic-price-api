var express = require('express');
var pgp = require('pg-promise')( /*options*/ )
pgp.pg.defaults.ssl = true;
var db = {};
var database = pgp(process.env.DATABASE_URL);
