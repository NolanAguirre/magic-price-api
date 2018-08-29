const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const path = require('path');
const cors = require('cors')
const port = (process.env.PORT || 3003);
const fero = require('fero');
const scrapingAge = 86400000;
const setNameIssues = {
    "Worlds": "can not look up",
    "Super Series": "JSS+MSS+Promos:Foil",
    "Summer of Magic": "Gateway+Promos",
    "Pro Tour": "Pro+Tour+Promos",
    "Prerelease Events": "Prerelease+Cards",
    "Portal Demo Game": "Portal",
    "Magic Game Day": "Game+Day+Promos",
    "Media Inserts": "Media+Promos",
    "Launch Parties": "Launch+Party+Cards",
    "Judge Gift Program": "Judge+Gift+Program:Foil",
    "Happy Holidays": "Special+Occasion:Foil",
    "Wizards Play Network": "WPN+Promo",
    "Gateway": "WPN+Promo",
    "Guru": "can not look up",
    "Friday Night Magic": "Friday+Night+Magic:Foil",
    "Release Events": "Release+Event+Cards",
    "Grand Prix": "Grand+Prix+Promos",
    "World Magic Cup Qualifiers": "WPN+Promos:Foil",
    "Legend Membership": "Arena+Promo",
    "Wizards of the Coast Online Store": "online",
    "European Land Program": "can not look up",
    "Champs and States": "Champs+Promos",
    "Celebration": "Special+Occasion",
    "Arena League": "Arena+Promos",
    "Asia Pacific Land Program": "can not look up",
    "15th Anniversary": "Pro+Tour+Promos",
    "Two-Headed Giant Tournament": "Arena+Promos",
    "Dragon Con": "Media + Promos",
    "Modern Masters 2015 Edition": "Modern+Masters+2015",
    "Vintage Masters": "online",
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
    "Collector's Edition": "can not look up",
    "Archenemy: Nicol Bolas": "Archenemy+Nicol+Bolas",
    "Time Spiral \"Timeshifted\"": "Timeshifted",
    "Multiverse Gift Box": "can not look up",
    "Introductory Two-Player Set": "can not look up",
    "Ugin's Fate promos": "Ugins+Fate+Promos",
    "Duels of the Planeswalkers": "can not look up",
    "Coldsnap Theme Decks":  "Coldsnap+Theme+Deck+Reprints",
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
            url += setNameIssues[requestObject.setName] ? setNameIssues[requestObject.setName] : requestObject.setName.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            if(url == "can not look up" || url == "online"){
                return url;
            }
            url += requestObject.foil ? ':Foil' : '';
            url += '/' + requestObject.name.replace(/[^a-zA-Z\d\s]/g, "").replace(/ /g, '+');
            return url
        }
        console.log("got a get request ", req.body);
        let urlKey = formatUrl(req.body);
        if(urlKey == "can not look up"){
            res.json("Can not price cards from this set");
            return;
        }else if(urlKey == "online"){
            res.json("Online sets can not be priced");
            return;
        }
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
