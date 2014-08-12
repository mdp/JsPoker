module.exports = function () {

  var info = {
    name: "edi9999",
    email: "hipp.edg@gmail.com",
    btcWallet: "NONE"
  };
//helper library
    function Card (card) {
    this.card = card;
    this.value = this.getValue();
    this.suit = card[1];
    }
    Card.prototype.getValue = function() {
        if (!isNaN(this.card[0])) {
            return this.card[0];
        }else{
            if (this.card[0] == 'A') {
                return 16;
            } else if(this.card[0] == 'K'){
                return 14;
            }else if(this.card[0] == 'Q'){
                return 12;
            }else{
                return 11;
            }
        }
    }
    //Hand Object
    function Hand(cards){
        this.cards = cards;
        this.cards = this.sortCards(this.cards);
    }
    Hand.prototype.sortCards = function(cardArray) {
        if (cardArray[0].getValue() < cardArray[1].getValue()) {
            return Array(cardArray[1],cardArray[0]);
        };
        return cardArray;
        }
    Hand.prototype.isPair = function() {
    	if (this.cards[0].getValue() === this.cards[1].getValue()) {
    		return true;
    	}else{
    	return false;
    	}
    }
    Hand.prototype.isStrong = function() {
    	if(this.isPair() && this.cards[0].getValue() >= 9){
    		return true;
    	}else if(this.cards[1].getValue() >= 11){
    		return true;
    	}
    }
    //end Hand object
    //sick strats
        function preflopStrategy (hand,table) {
        	//Dealing with preflop value shoves
        	if(table.betting.call > 500){
        		if(hand.isPair() && hand.cards[0].getValue() >= 13){
        			return table.self.chips;
        		}else{
        			return -1;
        		}
        	}else{
    			if (hand.isStrong()) {
    				return table.betting.call * 4;
    			}
        	}
        }
   		function getPlayers(table){
   			var players = 0;
   			for (var i = 0; i < table.players.length; i++) {
   				if(table.players[i].chips != 0){
   					players++
   				}
   			};
   			return players;
   		}
//End library
  function update(game) {
    if (game.state !== "complete") {
      var card1 = new Card(game.self.cards[0]);
      var card2 = new Card(game.self.cards[1]);
      var myHand = new Hand([card1,card2]);
      if (game.state === 'pre-flop') {
      	return preflopStrategy(myHand,game);
      }else if (game.state === 'flop') {
      	//Check if we made a pair
      	var card3 = new Card(game.community[0]);
      	var card4 = new Card(game.community[0]);
      	var card5 = new Card(game.community[0]);
      	var pairArray = Array(card3,card4,card5);
      	var shoveFlop = false;
        bestCommunityCard=0;
        bestPair=0;
      	for (var i = 0; i < pairArray.length; i++) {
            bestCommunityCard=Math.max(bestCommunityCard,pairArray[i].getValue());
      		if(card1.getValue() == pairArray[i].getValue() || card2.getValue() == pairArray[i].getValue()){
                bestPair=Math.max(pairArray[i].getValue(),bestPair);
      		}
      	}
        if (bestPair==0) { // no pair
            return 10; //cbet
        }
        if (bestPair==bestCommunityCard){ //top pair
            return game.self.chips;//shove
        }
        return 20;
      }else{
      	return 0;
      }

    }
  }

  return { update: update, info: info }

}
