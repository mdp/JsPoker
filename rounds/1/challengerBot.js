module.exports = function () {

  var info = {
    name: "Nameless Challenger",
    email: "",
    btcWallet: ""
  };

  function update(game) {
    if (game.state !== "complete") {
      return game.self.chips
    }
  }

  return { update: update, info: info }

}
