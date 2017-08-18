"use strict";

const config = require('./config');

function delay(delayS) {
  return function(arg) {
    return new Promise((resolve) => {
      delayS *= 1000;
      setTimeout(() => resolve(arg), delayS);
    })
  }
}
module.exports = delay;
