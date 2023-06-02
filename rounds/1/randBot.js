module.exports = {
  update: update,
  name: "randBot",
}

  function update(game) {
    if (game.state !== "complete") {
      var heads = Math.random() > 0.5;
      if (heads) {
        return game.betting.raise;
      } else {return game.betting.call}
    }
  }
