module.exports = function() {
    var info = {
        name: "Tollus",
        email: "tollus@dragonchaos.com",
        btcWallet: "1L2xgEDpHLmku8HX6amCNw33EZoacy3uKf"
    };

    function handTotal(community, cards) {
        var fullHand = cards.concat(community);

        sortCards(fullHand);

        var straight = isStraight(fullHand);
        var flush = isStraight(fullHand);
        var sameCards = countSame(fullHand);

        if (straight && flush) return 10;
        if (sameCards.length === 1 && sameCards[0] === 4) return 9;
        if (sameCards.length === 2 && sameCards[0] === 3 && sameCards[1] === 2) return 8;
        if (flush) return 7;
        if (straight) return 6;
        if (sameCards.length === 1 && sameCards[0] === 3) return 5;
        if (sameCards.length === 2 && sameCards[0] === 2 && sameCards[1] === 2) return 4;
        if (sameCards.length === 1 && sameCards[0] === 2) return 2;
        return 1;
    }

    function cardValue(c) {
        if (c === 'T') return 10;
        if (c === 'J') return 11;
        if (c === 'Q') return 12;
        if (c === 'K') return 13;
        if (c === 'A') return 14;
        return +c;
    }

    function sortCards(cards) {
        cards.sort(function(a, b) {
            return cardValue(a[0]) - cardValue(b[0]);
        });
    }

    function countSame(cards) {
        var cardCount = [];
        cards.forEach(function (x){
            var value = cardValue(x[0]);
            cardCount[value] = (cardCount[value] || 0) + 1;
        });

        var result = [];
        cardCount.forEach(function (x, index) {
            if (x > 1) {
                result.push(x);
            }
        });
        result.reverse();
        return result;
    }

    function isFlush(cards) {
        var suit = cards[0][1];
        return cards.every(function(x) {
            return suit == x[1];
        });
    }

    function isStraight(cards) {
        var last = -1;

        return cards.every(function(x) {
            var value = cardValue(x[0]);
            if (last === -1 ||
                (last + 1 === value || value === 14 && last === 5)) {
                last = value;
                return true;
            }
            return false;
        });
    }

    function update(game) {
        var wager;
        if (game.state !== "complete") {
            var wager = game.betting.call
            var rank = handTotal(game.community, game.self.cards);
            switch (game.state) {
                case 'pre-flop':
                    break;

                case 'flop':
                case 'turn':
                case 'river':
                    if (rank < 1)
                        return 0;
                    else if (rank > 4)
                        return game.betting.raise * (rank - 3);
                    break;
            }
            return wager;
        }
    }

    return {
        update: update,
        info: info,
        test: {
            handTotal: handTotal,
            isStraight: isStraight,
            isFlush: isFlush,
            countSame: countSame,
            cardValue: cardValue,
            sortCards: sortCards
        }
    };

};
