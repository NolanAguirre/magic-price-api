const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
require('dotenv').config()
const path = require('path');
const cors = require('cors')
const port = (process.env.PORT || 3002);
const fero = require('fero');
const oneDay = 86400000;

function createHomepageHandler(
  cards
) {
  return function(req, res) {
    cards.on('change')
      .map(function(msg) {
        if (msg._key == req.url && msg.value.price) {
          res.send(msg.value)
        }
      })
    //.filter(function(message){message._key == req.url.value})
    //  .map(function(msg){
    //    res.send(msg._value)
    //  })
    let urlKey = req.url;
    console.log("got a get request ", urlKey);
    if (cards[urlKey] && Date.now() - cards[urlKey].date < oneDay) { // has been scraped today
      res.send(cards[urlKey]);
    } else if (!cards[urlKey]) { // has never been scraped
      cards.add(urlKey, {
        price: null,
        key: urlKey,
        date: null
      }).on('reply');
      cards.peers.send({
        key: urlKey,
        value: {
          type: 'SCRAPE',
          url: urlKey
        }
      }).on('reply')
    } else { // has been scraped, but is older than one day
      // await scrape(users, url);
      // users.on('change')
      //   .map(function(msg) {
      //     if(msg.key == url){
      //       req.send(msg.value.price);
      //     }
      //   })
    }
  }
}

async function createApp() {
  const cards = await fero('cards', {
    client: true
  })
  const app = express();
  const homepageHandler = createHomepageHandler(cards) // injecting the ready-to-use client
  app.use(cors());
  app.get('/*', homepageHandler)
  return app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}
createApp();
