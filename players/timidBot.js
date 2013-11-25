function isPair(cards) {
  // Ex ['As','Ac']
  return cards[0][0] === cards[1][0];
}

module.exports = function () {

  // Only calls with pocket pairs
  var info = {
    name: "TimidBot"
  };

  function update(game) {
    if (game.state !== "complete") {
      if (isPair(game.self.cards)) {
        return game.betting.call
      }
      return 0;
    }
  }

  return { update: update, info: info }

}
