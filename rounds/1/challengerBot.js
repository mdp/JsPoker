module.exports = {
  update: update,
  name: "challengeBot",
}

  function update(game) {
    if (game.state !== "complete") {
      return game.self.chips
    }
  }
