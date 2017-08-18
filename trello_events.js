"use strict";
const Trello = require('node-trello');
const extend = require('extend');
const EventEmitter = require('event-emitter');

class thisEmitter extends EventEmitter {};
const emitter = new thisEmitter();

let config;
let defaultOptions = {
  token: '',
  key: '',
  minID: 0,
  pollFrequencyInS: '',
  boards: ['', '']
};
let trello;

module.exports = function (newOptions) {
  config = extend(true, defaultOptions, newOptions);

  trello = new Trello(config.key, config.token);

  setInterval(pollIDs, config.pollFrequencyInS);

  let thisEmitter = {
    on: function(event, listener) {
      emitter.on(event, listener);
      return thisEmitter;
    },
    api: trello
  }
  return thisEmitter;
};

function pollIDs () {
  config.boards.forEach(function(boardID) {
    getBoards(boardID);
  });
}

function getBoards(boardID) {
  trello.get('/1/boards/' + boardID + '/actions', function(error, get) {
    if(error) {
      return emitter.emit('trelloError', error);
    }

    let boardActions = get.reverse();
    let actionID;
    for (var i in boardActions) {
      actionID = parseInt(boardActions[i].id, 16);
      if(actionID <= config.minID) {
        continue;
      }
      let eventType = boardActions[i].type;
      emitter.emit(eventType, boardActions[i], boardID);
    }
    config.minID = Math.max(config.minID, actionID);
    emitter.emit('maxID', config.minID);
  });
}
