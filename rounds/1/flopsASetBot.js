module.exports = function () {
var info = {
  name: "FlopASetBot",
  email: "jonathanburger11@gmail.com",
  btcWallet: "1JfK4EHYXiwTYPtMuW4mzECiQA5udREFZB"
};
var issuited = function(hand) {
  return hand[0][1] == hand[1][1]
}
var ispair = function(hand) {
  return hand[0][0] == hand[1][0]
}
var ismonster = function(hand) {
  /*
    assumes that ispair = true
  */
  return "AKQJ".match(hand[0][0]);

  
}
var isconnected = function(hand) {
  var value1 = hand[0][0],
      value2 = hand[1][0];
  var connection = value1 + value2;
  var pattern = "56789TJ JT98765";
  var isconnected = pattern.match(connection);
  return isconnected
}
var isbigace = function(hand) {
  var value1 = hand[0][0],
      value2 = hand[1][0];
  var connection = value1 + value2;
  var pattern = "AK KA AQ QA";
  var istrue = pattern.match(connection);
  return istrue;
}
var kindofhand = function(hand) {
  if (issuited(hand) && isconnected(hand)) {
    return 'suited-connector'
  }
  if (ispair(hand)) {
    if (ismonster(hand)) {
      return 'monster'
    }
    else {
      return 'pocket-pair'
    }
  }
  if (isbigace(hand)) {
    return 'big-ace'
  }
  return 'rags';
}
var calculatepot = function(players) {
  var pot = 0;
  players.forEach(function(player) {
    pot += player.wagered;
  })
  return pot;
}
var flushdraw = function(board, hand) {
  var cards = board.concat(hand);
  var suits = cards.map(function (card) {
    return card[1]
  }).sort().join('');
  var handsuits = hand.map(function (card) {
    return card[1];
  }).sort().join('')
  if ((suits.match("ccccc") && handsuits == "cc")
    ||(suits.match("ddddd") && handsuits == "dd")
    ||(suits.match("hhhhh") && handsuits == "hh")
    ||(suits.match("ddddd") && handsuits == "dd") ) {
    return 'flush-made'
  }
  if ((suits.match("cccc") && handsuits == "cc")
    ||(suits.match("dddd") && handsuits == "dd")
    ||(suits.match("hhhh") && handsuits == "hh")
    ||(suits.match("dddd") && handsuits == "dd") ) {
    return 'flush-draw'
  }
  return suits;
}
var straightdraw = function(board, hand) {
  var cards = board.concat(hand);
  var values = cards
  .map(function (card) {
    return card[0].replace(/T/g, '10').replace(/J/g, '11').replace(/Q/g, '12').replace(/K/g, '13').replace(/A/g, '14');
  })
  .map(function(value) { return parseInt(value) })
  .sort(function (a,b) { return a - b });

  var inarow = 1;
  var bestinarow = 1;
  for (var i = 0; i < values.length; i++) {
    if (i != 0) {
      var difference = values[i] - values[i-1];
      if (difference == 1) {
        inarow++;
      }
      else if (difference == 0) {}
      else {
        inarow = 1;
      }
    }
    if (bestinarow < inarow) {
        bestinarow = inarow
    }
  }
  if (inarow >= 5) {
    return 'straight'
  }
  if (inarow == 4) {
    return 'open-ended'
  }

}
var floppedtrips = function(board, hand) {
  var cards = board.concat(hand);
  if (hand[0][0] == hand[1][0]) {
    var values = board.map(function (card) {
      return card[0]
    })
    var floppedset = values.some(function (card) { return card == hand[0][0]})
    return floppedset
  }
}
var potodds = function(players, tocall) {
  var pot = calculatepot(players);
  return (pot / tocall);
}
var currenthandtype;
function update(game) {
  if (game.state == 'pre-flop') {
    currenthandtype = kindofhand(game.self.cards);
    /*
      Shove big hands preflop
    */
    if (currenthandtype == 'big-ace') {
      return game.self.chips;
    }
    if (currenthandtype == 'monster') {
      return game.self.chips
    }
    if (currenthandtype == 'suited-connector') {
      var odds = potodds(game.players, game.betting.call);
      if (odds >= 3) {
        return game.betting.call;
      }
    }
    if (currenthandtype == 'pocket-pair') {
      var odds = potodds(game.players, game.betting.call)
      if (odds >= 3) {
        return game.betting.call
      }
    }
    return 0;
  }
  if (game.state == 'flop') {
    if (currenthandtype == 'suited-connector') {
      var fdraw = flushdraw(game.community, game.self.cards)
      var sdraw = straightdraw(game.community, game.self.cards)
      if (fdraw == 'flush-draw' || fdraw == 'open-ended') {
        var odds = potodds(game.players, game.betting.call);
        if (odds >= 3) {
          return game.betting.call;
        }
      }
      if (fdraw == 'flush-made' || sdraw == 'straight') {
        return game.betting.raise*2.5;
      }
      if (set)
      return 0;
    }
    if (currenthandtype == 'pocket-pair') {
      var set   = floppedtrips(game.community, game.self.cards);
      if (set) {
        return game.betting.raise*2.5
      }
      else {
        return 0; 
      }
    }
  }
  if (game.state == 'turn') {
    if (currenthandtype == 'suited-connector') {
      var fdraw = flushdraw(game.community, game.self.cards)
      var sdraw = straightdraw(game.community, game.self.cards)
      if (fdraw == 'flush-draw' || sdraw == 'open-ended') {
        var odds = potodds(game.players, game.betting.call);
        if (odds > 6) {
          return game.betting.call;
        }
      }
      if (fdraw == 'flush-made' || sdraw == 'straight') {
        return game.betting.raise*2.5;
      }
      return 0;
    }
    if (currenthandtype == 'pocket-pair') {
      var set   = floppedtrips(game.community, game.self.cards);
      if (set) {
        return game.betting.raise*2.5
      }
      else {
        return 0; 
      }
    }
  }
  if (game.state == 'river') {
    if (currenthandtype == 'suited-connector') {
      var fdraw = flushdraw(game.community, game.self.cards)
      var sdraw = straightdraw(game.community, game.self.cards)
      if (fdraw == 'flush-made' || sdraw == 'straight') {
        return game.self.chips;
      }
      return 0;
    }
    if (currenthandtype == 'pocket-pair') {
      var set   = floppedtrips(game.community, game.self.cards);
      if (set) {
        return game.self.chips;
      }
      else {
        return 0; 
      }
    }
  }
  if (game.state !== "complete") {
    return game.betting.call
  }
}

return { update: update, info: info }
}

