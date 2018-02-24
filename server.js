const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const path = require('path');
const cors = require('cors')
const port = (process.env.PORT || 3002);
const fero = require('fero');
const scrapingAge = 86400000;
const setNameIssues = {
    "Worlds": "Cannot Lookup",
    "Super Series": "JSS+MSS+Promos",
    "Summer of Magic": "Gateway+Promos",
    "Pro Tour": "Pro+Tour+Promos",
    "Prerelease Events": "Prerelease+Cards",
    "Portal Demo Game": "Portal",
    "Magic Game Day": "Game+Day+Promos",
    "Media Inserts": "Media+Promos",
    "Launch Parties": "Launch+Party+Cards",
    "Judge Gift Program": "Judge+Promos",
    "Happy Holidays": "Special+Occasion:Foil",
    "Wizards Play Network": "WPN+Promo",
    "Gateway": "WPN+Promo",
    "Guru": "Cannot Lookup",
    "Friday Night Magic": "FNM+Promos",
    "Release Events": "Release+Event+Cards",
    "Grand Prix": "Grand+Prix+Promos",
    "World Magic Cup Qualifiers": "WPN+Promos:Foil",
    "Legend Membership": "Arena+Promo",
    "Wizards of the Coast Online Store": "online",
    "European Land Program": "cant look up",
    "Champs and States": "Champs+Promos",
    "Celebration": "Special+Occasion",
    "Arena League": "Arena+Promos",
    "Asia Pacific Land Program": "cant look up",
    "15th Anniversary": "Pro+Tour+Promos",
    "Two-Headed Giant Tournament": "Arena+Promos",
    "Dragon Con": "Media + Promos",
    "Vintage Masters": "online",
    "Modern Masters 2015 Edition": "Modern+Masters+2015",
    "Masters Edition II": "online",
    "Masters Edition": "online",
    "Masters Edition IV": "online",
    "Masters Edition III": "online",
    "Masterpiece Series: Amonkhet Invocations": "Amonkhet+Invocations",
    "Masterpiece Series: Kaladesh Inventions": "Kaladesh+Inventions",
    "From the Vault: Annihilation (2014)": "From+the+Vault+Annihilation",
    "Magic: The Gathering—Conspiracy": "Conspiracy",
    "Magic: The Gathering-Commander": "Commander",
    "International Collector's Edition": "online",
    "Collector's Edition": "cant price",
    "Archenemy: Nicol Bolas": "Archenemy+Nicol+Bolas",
    "Time Spiral \"Timeshifted\"": "Timeshifted",
    "Multiverse Gift Box": "cannot look up",
    "Introductory Two-Player Set": "cannot lookup",
    "Ugin's Fate promos": "Ugins+Fate+Promos",
    "Duels of the Planeswalkers": "cannot look up",
    "Coldsnap Theme Deck":  "Coldsnap+Theme+Deck+Reprints",
    "Magic Origins Clash Pack": "Unique+and+Miscellaneous+Promos:Foil",
    "Fate Reforged Clash Pack": "Unique+and+Miscellaneous+Promos:Foil",
    "Magic 2015 Clash Pack": "Unique+and+Miscellaneous+Promos:Foil"
}

function requestHandler(
    cards
) {
    return function(req, res) {
        function getSetConflicts(set){
            return set;
        }
        function formatUrl(requestObject){
            let url = '';
            url += setNameIssues[requestObject.set] ? setNameIssues[requestObject.set] : requestObject.set.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            url += requestObject.foil ? ':Foil' : '';
            url += '/' + requestObject.name.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            return url
        }
        let urlKey = formatUrl(req.body);
        console.log("got a get request ", urlKey);
        if (cards[urlKey] && Date.now() - cards[urlKey].date < scrapingAge) {
            res.json(cards[urlKey].price);
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
