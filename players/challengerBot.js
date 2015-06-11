module.exports = function () {

  var info = {
    name: "SpyGlass",
    email: "locus104@yahoo.com",
    btcWallet: "N/A"
  };

  function update(game) {
    if (game.state !== "complete") {
      switch(game.state) {
        case 'pre-flop':
          bet = 50;
          // bet = evaluate_preflop(hand, game, bigblind);
          break;

        case 'flop':
          bet = 50;
          break;
          
        case 'turn':
          bet = 75;
          break;

        case 'river':
          bet = 100;
          break;
      }
        return bet
    }
  }

  return { update: update, info: info }

}
