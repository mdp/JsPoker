module.exports = function() {

  var info = {
    name: "SuperBot",
    email: "lawrence.hunt@gmail.com",
    btcWallet: "1Q4qP5Y2Ea54E3fcw5gBnbu7akimVQsTjy"
  };

  var faceCardValue = {
    "T": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
  };

  var getCardValue = function(card) {
    var value = card.substring(0, 1);
    if (faceCardValue[value]) {
      value = faceCardValue[value];
    }
    return parseInt(value, 10);
  };

  var checkForHighPair = function(cards) {
    var pair = false,
      i = 0;

    while (!pair && i < cards.length - 1) {
      if ((getCardValue(cards[i]) === getCardValue(cards[i + 1])) && getCardValue(cards[i]) >= 11) {
        pair = true;
      }
      i++;
    }
    return pair;
  };

  function update(game) {
    if (game.state !== "complete") {
      var cardsAvailable = game.self.cards.concat(game.community),
          wager;

      if (checkForHighPair(cardsAvailable)) {
        if(game.betting.canRaise){
          return game.self.chips;
        }else{
          return game.betting.call;
        }
      }else if(game.state !== "river" && getCardValue(game.self.cards[0]) >= 11 && getCardValue(game.self.cards[1]) >= 11){
        return game.betting.call;
      }
      return 0;
    }
  }

  return {
    update: update,
    info: info
  }

}