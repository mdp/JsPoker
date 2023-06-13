module.exports = {
  update: update,
  name: "callBot",
}
  function update(game) {
    if (game.state !== "complete") {
      return game.betting.call
    }
  };

