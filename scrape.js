var request = require('request');
var cheerio = require('cheerio');
const express = require('express');
const app = express();
const path = require('path');

app.use('/', express.static(__dirname + '/'));

app.get('/*', function(req, res, next) {
  request('https://www.mtggoldfish.com/price' + req.url + '#paper', function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      try {
        res.send($('div[class=price-box-price]').get(1)['children'][0]['data']);
      } catch (err) {
        res.send($('div[class=price-box-price]').text());
      }
    }
  });
});

const hostname = 'localhost';
const port = 3000;

const server = app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
