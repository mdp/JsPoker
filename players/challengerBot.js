module.exports = function () {

  var info = {
    name: "Nameless Challenger",
    email: "",
    btcWallet: ""
  };

  function update(game) {
    if (game.state !== "complete") {
      return game.betting.call
    }
  }

  return { update: update, info: info }

}
