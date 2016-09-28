module.exports = function () {

  var info = {
    name: "evBot",
    email: "evbot@noman.land",
    btcWallet: "nil"
  };
  
  // Haxx - get submodule on old node
  // I hope these don't count as "external modules"
  // as they come with the game engine
  var mp = require.cache[require.resolve('machine-poker')]
  var hoyle = mp.require('hoyle')
  var Hand = hoyle.Hand;
  var deck = new (hoyle.Deck)().cards;
  
  // increadably bad card dealer
  function randCard(used) {
    while(true) {
      var card = deck[Math.floor(Math.random()*deck.length)].toString();
      if(used.indexOf(card) == -1)
      {
        used.push(card);
        return card;
      }
    }
  }
  
  // slowest game simulator on the planet
  // needs serious optimizations
  function simulate(hand, community, opponents, iterations) {
    var wins = 0;
    var games = 0;
    var used = hand.concat(community);
    
    for(games=0; games<iterations; games++) {
      var _community = community.slice();
      var _used = used.slice();
      
      while(_community.length < 5) _community.push(randCard(_used));
      
      var hero = Hand.make([].concat(hand).concat(_community));
      var players = [hero];
      
      for(var op=0; op<opponents; op++)
        players.push(Hand.make([].concat(_community).concat([randCard(_used), randCard(_used)])));
      
      var winners = Hand.pickWinners(players);
      if(winners.length == 1 && winners[0] == hero)
        wins++;
    }
    
    return wins / games;
  }
  
  function update(game) {
    if (game.state !== "complete") {
      
      // settings
      // I can't believe it still works with these
      // simulation results are just above random
      var aggression = 1;
      var opponent_cap = 1;
      var sim_iterations = 15;
      
      // if you have a proper simulator... these will do much better
      //var aggression = 1.25;
      //var opponent_cap = 2;
      //var sim_iterations = 1000;
      
      // calculate pot size
      var pot = 0;
      game.players.map(function(p) { return pot += parseFloat(p.wagered); });
      
      // compensate for horrible pre-flop and flop
      // reducing opponent count increases simulation winning odds
      var num_opponents = game.players.filter(function(p) { return p.state == 'active'; }).length;
      var sim_opponents = Math.min(num_opponents, opponent_cap);
      
      // calculate winning odds
      var odds = simulate(game.self.cards, game.community, sim_opponents, sim_iterations);
      
      // set bet
      // I have no idea if this is actually a good strategy or
      // if it's just good against these basic bots
      return pot * odds * aggression;
    }
  }

  return { update: update, info: info };
  
};
