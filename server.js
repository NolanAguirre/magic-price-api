const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
require('dotenv').config()
const path = require('path');
const cors = require('cors')
const port = (process.env.PORT || 3002);
const fero = require('fero');
const oneDay = 86400000;

function requestHandler(
    cards
) {
    return function(req, res) {
        cards.on('change')
            .filter(function(msg) {
                return msg._key == req.url && msg.value.price;
            }).map(function(msg) {
                if (!res._headerSent) {
                    res.send(msg.value)
                }
            })
        let urlKey = req.url;
        console.log("got a get request ", urlKey);
        if (cards[urlKey] && Date.now() - cards[urlKey].date < oneDay) { // has been scraped today
            res.send(cards[urlKey]);
        } else if (!cards[urlKey]) { // has never been scraped
            cards.add(urlKey, {
                type: 'SCRAPE',
                value: {
                    price: null,
                    url: urlKey,
                    date: null
                }
            });
        } else { // has been scraped, but is older than one day
            cards.update(urlKey, {
                type: 'SCRAPE',
                value: {
                    price: null,
                    url: urlKey,
                    date: null
                }
            })
        }
    }
}

async function createApp() {
    const cards = await fero('cards', {
        client: true
    })
    await cards.on('connected');
    const app = express();
    const localRequestHandler = requestHandler(cards)
    app.use(cors());
    app.get('/*', localRequestHandler)
    return app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
}
createApp();
