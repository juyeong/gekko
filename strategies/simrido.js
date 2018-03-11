// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  this.interval = this.settings.interval || 7;
  this.high = this.settings.interval || 75;
  this.low = this.settings.interval || 25;

  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.history = [];
}

// what happens on every new candle?
method.update = function(candle) {
  this.history.push(candle.close - candle.open)

  if (this.history.length > this.interval) {
    this.history.shift();
  }
}

method.log = function() {
}

method.check = function() {
  if (this.history.length < this.interval) {
    this.advice();
  } else {
    var result = this.history.filter(i => i >= 0).length / this.history.length * 100;
    log.debug('calculated simrido', result);
    if (result >= this.high) {
      this.advice('short');
    } else if (result <= this.low) {
      this.advice('long');
    } else {
      this.advice();
    }
  }
}

module.exports = method;
