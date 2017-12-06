const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const path = require('path');
const port = (process.env.PORT || 3000);

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



const server = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
