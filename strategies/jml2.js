var request = require('sync-request');
var log = require('../core/log');

var strat = {};

strat.init = function() {
  this.input = 'candle';
  this.requiredHistory = 0;
  this.candles = []
  this.direction = 'open';
  this.duration = 0;
  this.url = this.settings.url;
  this.boughtPrice = 0;
}

strat.update = function(candle) {
  this.candles.push(candle);
  if (this.candles.length > 200) {
    this.candles.splice(0, 1);
  }
}

strat.log = function() {
}

strat.check = function(candle) {
  var price = candle.close;
  var position;

  try {
    var res = request('POST', this.url, {
      json: this.candles,
    });
    log.debug('request', res.getBody().toString());
    var resText = res.getBody().toString();
    var predicted = parseInt(resText);
    if (Number.isNaN(predicted)) {
      position = resText;
    } else {
      if (predicted > 0) {
        position = 'long';
      } else if (predicted < 0) {
        position = 'short';
      } else {
        position = 'open';
      }
    }
  } catch (error) {
    log.error('reqeust failed', error)
  }

  let long = position === 'long'
  let short = position === "short"
  let boughtPrice = this.boughtPrice;

  if (boughtPrice > 0) {
    if (candle.high >= (boughtPrice * 1.005) || candle.low <= (boughtPrice / 1.005)) {
      this.boughtPrice = long ? -1 : 0;
      this.advice('short');
    } else {      
      this.advice();
    }
  } else if (long) {
    this.boughtPrice = price;
    this.advice('long');
  } else if (short) {
    this.boughtPrice = 0;
    this.advice('short');
  } else {
    this.advice();
  }
}

module.exports = strat;
