module.exports = {
  update: update,
  name: "unpredictableBot",
}


function chance(amount) {
  return Math.random() > amount;
}

  function update(game) {
    var wager;
    if (game.state !== "complete") {
      var wager = game.betting.call
      switch(game.state) {
      case 'pre-flop':
        if (chance(0.5)) wager = game.betting.raise
        break;
      case 'flop':
        if (chance(0.3)) wager = game.betting.raise
        break;
      case 'turn':
        if (chance(0.6)) wager = game.betting.raise
        break;
      case 'river':
        if (chance(0.1)) wager = game.betting.raise
        break;
      }
      return wager;
    }
  }

