function isPair(cards) {
  // Ex ['As','Ac']
  return cards[0][0] === cards[1][0];
}

module.exports = function () {

  // Only calls pairs
  var info = {
    name: "TimidBot"
  };

  function play(game) {
    if (game.state !== "complete") {
      if (isPair(game.self.cards)) {
        return game.betting.call
      }
      return 0;
    }
  }

  return { play: play, info: info }

}
