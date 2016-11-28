function checkShove(cards) {
  //variables
  var returnMe = false;
  var goodCards = ['A', 'K', 'Q', 'J', '10'];
  //check if we have  a high pair


    for(var i = 0; i < goodCards.length; i++) 
    {
      if(cards[0][0] == goodCards[i] && cards[1][0] == goodCards[i])
      {
      returnMe = true;
      }
    }
  return returnMe;
}

module.exports = function () {

  var info = {
    name: "kingOfTheNits",
    email: "robertbcorey@gmail.com",
    btcWallet: "1CS1kxZmNG4LqosnT4Jn7zocQxfV9iHCNQ"
  };

  function update(game) {
    if (game.state !== "complete") {
      if(checkShove(game.self.cards) == true) {
        wager = game.self.chips;
      }else {
        wager = 0;
      }
    return wager;  
    }
  }

  return { update: update, info: info }

}
