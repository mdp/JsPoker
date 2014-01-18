module.exports = function () {

  var info = {
    name: "FlopBot",
    email: "tmyrden@gmail.com",
    btcWallet: "1GyQnjc5EEdZKpyxwcdEGifZTacKr5mDKL"
  };

  var hand = [{},{}];
  var flop = [{},{},{}];
  var power;
  var gap;

  var lastStatus = {};

  function myHand(game) {
    hand[0].value = game.self.cards[0].substr(0,1);
    hand[0].suit = game.self.cards[0].substr(1,1);
    hand[1].value = game.self.cards[1].substr(0,1);
    hand[1].suit = game.self.cards[1].substr(1,1);
    handPower();
  }

  function handPower() {
    hand.forEach(function(val, index) {
      var thisCard = hand[index];
      switch(val.value) {
        case 'A':
          thisCard.value = 14;
          thisCard.score = 10;
          break;
        case 'K':
          thisCard.value = 13;
          thisCard.score = 8;
          break;
        case 'Q':
          thisCard.value = 12;
          thisCard.score = 7;
          break;
        case 'J':
          thisCard.value = 11;
          thisCard.score = 6;
          break;
        case 'T':
          thisCard.value = 10;
          thisCard.score = 5;
          break;
        default:
          thisCard.value = parseInt(thisCard.value, 10);
          thisCard.score = thisCard.value / 2;
      }
    });

    if (hand[0].score > hand[1].score) {
      power = hand[0].score;
    } else if (hand[0].score == hand[1].score) {
      power = hand[0].score * 2;
    } else {
      power = hand[1].score;
    }

    if (hand[0].suit == hand[1].suit) {
      power += 2;
    }

    gap = Math.abs(hand[0].value - hand[1].value) - 1;

    switch(gap) {
      case 0:
        break;
      case 1:
        power -= 1;
        break;
      case 2:
        power -= 2;
        break;
      case 3:
        power -= 4;
        break;
      default:
        power -= 5;
    }

    if (hand[0].value < 12 && hand[1].value < 12 && gap < 2) {
      power++;
    }

    power = Math.round(power);
  }

  function flopCompute(game) {
    flop[0].value = game.community[0].substr(0,1);
    flop[0].suit = game.community[0].substr(1,1);
    flop[1].value = game.community[1].substr(0,1);
    flop[1].suit = game.community[1].substr(1,1);
    flop[2].value = game.community[2].substr(0,1);
    flop[2].suit = game.community[2].substr(1,1);

    var setValue = 0;
    var sets = [];
    var suits = {
      hearts: 0,
      clubs: 0,
      spades: 0,
      diamonds: 0
    };

    flop.forEach(function(val, index) {
      var thisCard = flop[index];
      switch(val.value) {
        case 'A':
          thisCard.value = 14;
          break;
        case 'K':
          thisCard.value = 13;
          break;
        case 'Q':
          thisCard.value = 12;
          break;
        case 'J':
          thisCard.value = 11;
          break;
        case 'T':
          thisCard.value = 10;
          break;
        default:
          thisCard.value = parseInt(thisCard.value, 10);
      }

      if (thisCard.value == hand[0].value || thisCard.value == hand[1].value) {
        sets.push(thisCard.value);
      }

      if (thisCard.suit == 'c') {
        suits.clubs++;
      } else if (thisCard.suit == 's') {
        suits.spades++;
      } else if (thisCard.suit == 'd') {
        suits.diamonds++;
      } else if (thisCard.suit == 'h') {
        suits.hearts++;
      }
    });

    hand.forEach(function(val, index) {
      var thisCard = hand[index];
      if (thisCard.suit == 'c') {
        suits.clubs++;
      } else if (thisCard.suit == 's') {
        suits.spades++;
      } else if (thisCard.suit == 'd') {
        suits.diamonds++;
      } else if (thisCard.suit == 'h') {
        suits.hearts++;
      }
    });

    if (suits.hearts > 4 || suits.spades > 4 || suits.clubs > 4 || suits.diamonds > 4) {
      if (hand[0].value > 12 || hand[1].value > 12) {
        console.log('HIGH FLUSH', game.self.chips);
        return game.self.chips;
      }
    } else if (suits.hearts > 3 || suits.spades > 3 || suits.clubs > 3 || suits.diamonds > 3) {
      //console.log('FLUSH DRAW', game.self.chips);
      if (hand[0].suit == hand[1].suit) {
        if (hand[0].value > 11 || hand[1].value > 11) {
          console.log('SICK');
          return game.self.chips;
        }
      } else {
        return game.betting.call;
      }
    }

    if (sets.length > 1 || sets[0] > 12) {
      return game.self.chips;
    } else if (sets.length > 0) {
      return game.betting.call;
    } else {
      return 0;
    }
  }

  function preFlop(game) {
    var myPosition = game.self.position;
    var isFirstRound = (!(game.self.actions));
    if (game.players.length >= 9) {         // 9+ Table
      if (game.betting.call > 10 || (!isFirstRound && game.betting.call <= 10)) {
        if (power > 11) {
          return game.betting.raise;
        } else if (power > 9) {
          return game.betting.call;
        } else {
          return 0;
        }
      } else if (game.betting.call == 10 && isFirstRound) {
        if (power > 9) {
          return game.betting.raise;
        } else {
          return 0;
        }
      } else if (game.betting.call < 10) {
        if (power > 6) {
          return game.betting.raise;
        } else if (power > 2) {
          return game.betting.call;
        } else {
          return 0;
        }
      }
    } else if (game.players.length >= 5) {  // 5-8 Table
      if (game.betting.call > 10 || (!isFirstRound && game.betting.call <= 10)) {
        if (power > 11) {
          return game.betting.raise;
        } else if (power > 9) {
          return game.betting.call;
        } else {
          return 0;
        }
      } else if (game.betting.call == 10 && isFirstRound) {
        if (power > 8) {
          return game.betting.raise;
        } else {
          return 0;
        }
      } else if (game.betting.call < 10) {
        if (power > 6) {
          return game.betting.raise;
        } else if (power > 2) {
          return game.betting.call;
        } else {
          return 0;
        }
      }
    } else if (game.players.length >= 3) {  // 3-4 Table
      if (game.betting.call > 10 || (!isFirstRound && game.betting.call <= 10)) {
        if (power > 11) {
          return game.betting.raise;
        } else if (power > 9) {
          return game.betting.call;
        } else {
          return 0;
        }
      } else if (game.betting.call == 10 && isFirstRound) {
        if (power > 6) {
          return game.betting.raise;
        } else {
          return 0;
        }
      } else if (game.betting.call < 10) {
        if (power > 6) {
          return game.betting.raise;
        } else if (power > 2) {
          return game.betting.call;
        } else {
          return 0;
        }
      }
    } else if (game.players.length >= 1) {  // Heads Up
      if (game.betting.call > 5) {
        if (power > 9) {
          return game.betting.raise;
        } else if (power > 7) {
          return game.betting.call;
        } else {
          return 0;
        }
      } else {
        if (power > 4) {
          return game.betting.raise;
        } else if (power > 2) {
          return game.betting.call;
        } else {
          return 0;
        }
      }
    }
  }

  function update(game) {
    myHand(game);
    lastStatus = {
      call: game.betting && game.betting.call,
      state: game.state
    };
    if (game.state == "pre-flop") {
      return preFlop(game);
    } else if (game.state == "flop") {
      return flopCompute(game);
    } else if (game.state !== "complete") {
      return game.betting.call;
    }
  }

  return { update: update, info: info };

};
