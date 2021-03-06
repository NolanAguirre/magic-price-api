const fero = require('fero')
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const scrape = function(req, cache) {
    let url = req.value.value.url;
    console.log("working on", url);
    return fetch('https://www.mtggoldfish.com/price/' + url + '#paper')
        .then(res => {
            if (res.status == 200) {
                return res.text();
            } else {
                return;
            }
        })
        .then(function(body){
            let price ="price is not available";
            if(body){
            var $ = cheerio.load(body);
            try {
                price = $('div[class=price-box-price]').get(1)['children'][0]['data'];
            } catch (err) {
                price = $('div[class=price-box-price]').text();
            }
            price = parseFloat(price);
            cache.update(url, {
                price: price,
                date: Date.now()
            })
        }    
            return price;
        }).catch(function(err) {
            return "price is not available";
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
