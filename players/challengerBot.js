module.exports = function () {

    var info = {
        name: 'samuelhei',
        email: 'ti.samuelh@gmail.com',
        btcWallet: '1NR9tyn8tAn6nuQzosaZ2SkfT38PLxN5mf'
    };

    function Card(card) {
        this.card = card;
        this.suit = this.getSuit();
        this.value = this.getValue();
    }

    Card.prototype.getSuit = function() {
        var suit = this.card.charAt(1);

        switch (suit) {
            case 'c':
                return 'club';
            case 's':
                return 'spade';
            case 'd':
                return 'diamond';
            case 'h':
                return 'heart';
        }
    };

    Card.prototype.getValue = function() {
        var val = this.card.charAt(0);

        if (!isNaN(Number(val))) { return parseInt(val, 10); }

        switch (val) {
            case 'T':
                return 10;
            case 'J':
                return 11;
            case 'Q':
                return 12;
            case 'K':
                return 13;
            case 'A':
                return 14;
        }
    };

    function Hand(cards) {
        this.cards = cards.map(function(card) { return new Card(card); });
        this.sortCards();
        
        this.organized = this.organizeHand();
    }

    Hand.prototype.sortCards = function() {
        this.cards.sort(function(a, b) {
            return a.getValue() - b.getValue();
        });
    };
    
    Hand.prototype.getStrength = function(state) {
        state = state ? state : 'turn';
        
        if(this.isRoyalFlush() || this.isStraightFlush() || this.isQuads()) {
            return 'great';
        }
        else {
            if(this.isFullHouse() || this.isFlush()) {
                return 'good';
            }
            else {
               
                if(this.isStraight() || this.isTrips()) {
                    return 'ok';
                }   
                else {
                    if(this.isTwoPair() || this.isPair()) {
                            return 'avg';
                    }
                    else {
                        return 'bad';
                    }
                }
            }
        }
    };
    
    Hand.prototype.haveChance = function(){
        return (this.isPotentialFlush(4) || this.isPotentialStraight(4));
    };

    Hand.prototype.organizeHand = function() {
        var organized = {
            suits: {
                spades: [],
                clubs: [],
                hearts: [],
                diamonds: []
            },
            values: {
                2: [], 3: [], 4: [], 5: [], 6: [],
                7: [], 8: [], 9: [], 10: [], 11: [],
                12: [], 13: [], 14: []
            }
        };

        this.cards.forEach(function(card) {
            organized.suits[card.getSuit() + 's'].push(card);
            organized.values[card.getValue()].push(card);
        });

        return organized;
    };

    Hand.prototype.isRoyalFlush = function() {
        return this.getHighCard() === 14 && this.isStraightFlush();
    };

    Hand.prototype.isStraightFlush = function() {
        return this.isFlush() && this.isStraight();
    };

    Hand.prototype.isQuads = function() {
        return this.getSameValueCount() === 4;
    };

    Hand.prototype.isFullHouse = function() {
        var hasTrips = false,
            hasPair = false,
            _this = this;

        Object.keys(this.organized.values).forEach(function(key) {
            if (_this.organized.values[key].length === 2) { hasPair = true; }
            if (_this.organized.values[key].length === 3) { hasTrips = true; }
        });

        return hasPair && hasTrips;
    };

    Hand.prototype.isFlush = function() {
        return this.getSameSuitCount() === 5;
    };

    Hand.prototype.isStraight = function() {
        var vals = this.cards.map(function(card) { return card.getValue(); }),
            previousCard = 0,
            cardsInHand = this.cards.length,
            cards = [],
            diff;

        if (cardsInHand < 5) return false;

        return vals.some(function(val) {
            previousCard = cards[cards.length - 1];
            diff = null;
            if (previousCard) { diff = val - previousCard; }
            if (diff > 1) {
                cards = [];
                cards.push(val);
            } else if (diff === 1) {
                cards.push(val);
            }
            if (cards.length === 5) return true;
        });
    };

    Hand.prototype.isTrips = function() {
        return this.getSameValueCount() === 3;
    };

    Hand.prototype.isTwoPair = function() {
        var pairCount = 0,
            _this = this;

        Object.keys(this.organized.values).forEach(function(key) {
            if (_this.organized.values[key].length === 2) { pairCount++; }
        });

        return pairCount === 2;
    };

    Hand.prototype.isPair = function() {
        return this.getSameValueCount() === 2;
    };

    Hand.prototype.getHighCard = function() {
        var vals = this.cards.map(function(card) { return card.getValue(); });
        return Math.max.apply(null, vals);
    };

    Hand.prototype.getSameValueCount = function() {
        var sameValueCount = 0,
            _this = this;

        Object.keys(this.organized.values).forEach(function(key) {
            if (_this.organized.values[key].length > sameValueCount) {
                sameValueCount = _this.organized.values[key].length;
            }
        });

        return sameValueCount;
    };

    Hand.prototype.getSameSuitCount = function() {
        var sameSuitCount = 0,
            _this = this;

        Object.keys(this.organized.suits).forEach(function(key) {
            if (_this.organized.suits[key].length > sameSuitCount) {
                sameSuitCount = _this.organized.suits[key].length;
            }
        });

        return sameSuitCount;
    };

    Hand.prototype.isPotentialStraight = function(cardsRequired) {
        var vals = this.cards.map(function(card) { return card.getValue(); }),
            previousCard = 0,
            matches = 0;

        // this could use some work
        vals.forEach(function(val) {
            if (~vals.indexOf(val + 1)) matches++;
        });

        return matches >= cardsRequired;
    };

    Hand.prototype.isPotentialFlush = function(cardsRequired) {
        return this.getSameSuitCount() >= cardsRequired;
    };
    
    Hand.prototype.sum = function() {
        var vCard1 = this.cards[0].getValue();
        var vCard2 = this.cards[1].getValue();
        
        return (vCard1 + vCard2);
    }
        //end Hand object
        //sick strats

    

    function Player(self, table) {
        this.table = table;
        this.bets = this.table.getBets();
        this.player = self;

        this.hand = new Hand(this.player.cards.concat(this.table.getCommunity()));
    }

    Player.prototype.getHandStrength = function() {
        return this.hand.getStrength(this.table.getState());
    };
    
    Player.prototype.getHaveChance = function() {
        return this.hand.haveChance();
    };
    
    Player.prototype.evaluatePlayers = function(){
        var players = this.table.players;
        var nPlayers = 0;
        var vPlayers = 0;
        
        for(var p =0;p<players.length;p++) {
            if(players[p].chips > 0 && players[p].state == 'active') {
                ++nPlayers;
                vPlayers += players[p].chips;
            }
        }
        return Math.round(vPlayers/nPlayers);
    };

    Player.prototype.getBet = function() {
        var toCall = this.bets.call;
        var avg = this.evaluatePlayers();
        var chips = this.player.chips > avg ? avg : this.player.chips;
        
        var porcent = (this.player.wagered + toCall) / chips;
        
        var toRaise = 0;
        var extraCall = false;
        var extraCallMax = 0;
        
        switch (this.table.getState()) {
            case 'pre-flop':
                
                var sum = this.hand.sum();
                if(sum > 18) {
                    if((sum > 22 || this.hand.isPair())) {
                        toRaise = 0.05;
                        extraCallMax = 1;
                        extraCall = true;
                    }
                    else {
                        toRaise = 0.01;
                        extraCallMax = 0.11;
                        extraCall = true;
                    }
                }
                else {
                     if((sum > 10 || this.hand.isPair())) {
                        toRaise = 0.01;
                        extraCallMax = 0.05;
                        extraCall = true;
                    }
                    else {
                        extraCallMax = 0;
                        extraCall = false;
                    }
                }
                break;
            case 'flop':
            case 'turn':
                var strength = this.getHandStrength();
                
                if(strength == 'great' || strength == 'good') {
                    toRaise = 0.05;
                    extraCall = true;
                    extraCallMax = 1;
                }
                else {
                    if(strength == 'ok') {
                        toRaise = 0.01;
                        extraCall = true;
                        extraCallMax = 0.5;
                    }
                    else { 
                        if(strength == 'avg') {
                            toRaise = 0;
                            extraCall = true;
                            extraCallMax = 0.2;
                        }
                        else {
                            extraCall = true;
                            extraCallMax = 0.05;
                            toRaise = 0;
                        }
                    }
                    
                    if((strength == 'ok' || strength == 'avg') && this.table.getState() == 'flop' && this.getHaveChance()) {
                        extraCallMax = 1;
                        if(toRaise < 0.05) {
                            toRaise = 0.05;
                        }
                    }
                }
                break;
            
            case 'river':
                var strength = this.getHandStrength();
                 if(strength == 'great' || strength == 'good') {
                    toRaise = 1;
                    extraCall = true;
                    extraCallMax = 1;
                 }
                 else {
                     if(strength == 'ok') {
                        toRaise = 0.20;
                        extraCall = true;
                        extraCallMax = 0.5;
                     }
                     else { 
                        if(strength == 'avg') {
                            toRaise = 0.01;
                            extraCall = true;
                            extraCallMax = 0.1;
                        }
                        else {
                            toRaise = 0.01;
                            extraCall = false;
                            extraCallMax = 0;
                        }
                    }
                 }
                break;
        }
        
        
        if(porcent >= toRaise && porcent < extraCallMax) {
            toRaise = porcent + toRaise;
            if(toRaise > extraCallMax){
                toRaise = extraCallMax;
            }
        }

        if(porcent < toRaise) {
            var raise =  Math.round(chips * toRaise);
            if(raise < toCall) {
                return toCall;
            }
            else {
                return raise;
            }
        }
        else {
            if(extraCall) {
                if(toRaise == 1){
                    return toCall;
                }
                else {
                    if(porcent < extraCallMax) {
                        return toCall;
                    }    
                    else {
                        return 0;
                    }
                }
            }
            else {
                return 0;
            }
        }
    };

    function Table(game) {
        this.game = game;
        this.players = game.players;
    }

    Table.prototype.sortPlayers = function() {
        this.players.sort(function(a, b) {
            return b.chips - a.chips;
        });
    };

    Table.prototype.getChipLeader = function(rank) {
        rank = rank ? rank - 1 : 0;

        this.sortPlayers();

        return this.players[rank];
    };

    Table.prototype.getBigBlind = function() {
        var bigBlind = 0;

        this.players.forEach(function(player) {
            if (player.blind > bigBlind) bigBlind = player.blind;
        });

        return bigBlind;
    };

    Table.prototype.getState = function() {
        return this.game.state;
    };

    Table.prototype.getCommunity = function() {
        return this.game.community;
    };

    Table.prototype.getBets = function() {
        return this.game.betting;
    };

    function update(game) {
        var table = new Table(game),
            player = new Player(game.self, table);

        if (game.state !== 'complete') return player.getBet();
    }

    return {
        update: update,
        info: info
    };

};
