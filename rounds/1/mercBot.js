var cardOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

function orderCards(a, b) {
 return cardOrder.indexOf(a[0]) - cardOrder.indexOf(b[0]);
}

function havePair(cards, community) {
  var allCards = cards.concat(community).sort(orderCards);

  for (var i=0; i<allCards.length-1; i++) {
    if (allCards[i][0] === allCards[i+1][0]) {
      return true;
    }
  }
}

function almostFlush(cards, community) {
  var allCards = cards.concat(community).sort(orderCards);
  var diamonds = 0;
  var spades = 0;
  var clubs = 0;
  var hearts = 0;

  for (var i=0; i<allCards.length; i++) {
    if (allCards[i][1] === "d") diamonds++;
    else if (allCards[i][1] === "s") spades++;
    else if (allCards[i][1] === "c") clubs++;
    else hearts++;
  }

  return (diamonds > 3 || spades > 3 || clubs > 3 || hearts > 3);
}

function almostStraight(cards, community) {
  var allCards = cards.concat(community).sort(orderCards);

  var count = 0;

  for(var i=1; i<allCards.length; i++) {
    if (cardOrder.indexOf(allCards[i][0])-1 === cardOrder.indexOf(allCards[i][0])) count++;
    else if (count < 3) count = 0;
  }

  return count >= 3;
}

module.exports = function () {

  var info = {
    name: "MercBot",
    email: "Jesse@SystemPunch.com",
    btcWallet: "1P42iQUCeMm4YkR2zFnu79ws7raNpV7dqg"
  };

  function update(game) {
    if (game.state !== "complete") {
      if (havePair(game.self.cards, game.community) || almostFlush(game.self.cards, game.community) || almostStraight(game.self.cards, game.community)) {
        return game.betting.raise;
      }
    }
  }

  return { update: update, info: info }

}
