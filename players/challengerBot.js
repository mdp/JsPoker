function havePair(cards, community) {
  var allCards = cards.concat(community).sort();

  for (var i=0; i<allCards.length-1; i++) {
    if (allCards[i][0] === allCards[i+1][0]) {
      return true;
    }
  }
}

function almostFlush(cards, community) {
  var allCards = cards.concat(community).sort();
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

module.exports = function () {

  var info = {
    name: "MercBot",
    email: "Jesse@SystemPunch.com",
    btcWallet: "1P42iQUCeMm4YkR2zFnu79ws7raNpV7dqg"
  };

  function update(game) {
    if (game.state !== "complete") {
      if (havePair(game.self.cards, game.community) || almostFlush(game.self.cards, game.community)) {
        return game.betting.raise;
      }
    }
  }

  return { update: update, info: info }

}
