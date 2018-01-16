const fero = require('fero')
const request = require('request');
const cheerio = require('cheerio');

const scrape = function(req, cache) {
    let price;
    let url = req.value.value.url;
    request('https://www.mtggoldfish.com/price' + url + '#paper', function(error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        try {
          price = $('div[class=price-box-price]').get(1)['children'][0]['data'];
        } catch (err) {
          price = $('div[class=price-box-price]').text();
        }
        cache.update(url, {
          price: price,
          date: Date.now()
        })
      } else {
        cache.update(url, {
          price: "cannot be fetched at this time",
          date: 0
        })
      }
    });
  }

  !async function start() {
    const cards = await fero('cards', async function(req, cache) {
      switch (req.value.type) {
        case "SCRAPE":
          return scrape(req, cache);
        default:
          return "Method Not Allowed";
      }
    })
    await cards.on('connected');
  }()
