function allSuits(card) {
  return [card + 's', card + 'c', card + 'h', card + 'd'];
}

function isPair(cards) {
  return cards[0][0] === cards[1][0];
}

function cardValue(card) {
  return card.charAt(0);
}

function isPairedWithBoard(cards, communityCards) {
  for(var i=0; i < communityCards.length; i++) {
     if(cardValue(communityCards[i]) === cardValue(cards[0])) {
       return true;
     }
     if(cardValue(communityCards[i]) === cardValue(cards[1])) {
       return true;
     }
  }
}

function isConnectedToBoard(cards, communityCards) {
  return isPairedWithBoard(cards, communityCards);
}

function isDecentHand(cards) {
  var decentCardValues = ['A', 'K', 'Q', 'J', '10', '9', '8'];
  var decentCards = [];

  for(var i=0; i < decentCardValues.length; i++) {
    decentCards = decentCards.concat(allSuits(decentCardValues[i]));
  }

  if(decentCards.indexOf(cards[0]) !== -1 && decentCards.indexOf(cards[1]) !== -1) {
    return true;
  }

  if(isPair(cards)) {
    return true;
  }

  return false;
};

module.exports = function () {

  var info = {
    name: "SmartBot",
    email: "tylerhenkel@hotmail.com",
    btcWallet: "1FbjdyrW7Gy7oAcyQuXaS9SkKEfQRm946k"
  };

  function update(game) {
    if (game.state !== "complete") {
      wager = game.betting.call;
      switch(game.state) {
      case 'pre-flop':
        if (isDecentHand(game.self.cards)) {
          wager = game.betting.raise;
        }
        break;
      case 'flop':
        if (isConnectedToBoard(game.self.cards, game.community)) {
          wager = game.betting.raise;
        }
        break;
      case 'turn':
        if (isConnectedToBoard(game.self.cards, game.community)) {
          wager = game.betting.raise;
        }
        break;
      case 'river':
        if (isConnectedToBoard(game.self.cards, game.community)) {
          wager = game.betting.raise;
        }
        break;
      }      
      return wager;
    }
  }

  return { update: update, info: info };

};