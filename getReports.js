"use strict";
const config = require('./config');
const fs = require('fs');

module.exports = function(trello, bot, db){
  return config.verifiedListIDs.forEach(function(listID) {
    getAllReports(trello, bot, db, listID);
  });
};

let id = 0;
function getAllReports(trello, thisBot, thisdb, listID) {
  trello.get('/1/lists/' + listID + '/cards', function(err, get) {
    (function loopReports(bot, db, info, i) {
      setTimeout(function () {
        let shortLink = info[i].shortLink;
        db.get('SELECT card FROM cards WHERE card = ?', [shortLink], function(error, dbGet) {
          if(!!error) console.log(error);
          if(!dbGet) {
            bot.createMessage(config.postChannelID, info[i].url).then(thisMsg => {
              db.run('INSERT INTO cards (card, msgid) VALUES (?, ?)', [shortLink, thisMsg.id]);
            }).catch((err) => {
              console.log(err);
            })
          }
        });
        if(--i) loopReports(bot, db, info, i);
      }, 3000);
    })(thisBot, thisdb, get, get.length -1);

/*
    for (let i = 1; i < get.length; i++) {
      setTimeout(function () {
        ++reportNumb;
        let shortLink = get[i].shortLink;
        db.get('SELECT id FROM cards ORDER BY id DESC LIMIT 1', function(getIDerr, dbGetID) {
          if(!!getIDerr) console.log(getIDerr);
          db.get('SELECT * FROM cards WHERE card = ?', [shortLink], function(error, dbGet) {
            if(!!error) console.log(error);

            if(!dbGet) {
              let newDate = new Date();
              let currentTime = dateFormat(newDate, 'MM:ss');
//             bot.createMessage(config.postChannelID, )
//             db.run('INSERT INTO cards (id, card, msgid) VALUES (?, ?, ?)', [reportNumb, shortLink, ])
              console.log(currentTime + " " + reportNumb + " " + shortLink);
            }
          });
        });
      }, 3500);
    }
    */
  });
}
