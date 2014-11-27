module.exports = function () {
	var info = {
		name: "status3Bot",
		email: "jspoker@attwood.org",
		btcWallet: "NONE"
	};

	var bets = {
		'raised': {
			'raise': {
				0 : {'hn': 'EC', 'pr': 'AA', 'cn': '--', 'su': '--', 'sc': '--'},
				1 : {'hn': 'ED', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				2 : {'hn': 'ED', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				3 : {'hn': 'ED', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				4 : {'hn': 'ED', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				5 : {'hn': '--', 'pr': 'CC', 'cn': '--', 'su': 'EC', 'sc': '--'},
				6 : {'hn': 'EC', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				7 : {'hn': 'ED', 'pr': 'BB', 'cn': '--', 'su': '--', 'sc': '--'},
				8 : {'hn': 'ED', 'pr': 'BB', 'cn': '--', 'su': '--', 'sc': '--'}
			},
			'call': {
				0 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'},
				1 : {'hn': 'EC', 'pr': '99', 'cn': '--', 'su': '--', 'sc': '--'},
				2 : {'hn': 'EC', 'pr': '88', 'cn': '--', 'su': '--', 'sc': '--'},
				3 : {'hn': '--', 'pr': '--', 'cn': '--', 'su': '--', 'sc': '--'},
				4 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'},
				5 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'},
				6 : {'hn': '--', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'},
				7 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'},
				8 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': 'EB', 'sc': 'DC'}
			}
		},
		'folded': {
			'raise': {
				0 : {'hn': 'D2', 'pr': '22', 'cn': '--', 'su': '74', 'sc': '65'},
				1 : {'hn': 'E8', 'pr': '22', 'cn': 'CB', 'su': '32', 'sc': '87'},
				2 : {'hn': '--', 'pr': '--', 'cn': '--', 'su': '--', 'sc': '--'},
				3 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': '--', 'sc': '--'},
				4 : {'hn': 'EB', 'pr': 'CC', 'cn': '--', 'su': '--', 'sc': '--'},
				5 : {'hn': 'EB', 'pr': '22', 'cn': '--', 'su': 'EA', 'sc': 'DC'},
				6 : {'hn': 'EB', 'pr': '22', 'cn': '--', 'su': 'EA', 'sc': 'DC'},
				7 : {'hn': 'E9', 'pr': '22', 'cn': 'CB', 'su': 'E8', 'sc': 'BA'},
				8 : {'hn': 'E6', 'pr': '22', 'cn': 'BA', 'su': 'D8', 'sc': '65'}
			}
		},
		'limpers': {
			'raise': {
				0 : {'hn': 'D2', 'pr': '22', 'cn': '--', 'su': '74', 'sc': '65'},
				1 : {'hn': 'CB', 'pr': '88', 'cn': 'CB', 'su': 'E8', 'sc': 'BA'},
				2 : {'hn': 'EB', 'pr': 'AA', 'cn': '--', 'su': '--', 'sc': 'DC'},
				3 : {'hn': 'EC', 'pr': '22', 'cn': '--', 'su': '--', 'sc': '--'},
				4 : {'hn': 'EB', 'pr': '22', 'cn': '--', 'su': '--', 'sc': '--'},
				5 : {'hn': 'EB', 'pr': '22', 'cn': '--', 'su': 'EA', 'sc': 'DC'},
				6 : {'hn': 'EB', 'pr': '55', 'cn': '--', 'su': 'EA', 'sc': 'DC'},
				7 : {'hn': 'DB', 'pr': '66', 'cn': 'CB', 'su': 'C8', 'sc': 'A9'},
				8 : {'hn': 'DB', 'pr': '66', 'cn': 'CB', 'su': 'D8', 'sc': 'A9'}
			}
		}
	};

	function Card(card) {
		this.card = card;
		this.value = "23456789TJQKA".indexOf(card[0]) + 2;
		this.hex = this.value.toString(16).toUpperCase();
		this.suit = card[1];
	}

	function Hand(cards) {
		this.cards = (cards[0].value < cards[1].value)? Array(cards[1], cards[0]) : cards;
		this.hex = "" + this.cards[0].hex + this.cards[1].hex;

		this.pair = this.cards[0].value === this.cards[1].value;
		this.suited = this.cards[0].suit === this.cards[1].suit;
		this.connected = this.cards[0].suit - this.cards[1].suit;
	}
    Hand.prototype.has_value = function(value) {
		return (this.cards[0].value == value) || (this.cards[1].value == value)
    }
    Hand.prototype.has_suit = function(suit) {
		return (this.cards[0].suit == suit) || (this.cards[1].suit == suit)
    }
    Hand.prototype.better_than = function(hand) {
		return (this.cards[0].hex >= hand[0].hex) && (this.cards[1].hex >= hand[1].hex)
    }

    function array_contains(hand, value) {
		var dup = false;
		for(i = 0;i < hand.length;i++) {
			if(hand[i].value == value) {
				dup = true;
				break;
			}
		}
		return dup;
	}

	function get_limpers(game, bigblind) {
		var limpers = 0;
		var position = game.self.position;

		game.players.forEach(function(player) {
			if(player.state == 'active' && player.wagered == bigblind) {
				limpers++;
			}
		});

		return limpers;
	}

	function get_bet(game, bet) {
		return game.betting.canraise? game.betting.call : (bet < game.self.chips? bet : game.self.chips);
	}

	function evaluate_hand(hand, game, bigblind) {
		var flop = Array();

		var cards = Array(hand.cards[0], hand.cards[1]);

		for(i = 0;i < game.community.length;i++) {
			card = new Card(game.community[i]);
			flop.push(card);
			cards.push(card);
		}

		var tsf = false;
		var sf = false;
		var foak = false;
		var fh = false;
		var flush = false;
		var straight = false;
		var toak = false;
		var tp = false;
		var tpair = false;
		var pair = false;

		var suits = Array();
		var counts = Array();
		var connected = Array();
		var values = Array();

		// ========================================
		// flush
		// ========================================
		cards.sort(function(a, b){return b.value - a.value});
		flop.sort(function(a, b){return b.suit - a.suit});

		suits = Array();
		t = 1;
		for(i = 0;i < flop.length - 1;i++) {
			current = flop[i].suit;
			if(current == flop[i + 1].suit) {
				t++;
			} else {
				suits.push({'suit': current, 'count': t});
				t = 1;
			}
		}
		suits.push({'suit': current, 'count': t});
		suits.sort(function(a, b){return b.count - a.count});

		if(suits[0].count >= 3 && hand.suited && hand.has_suit(suits[0].suit)) {
			flush = true;
		} else if(suits[0].count >= 4 && hand.has_suit(suits[0].suit)) {
			flush = true;
		}
		// ========================================

		// ========================================
		// straight flush
		// ========================================
		if(flush) {
			var sfcards = Array();
			if(hand.cards[0].suit == suits[0].suit) {
				sfcards.push(hand.cards[0]);
			}

			if(hand.cards[1].suit == suits[0].suit) {
				sfcards.push(hand.cards[1]);
			}

			for(i = 0;i < game.community.length;i++) {
				card = new Card(game.community[i]);
				if(card.suit == suits[0].suit) {
					sfcards.push(card);
				}
			}

			sfconnected = Array();
			sfcards.sort(function(a, b){return b.value - a.value});

			t = 1;
			top = -1;
			for(var i = 0;i < sfcards.length - 1;i++) {
				current = sfcards[i].value;
				if(top == -1) {
					top = current;
				}

				if(current == sfcards[i + 1].value) {
					// same value, ignore it
				} else if(t == 4 && current == 2) {
					if(array_contains(sfcards, 14)) {
						t++;
					}
					break;
				} else if(current == sfcards[i + 1].value + 1) {
					t++;
				} else {
					sfconnected.push({'value': top, 'count': t});
					t = 1;
					top = -1;
				}
			}
			sfconnected.push({'value': top, 'count': t});
			sfconnected.sort(function(a, b){return b.count - a.count});

			count = sfconnected[0].count;
			top = sfconnected[0].value;
			bottom = top - (count - 1);

			if(count >= 5) {
				if(hand.has_value(top) && !array_contains(flop, top) && hand.has_value(top - 1) && !array_contains(flop, top - 1)) {
					tsf = true;
				} else {
					piece = 0;
					for(i = 0;i < 5;i++) {
						if(hand.has_value(bottom + i) && !array_contains(flop, bottom + i)) {
							piece++;
						}
					}

					// must have a piece of the straight flush
					if(piece == 1) {
						sf = true;
					} else if(piece == 2) {
						tsf = true;
					}
				}
			}
		}
		// ========================================

		// ========================================
		// straight
		// ========================================
		connected = Array();
		cards.sort(function(a, b){return b.value - a.value});

		t = 1;
		top = -1;
		for(var i = 0;i < cards.length - 1;i++) {
			current = cards[i].value;
			if(top == -1) {
				top = current;
			}

			if(current == cards[i + 1].value) {
				// same value, ignore it
			} else if(t == 4 && current == 2) {
				if(array_contains(cards, 14)) {
					t++;
				}
				break;
			} else if(current == cards[i + 1].value + 1) {
				t++;
			} else {
				connected.push({'value': top, 'count': t});
				t = 1;
				top = -1;
			}
		}
		connected.push({'value': top, 'count': t});
		connected.sort(function(a, b){return b.count - a.count});

		count = connected[0].count;
		top = connected[0].value;
		bottom = top - (count - 1);

		if(count >= 5) {
			if(hand.has_value(top) && !array_contains(flop, top) && hand.has_value(top - 1) && !array_contains(flop, top - 1)) {
				straight = true;
			} else if(hand.has_value(top) && !array_contains(flop, top)) {
				straight = true;
			} else {
				piece = 0;
				for(i = 0;i < 5;i++) {
					if(hand.has_value(bottom + i) && !array_contains(flop, bottom + i)) {
						piece++;
					}
				}

				// must have a piece of the straight
				if(piece) {
					straight = true;
				}
			}
		}
		// ========================================

		// ========================================
		// pair(s), full house, 3+4 of a kind
		// ========================================
		cards.sort(function(a, b){return b.value - a.value});

		counts = Array();
		var t = 1;
		for(i = 0;i < cards.length - 1;i++) {
			current = cards[i].value;
			if(current == cards[i + 1].value) {
				t++;
			} else {
				counts.push({'value': current, 'count': t});
				t = 1;
			}
		}
		counts.push({'value': current, 'count': t});
		counts.sort(function(a, b){return b.count - a.count});

		pairs = 0;
		piece = 0;
		toppair = false;
		for(i = 0;i < counts.length;i++) {
			if(counts[i].count < 2) {
				break;
			}

			if(counts[i].count == 2) {
				pairs++;

				if(hand.has_value(counts[i].value)) {
					top = (i == 0);
					piece++;
				}
			}
		}

		if(counts[0].count == 4 && hand.has_value(counts[0].value)) {
			foak = true;
		} else if(counts[0].count == 3 && counts[1].count == 2 && (hand.has_value(counts[0].value) || hand.has_value(counts[1].value))) {
			fh = true;
		} else if(counts[0].count == 3 && hand.has_value(counts[0].value)) {
			toak = true;
		} else if(pairs >= 2) {
			// must have a piece of one of them
			if(piece) {
				tp = true;
			}
		} else if(hand.pair) {
			pair = true;
			if(hand.cards[0].value > flop[0].value) {
				tpair = true;
			}
		} else if(pairs == 1) {
			// must have a piece of the pair
			if(piece) {
				pair = true;
				if(hand.has_value(flop[0].value)) {
					tpair = true;
				}
			}
		}
		// ========================================

		var valuev = 0;
		if(tsf) {
			value = 110;
		} else if(sf) {
			value = 100;
		} else if(foak) {
			value = 90;
		} else if(fh) {
			value = 70 + hand.cards[1].value;
		} else if(flush) {
			value = 60 + hand.cards[1].value;
		} else if(straight) {
			value = 50 + hand.cards[1].value;
		} else if(toak) {
			value = 40;
		} else if(tp) {
			value = 30;
		} else if(tpair) {
			value = 20;
		} else if(pair) {
			value = 15;
		} else {
			value = hand.cards[0].value;
		}

		var multiplier = Math.pow(2, (game.community.length - 3));
		var bet;

		if(value > 100) {
			bet = game.self.chips;
		} else if(value >= 70) {
			bet = Math.max(game.betting.call, multiplier * 6 * bigblind);
			if(game.self.wagered > game.self.chips / 2) {
				bet = game.self.chips;
			}
		} else if(value > 40) {
			bet = Math.max(game.betting.call, multiplier * 3 * bigblind);
		} else if(value < 13) {
			bet = 0;
		} else if(value == 14) {
			bet = Math.min(game.betting.call, multiplier * bigblind);
		} else {
			var position = game.self.position;
			if(game.betting.call == 0) {
				bet = bigblind * position;
			} else {
				bet = bigblind;
			}
		}

		return bet;
	}

	function evaluate_preflop(hand, game, bigblind) {
		var count = game.players.length;
		var limpers = get_limpers(game, bigblind);
		var raised = game.betting.call > ((game.self.wagered > 0)? 0 : bigblind);
		var position = game.self.position - 1;

		var index = raised? 'raised' : (limpers? 'limpers' : 'folded');

		var action_so_far = Array('raised', 'folded', 'limpers');
		var hand_type = Array('hn', 'pr', 'cn', 'su', 'sc');

		for(i = 0;i < action_so_far.length;i++) {
			for(j = 0;j < hand_type.length;j++) {
				var match = false;

				switch(j) {
					case 'hn':
						match = true;
						break;

					case 'pr':
						match = hand.pair;
						break;

					case 'cn':
						match = (hand.connected == 1);
						break;

					case 'su':
						match = hand.suited;
						break;

					case 'sc':
						match = (hand.suited && (hand.connected == 1));
						break;
				}

				if(match)
				{
					if(hand.better_than(bets[index]['raise'][i][position][j]))
					{
						return get_bet(game, 3 * game.betting.call);
					}

					if(action_so_far == 'raised')
					{
						if(hand.better_than(bets[index]['call'][i][position][j]))
						{
							return get_bet(game, 3 * game.betting.call);
						}
					}
				}
			}
		}

		return Math.min(bigblind, game.betting.call);
	}

	function update(game) {
		var bet = 0;

		if(game.state != 'complete') {
			var bigblind = 0;
			game.players.forEach(function(player) {
				if(player.blind > bigblind) {
					bigblind = player.blind;
				}
			});

			if(game.self.state == 'active') {
				var card1 = new Card(game.self.cards[0]);
				var card2 = new Card(game.self.cards[1]);
				var hand = new Hand([card1, card2]);

				switch(game.state) {
					case 'pre-flop':
						bet = evaluate_preflop(hand, game, bigblind);
						break;

					case 'flop':
					case 'turn':
					case 'river':
						bet = evaluate_hand(hand, game, bigblind);
						break;
				}
			}
		}

		return bet;
	}

	return {update: update, info: info};
}
