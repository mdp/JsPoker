module.exports = {
  name: "I break stuff",
  update: update,
};

function update(game) {
  return game.self.chips / 0;
}
