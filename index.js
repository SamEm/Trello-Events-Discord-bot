"use strict";
const Eris = require('eris');
const config = require('./config');
const dateFormat = require('dateformat');
const delay = require('./utils');
const getReports = require('./getReports');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.sqlite');

const TE = require('./trello_events');
var trello = new TE({
  token: config.trelloToken,
  key: config.trelloKey,
  minID: 0,
  pollFrequencyInS: config.pollFrequencyInS,
  boards: config.boards
});

let bot = new Eris(config.botToken);

bot.on('error', err => {
  let newDate = new Date();
  let currentTime = dateFormat(newDate, 'UTC:mm-dd-yyyy-HH-MM');
  console.log('BOT ERROR\n' + err.stack);
});

let connected = false;
let started = false;
bot.on('ready', () => {
  if(!connected) {
    //run looptieloops

    setTimeout(function () {
      started = true;
    }, 10000);

    db.run('CREATE TABLE IF NOT EXISTS cards (card TEXT, msgid TEXT)');
    connected = true;
  }

  console.log('BUGS!? WHERE?? I\'m here to post them all!');

  getReports(trello.api, bot, db);
});

bot.on('messageCreate', msg => {
  let msgSplit = msg.content.split(' ');
  let command = msgSplit.shift();

  let channelID = msg.channel.id;
  let msgID = msg.id;

  switch (command.toLowerCase()) {
    case "!ping":
      bot.createMessage(channelID, "PONG!");
      break;
    case "!refresh":
      getReports(trello.api, bot, db);
      bot.createMessage(channelID, "Going through all verified lists!");
      break;
    case "!restart":
      bot.createMessage(channelID, "Restarting!").then(delay(config.delayInS)).then(thisMSG => {
        bot.deleteMessage(channelID, msgID).catch(() => {});
        bot.deleteMessage(channelID, thisMSG.id).catch(() => {});
        process.exit();
      }).catch(err => {
        console.log("restart msg err\n" + err);
      })
      break;
  }
});
trello.on('updateCard', (event, data) => {
  if(started === true && !!event.data.listAfter && config.verifiedListIDs.indexOf(event.data.listAfter.id) > -1) {
    setTimeout(function () {
      let fullLink = event.data.card.shortLink + "/" + event.data.card.idShort + "-" + event.data.card.name.replace(/\s/gi, "-");
      let shortLink = event.data.card.shortLink;
      db.get('SELECT card FROM cards WHERE card = ?', [shortLink], function(error, dbGet) {
        if(!!error) console.log("addMsgDB\n" + error);
        if(!dbGet) {
          bot.createMessage(config.postChannelID, 'https://trello.com/c/' + fullLink).then(thisMsg => {
            db.run('INSERT INTO cards (card, msgid) VALUES (?, ?)', [shortLink, thisMsg.id]);
          }).catch((err) => {
            console.log(err);
          })
        }
      });
    }, 1500);
  }

  if(started === true && !!event.data.listAfter && config.verifiedListIDs.indexOf(event.data.listBefore.id) > -1) {
    setTimeout(function () {
      let shortLink = event.data.card.shortLink;
      db.get('SELECT card, msgid FROM cards WHERE card = ?', [shortLink], function(error, dbGet) {
        if(!!error) console.log("removeMsgDB\n" + error);
        if(!!dbGet) {
          bot.deleteMessage(config.postChannelID, dbGet.msgid).then(() => {
            db.run('DELETE FROM cards WHERE card = ?', [shortLink]);
          }).catch(() => {});
        }
      });
    }, 1500);
  }
});

bot.connect();
