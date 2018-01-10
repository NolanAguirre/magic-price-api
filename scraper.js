const fero = require('fero')
const request = require('request');
const cheerio = require('cheerio');

const scrape = function(req, cache) {
  console.log("scraping")
  let foo;
    request('https://www.mtggoldfish.com/price' + req.value.value.url + '#paper', function(error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        try {
          foo = $('div[class=price-box-price]').get(1)['children'][0]['data'];
        } catch (err) {
           foo = $('div[class=price-box-price]').text();
        }
        cache.update(req.value.value.url,{price: foo, date: Date.now()})
      }else{
        cache.update(req.value.value.url,{price: "cannot be fetched at this time", date: Date.now()})
      }
    });
  }

  !async function start() {
    const users = await fero('users', async function(req, cache) {
      console.log(req.value);
        if (req._type) {
          return cache.change(req)
        }
        switch (req.value.value.type) {
          case "SCRAPE":
            return scrape(req, cache);
          default:
            return "Method Not Allowed";
        }
      }
    )
    console.log('READY1')
  }()
