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
  users
) {
  return function(req, res) {
    users.on('change')
      .map(function(msg) {
        console.log(msg);
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
    if (users[urlKey] && Date.now() - users[urlKey].date < oneDay) { // has been scraped today
      res.send(users[urlKey]);
    } else if (!users[urlKey]) { // has never been scraped
      users.add(urlKey, {
        price: null,
        key: urlKey,
        date: null
      }).on('reply');
      users.peers.send({
        key: urlKey,
        value: {
          type: 'SCRAPE',
          url: urlKey
        }
      }).on('reply')
      //setTimeout(function(){
      //  res.send(users[urlKey])
      //}, 2000)
      //console.log("should be scrapping")
      // users.on('change')
      //   .map(function(msg) {
      //     if(msg.key == url){
      //       console.log(msg.value);
      //
      //     }
      //   })
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
  const users = await fero('users', {
    client: true
  })
  const app = express();
  const homepageHandler = createHomepageHandler(users) // injecting the ready-to-use client
  app.use(cors());
  app.get('/*', homepageHandler)
  console.log("app created")
  return app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}
createApp();
