const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const path = require('path');
const cors = require('cors')
const port = (process.env.PORT || 3002);
const fero = require('fero');
const scrapingAge = 86400000;

function requestHandler(
    cards
) {
    return function(req, res) {
        function getSetConflicts(set){
            return set;
        }
        function formatUrl(requestObject){
            let url = '';
            url += requestObject.set.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            url += requestObject.foil ? ':Foil' : '';
            url += '/' + requestObject.name.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            return url
        }
        let urlKey = formatUrl(req.body);
        console.log("got a get request ", urlKey);
        if (cards[urlKey] && Date.now() - cards[urlKey].date < scrapingAge) {
            res.send(cards[urlKey].price);
        } else if (!cards[urlKey]) { // has never been scraped
            cards.add(urlKey, {
                type: 'SCRAPE',
                value: {
                    price: null,
                    url: urlKey,
                    date: null
                }
            }).on('reply').then(function(data){
                res.json(data.value);
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
    app.use('/', express.static(__dirname +  '/'));
    app.use(bodyParser.json());
    app.post('/', localRequestHandler)
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });
    return app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
}
createApp();
