Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}
module.exports = function () {
var isPair = function(cards) {
  return cards[0][0] == cards[1][0];
}
var isSuited = function(cards) {
  return cards[0][1] == cards[1][1];
}
var floppedAPair = function(mycards, community) {
  var allcards = [];
  allcards.push(community[0][0])
  allcards.push(community[1][0])
  allcards.push(community[2][0])
  allcards.push(mycards[0][0]);
  allcards.push(mycards[1][0]);
  var uniq = allcards.getUnique();
  /*
    strength = 0      no pair
    strenght = 1      pair
    strength = 2      triiiips
    strength = 3      quads
  */
  var strength = allcards.length - uniq.length;
  return strength + flushdraw(mycards, community);

}
var flushdraw = function(mycards, community) {
  var allcards = [];
  allcards.push(community[0][1])
  allcards.push(community[1][1])
  allcards.push(community[2][1])
  allcards.push(mycards[0][1]);
  allcards.push(mycards[1][1]);
  var uniq = allcards.getUnique();
  /*
    strenght = 0      rainbow, total shit
    strength = 1      2-flush, total shit
    strength = 2      3-flush, can make runner runner
    strength = 3      4-flush, flush draw!
    strength = 4      flopped a flush. take the money!
    currently, we only bet a flopped flush!
  */
  var strength = allcards.length - uniq.length;
  if (strength == 4) {
    return 5;
  }
  else {
    return 0;
  }
}
var preflopStrength = function(cards) {
  var card1 = cards[0][0],
      card2 = cards[1][0];
  var strengths = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'T': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 15
  }
  var value_strength = strengths[card1] + strengths[card2];
  var strength = value_strength;
  if (isPair(cards)) {
    var strength = strength*2;
  }
  if (isSuited(cards)) {
    var strength = strength+2
  }
  return strength;
}
var info = {
  name: "FlopASetBot",
  email: "jonathanburger11@gmail.com",
  btcWallet: "1JfK4EHYXiwTYPtMuW4mzECiQA5udREFZB"
};
var lastflopstrength;
function update(game) {
  if (game.state == "pre-flop") {
    /*
      "Fold preflop." 
      -Chris Ferguson
    */
      var strength = preflopStrength(game.self.cards);
      if (strength < 16) return 0;
      if (strength >= 16 && strength <= 25) return game.betting.call;
      if (strength >  25 && game.betting.canRaise) {return game.betting.raise} else { return game.betting.call }; 
  }
  if (game.state == "flop") {
      var strength = floppedAPair(game.self.cards, game.community)
      var lastflopstrength = strength;
      /*
        No pair, fold
      */
      if (strength == 0) {return 0};
      /*
        Made a pair, call
      */
      if (strength == 1) return game.betting.call;
      /*
        Made trips or quads, raise
      */
      if (strength >  1 && game.betting.canRaise) {return game.betting.raise} else { return game.betting.call }; 
  }
  if (game.state == "turn" || game.state == "river") {
    if (lastflopstrength == 1) return game.betting.call;
    if (lastflopstrength > 1) return game.betting.raise*lastflopstrength;
  }
  if (game.state !== "complete") {
    return game.betting.call
  }
}

return { update: update, info: info }
}

