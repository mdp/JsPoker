module.exports = function () {

    var info = {
        name: 'blaBot',
        email: 'blake@blakeowens.com',
        btcWallet: '1AyuzcTWwSc3EGBDbGuuagBbysD4XUDBLa'
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
        if (!this.isStraight() || !this.isFlush()) { return false; }

        var vals = this.cards.map(function(card) { return card.getValue(); });

        return this.getHighCard() === 14;
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
            previousCard = 0;

        return vals.every(function(val) {
            if (!previousCard || (previousCard + 1 === val || (val === 14 && previousCard === 5))) {
                previousCard = val;
                return true;
            } else {
                return false;
            }
        });
    };

    Hand.prototype.isTrips = function() {
        return this.getSameValueCount() === 3;
    };

    Hand.prototype.isTwoPair = function() {
        var pairCount = 0,
            _this = this;

        Object.keys(this.organized.values).forEach(function(key) {
            if (_this.organized.values[key].length > 2) { pairCount++; }
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

    Hand.prototype.getPotential = function(state) {
        switch (state) {
            case 'pre-flop':
                if (this.isPair() && this.getHighCard() >= 10) return 100;
                if (this.getHighCard() >= 10) return -1;
                if (this.isPotentialFlush(2)) return -1;
                if (this.isPotentialStraight(2)) return -1;
                break;
            case 'flop':
                if (this.isPotentialFlush(4)) return -1;
                if (this.isPotentialStraight(4)) return -1;
                break;
            case 'river':
                if (this.isPotentialFlush(4)) return -1;
                if (this.isPotentialStraight(4)) return -1;
                break;
            case 'turn':
                if (this.isPair() && this.getHighCard() >= 12) return -1;
                break;
        }

        return 0;
    };

    Hand.prototype.getStrength = function(state) {
        if (this.isRoyalFlush()) return 100;
        if (this.isStraightFlush()) return 99;
        if (this.isQuads()) return 95;
        if (this.isFullHouse()) return 80;
        if (this.isFlush()) return 60;
        if (this.isStraight()) return 0;
        if (this.isTrips()) return 0;
        if (this.isTwoPair()) return 0;
        
        return this.getPotential(state);
    };

    function Player(table) {
        this.game = table.game;
        this.table = table;
        this.betting = this.game.betting;
        this.player = this.game.self;

        this.hand = new Hand(this.player.cards.concat(this.game.community));
        this.communityHand = new Hand(this.game.community);
    }

    Player.prototype.getHandStrength = function() {
        return this.hand.getStrength(this.game.state);
    };

    Player.prototype.getAction = function() {
        var str = this.getHandStrength(),
            toCall = this.betting.call,
            multiplier = parseFloat(str / 100),
            chipLeader = this.table.getChipLeader(),
            raiseAmount = chipLeader.chips * multiplier;

        if (str === -1) return toCall >= this.player.chips * 0.1 ? 0 : toCall;
        if (!str) return 0;

        if (this.betting.canRaise) {
            if (raiseAmount < toCall) return toCall;
            return raiseAmount;
        } else {
            return toCall;
        }
    };

    function Table(game) {
        this.game = game;
    }

    Table.prototype.getChipLeader = function() {
        var leader = { chips: 0 };

        this.game.players.forEach(function(player) {
            if (player.chips > leader.chips) leader = player;
        });

        return leader;
    };

    function update(game) {
        var table = new Table(game),
            player = new Player(table);

        if (game.state !== 'complete') return player.getAction();
    }

    return {
        update: update,
        info: info
    };

};
