module.exports = function() {

  // {{{ TWEAKABLES
  // co-efficients for strategies
  var CONFIDENT=2;
  var MIDDLING=1.25;
  var PADDLING=0.75;

  var CONFIDENT_THRESHOLD = 100;
  var MIDDLING_THRESHOLD = 60;
  var PADDLING_THRESHOLD = 30;
  var RISK_THRESHOLD = 2.5;
  var LUCK_UPPER_THRESHOLD = 10;
  var LUCK_LOWER_THRESHOLD = 0;

  var DRAG_THRESHOLD = 100;

  var SHOVE_THRESHOLD = 300; // How many chips to raise before we think a shove is happening

  var LUCK_MITIGATION=0.1;
  var RISK_MITIGATION=0.1;
  var SHOVE_MITIGATION=0.1;

  // PRE FLOP HAND VALUATIONS
  var AK_PAIR_PRE = 100;
  var AK_CONN_PRE = 90;
  var QJ_PAIR_PRE = 90;
  // Ten Pair
  var T_PAIR_PRE = 70;
  // Royal connected
  var R_CONN_PRE = 50;

  // POST FLOP HAND VALUATIONS
  var HIGH_STRAIGHT_POST = 120;
  var FULLHOUSE_POST = 100;
  var FLUSH_POST = 90;
  var OVERPAIR_POST = 90;
  var TOPPAIR_POST = 80;

  // RISK VALUATIONS
  var STRAIGHT_RISK = 60;
  var FLUSH_RISK = 60;
  var FULLHOUSE_RISK = 50;
  var DRAW_RISK = 20;
  var PAIR_RISK = 20;
  var TOPCARD_RISK = 20;
  var LOWPAIR_RISK = 15;
  // }}}

  // {{{ PLAYER INFO / CONFIG
  var info = {
    name: "Wittgenstein",
    email: "lwittgenstein89@gmail.com",
    btcWallet: "nopromo"
  };
  // }}}

  // {{{ DEBUG PRINTER
  var DEBUG = process.env.DEBUG;
  function dprint() {
    if (!DEBUG) { return; }

    var prints = "";
    for (var i = 0; i < arguments.length; i++) { prints += arguments[i] + " "; }
    console.log(prints);
  }
  // }}}

  // {{{ HAND EVALUATION HELPERS
  var isPair = function(hand) {
    return hand[0][0] === hand[1][0];
  };

  // From edibot?
  function evaluateHand(community, cards) {
    var fullHand = cards.concat(community);

    sortCards(community);
    sortCards(fullHand);

    var communityWorst = community[0];
    var communityBest = community[community.length - 1];

    var straight = isStraight(fullHand);
    var flush = isFlush(fullHand);
    var sameCards = countSame(fullHand);

    var pairs = 0;
    var triples = 0;
    var fours = 0;

    sameCards.forEach(function(card) {
      if (card.count === 2) { pairs++; }
      if (card.count === 3) { triples++; }
      if (card.count === 4) { fours++; }
    });

    var fullhouse_dist = -3;
    if (pairs) { fullhouse_dist = -2; }
    if (triples) { fullhouse_dist = -1; }
    if (pairs > 1) { fullhouse_dist = -1; }
    if (triples && pairs) { fullhouse_dist = 1; }

    var ret = {
      straight: straight,
      flush: flush,
      sameCards: sameCards,
      foak: fours > 0,
      toak: triples > 0,
      pair: pairs > 0,
      highcard: fullHand[fullHand.length - 1],
      lowcard: fullHand[0],
      lowpair: 0,
      topcard: false,
      botcard: false,
      fullhouse: fullhouse_dist > 0 ? 1 : fullhouse_dist
    };

    var ofakind = false;
    if (cards.length > 1) {
      // look for overpair
      if (communityBest) {
        if (isPair(cards)) {
          if (cardValue(cards[0]) > cardValue(communityBest)) { ret.overpair = true; }

          sameCards.forEach(function(card) {
            if (card.value > cardValue(cards[0])) { ret.lowpair += 1; }
          });

          if (community.length < 5) { ret.lowpair += (0.5 * (5 - community.length)); }
        }

        if (cardValue(communityBest) === cardValue(cards[0]) ||
            cardValue(communityBest) === cardValue(cards[1])) {
          ret.toppair = true;
        }

        if (cardValue(communityBest) <= cardValue(cards[0]) ||
          (cardValue(communityBest) <= cardValue(cards[1]))) {
          ret.topcard = true;
        }
      }

      // set (pocket pair + card on board)
      if (isPair(cards)) {
        sameCards.forEach(function(sameCard) {
          if (sameCard.value === cardValue(cards[0]) && sameCard.count > 2) {
            ofakind = true;
          }
        });

        if (ofakind) {
          ret.setpair = true;
        }

      }
    }

    return ret;
  }

  function cardValue(c) {
    c = c[0];

    if (c === 'T') return 10;
    if (c === 'J') return 11;
    if (c === 'Q') return 12;
    if (c === 'K') return 13;
    if (c === 'A') return 14;
    return +c;
  }

  function sortCards(cards) {
    cards.sort(function(a, b) {
      return cardValue(a) - cardValue(b);
    });
  }

  function countSame(cards) {
    var cardCount = [];
    cards.forEach(function(x) {
      var value = cardValue(x);
      cardCount[value] = (cardCount[value] || 0) + 1;
    });

    var result = [];
    cardCount.forEach(function(x, index) {
      if (x >= 1) {
        result.push({
          value: index,
          count: x
        });
      }
    });
    result.reverse();
    return result;
  }

  function isFlush(cards) {
    var suits = {};
    var flush = false;
    var maxcount = 0;
    cards.forEach(function(x) {
      var suit = x[1];
      suits[suit] = (suits[suit] || 0) + 1;

      if (suits[suit] >= 5) {
        flush = true;
      }

      maxcount = Math.max(maxcount, suits[suit]);
    });

    if (flush) {
      return 1;
    }

    return -(5 - maxcount);
  }

  function isStraight(cards) {
    var uniqueCards = {};
    cards.forEach(function(card) {
      uniqueCards[cardValue(card)] = 1;
      if (card[0] === 'A') { uniqueCards[1] = 1; }
    });

    uniqueCards = Object.keys(uniqueCards).map(function(c) { return parseInt(c, 10); });
    uniqueCards = uniqueCards.sort(function(a, b) { return a - b; });

    var dist = 7;
    for (var i = 0; i < uniqueCards.length; i++) {
      if (uniqueCards - i < 2) { continue; }
      var delta_2 = uniqueCards[i + 1] - uniqueCards[i];
      if (delta_2 <= 4) { dist = Math.min(dist, 3); }

      if (uniqueCards - i < 3) { continue; }
      var delta_3 = uniqueCards[i + 2] - uniqueCards[i];
      if (delta_3 <= 4) { dist = Math.min(dist, 2); }

      if (uniqueCards - i < 4) { continue; }
      var delta_4 = uniqueCards[i + 3] - uniqueCards[i];
      if (delta_4 <= 4) { dist = Math.min(dist, 1); }

      if (uniqueCards - i < 5) { continue; }
      var delta_5 = uniqueCards[i + 4] - uniqueCards[i];
      if (delta_5 <= 4) { dist = Math.min(dist, 0); }
    }

    if (dist === 0) { return 1; }
    return -dist;
  }

  var getPotSize = function(players) {
    var pot = 0;
    players.forEach(function(player) {
      pot += player.wagered;

    });

    return pot;
  };
  // }}} HAND EVALUATION HELPERS

  // {{{ HAND SCORE EVALUATION
  // For pre-flop, we only really play hands we think are good
  var getPreFlopHandScore = function(hand) {
    sortCards(hand);

    var is_pair = isPair(hand);
    var our_hand = hand[0][0] + hand[1][0];

    if (is_pair && "AK".match(hand[0][0])) { return AK_PAIR_PRE; }
    if (is_pair && "QJ".match(hand[0][0])) { return QJ_PAIR_PRE; }
    if (is_pair && "T".match(hand[0][0])) { return T_PAIR_PRE; }

    if ("KA" === our_hand) { return AK_CONN_PRE; }
    if ("TJQKA".match(our_hand)) { return R_CONN_PRE; }

    return 0;
  }

  // this function generates value from 0 - 100, but they aren't directly related to the handScore
  // look in TWEAKABLE at top of file to see the RISKs associated with different hands
  function getCommunityHandScore(game) {
    var modifier = 0;
    var communityData = evaluateHand(game.community, []);
    var handData = evaluateHand(game.community, game.self.cards);

    switch (communityData.straight) {
      case 0:
      case 1:
        modifier += STRAIGHT_RISK;
        break;
      case -1:
      case -2:
        modifier += STRAIGHT_RISK - DRAW_RISK;
    }

    switch (communityData.flush) {
      case 0:
      case 1:
        modifier += FLUSH_RISK;
        break;
      case -1:
      case -2:
        modifier += FLUSH_RISK - DRAW_RISK;

    }

    switch (communityData.fullhouse) {
      case 0:
      case 1:
        modifier += FULLHOUSE_RISK;
        break;
      case -1:
      case -2:
        modifier += FULLHOUSE_RISK - DRAW_RISK;

    }

    if (!modifier) {
      if (communityData.pair) { modifier += PAIR_RISK; }
      if (communityData.toak) { modifier += PAIR_RISK; }
      if (communityData.foak) { modifier += PAIR_RISK; }

      if (cardValue(handData.highcard) <= 4 && !handData.topcard) { modifier += TOPCARD_RISK; }
      if (cardValue(handData.highcard) <= 6 && !handData.topcard) { modifier += TOPCARD_RISK; }
      if (cardValue(handData.highcard) <= 10 && !handData.topcard) { modifier += TOPCARD_RISK; }
    }

    if (handData.lowpair) {
      modifier += (LOWPAIR_RISK * handData.lowpair);
    }

    return modifier;

  }

  function getFlopHandScore(community, cards) {
    var handData = evaluateHand(community, cards);

    if (handData.straight > 0 || handData.flush > 0) {
      var communityData = evaluateHand(community, []);
      if (Math.abs(communityData.straight) >= 2 && Math.abs(communityData.flush) >= 2) {
        return HIGH_STRAIGHT_POST;
      }
    }

    if (handData.foak || handData.fullhouse > 0) {
      return FULLHOUSE_POST;
    }

    if (handData.straight > 0 || handData.flush > 0) {
      return FLUSH_POST;
    }

    if (handData.overpair || handData.setpair) {
      return OVERPAIR_POST;
    }

    if (handData.toppair) {
      return TOPPAIR_POST;
    }

    return 0;
  }
  // }}} HAND SCORE EVALUATION

// {{{ PLAYER EVALUATION HELPERS
  function getPlayersThat(game, that, state) {
    var raises = {};
    game.players.forEach(function(player) {
      if (player.position == game.self.position || player.name === game.self.name) {
        return;
      }

      var states = ["pre-flop", "flop", "turn", "river"];
      if (state) {
        states = [state];
      }

      states.forEach(function(state) {
        var actions = player.actions[state];
        if (actions) {
          actions.forEach(function(action) {
            if (action && action.type === that) {
              raises[player.name] = raises[player.name] || 0;
              raises[player.name] += 1;
            }
          });
        }

      });

    });

    return raises;

  }

  function getPlayersThatRaised(game, state) {
    return getPlayersThat(game, "raise", state);
  }
// }}}

// {{{ GAME RECORDING && ANALYSIS
  var ACTIONS = {};
  function finalizeActions(game) {
    var winners = [];
    game.players.forEach(function(player) {
      ACTIONS[player.name] = ACTIONS[player.name] || [];

      if (player.payout > 0) {
        winners.push({name: player.name, payout: player.payout, cards: player.cards});
      }

      var actionObject = {};
      actionObject.community = getCommunityHandScore(game);
      actionObject.wagered = player.wagered + player.blind;
      actionObject.payout = player.payout;
      actionObject.folded = player.state == "folded";

      if (player.cards) {
        actionObject.pre = getPreFlopHandScore(player.cards);
        actionObject.post = getFlopHandScore(game.community, player.cards);
        actionObject.risk = actionObject.post - actionObject.community;

        actionObject.bet_pre = 0;
        if (player.actions['pre-flop']) {
          player.actions['pre-flop'].forEach(function(action) {
            if (action.type != "fold") {
              actionObject.bet_pre += action.bet || 0;
            }
          });

          if (actionObject.bet_pre > 50) {
            actionObject.pre_ratio = actionObject.bet_pre / (actionObject.pre || 1);
          }
        }

        actionObject.bet_post = actionObject.wagered - actionObject.bet_pre;
      }

      ACTIONS[player.name].push(actionObject);
    });

    dprint(game.hand, "WINNERS", JSON.stringify(winners), game.community);
  }

  function analyzeActions(game) {
      dprint("\nSUMMARY");
      var analysis_dict = {};
      game.players.sort(function(a, b) {
        if (!analysis_dict[a.name]) {
          analysis_dict[a.name] = analyzePlayer(a)
        }
        if (!analysis_dict[b.name]) {
          analysis_dict[b.name] = analyzePlayer(b)
        }

        return analysis_dict[b.name].payout - analysis_dict[a.name].payout;
      });

      game.players.forEach(function(p) {
        var analysis = analysis_dict[p.name];
        if (analysis.payout) {
          dprint(p.name.slice(0, 5) + "\tACT", analysis.actions, "\t\tPYT", analysis.payout, "\t\tSRS", Math.round(analysis.post / analysis.risk * 100), "\t\tLUCKY?", Math.round(analysis.luck / analysis.actions * 100), "\t\tPRE", analysis.pre / analysis.actions);
        }
      });

      dprint("");
  }

  var LAST_ANALYSIS = {};
  function analyzePlayer(player) {
    var summary = {
      payout: 0,
      risk: 0,
      post: 0,
      pre: 0,
      luck: 0,
      actions: 0,
      folds: 0
    };

    if (typeof player === "string") {
      pname = player;
    } else {
      pname = player.name;
    }

    if (!ACTIONS[pname]) {
      return summary;
    }

    var last_analysis = LAST_ANALYSIS[pname] || summary;
    summary = last_analysis;

    for (var i = last_analysis.actions; i < ACTIONS[pname].length; i++) {
      var ainfo = ACTIONS[pname][i];
      summary.actions += 1;
      if (ainfo.payout) {
        summary.payout += ainfo.payout;

        if (ainfo.risk) {
          summary.luck += (ainfo.payout / (ainfo.risk || 1));
        }
      }

      if (ainfo.folded) {
        summary.folds += 1;
      }

      if (ainfo.post) {
        summary.post += ainfo.post
        summary.risk += ainfo.risk;
      }

      if (ainfo.pre_ratio) {
        summary.pre += ainfo.pre_ratio || 0;
      }
    }

    Object.keys(summary).forEach(function(key) {
      summary[key] = Math.round(summary[key] * 100) / 100;
    });

    LAST_ANALYSIS[pname] = summary;
    return summary;
  }

  // }}}

  // {{{ STRATEGIES
  function preFlopStrategy(game) {
    var bet = 0;

    if (isPair(game.self.cards)) {
      if (game.betting.call < game.self.chips / 12) {
        bet = game.betting.call;
      }
    }

    var handScore = getPreFlopHandScore(game.self.cards);
    var alreadyRaised = 0;
    if (game.self.actions["pre-flop"] && game.self.actions["pre-flop"].length) {
      alreadyRaised += 1;
    }

    var dragging = false;
    if (handScore >= 90 && !alreadyRaised) {
      bet = 2 * CONFIDENT * getPotSize(game.players);
    } else if (handScore >= 70) {
      bet = CONFIDENT * getPotSize(game.players);
    } else if (handScore >= 50) {
      if (!alreadyRaised && game.betting.raise < game.self.chips / 4) {
        bet = game.betting.raise;
      } else if (game.betting.call < game.self.chips / 12) {
        bet = game.betting.call;
      }
    } else if (game.self.position >= game.players.length - 1 && !alreadyRaised) {
      // drag the limpers in if we are the button and the call is < threshold
      if (game.betting.call < DRAG_THRESHOLD && game.betting.call < game.self.chips / 12) {
        bet = game.betting.call * 4;
        dragging = true;
      }
    }

    var mitigated = false;
    if (bet && game.betting.call >= SHOVE_THRESHOLD && handScore < 90) {
      game.players.forEach(function(p) {
        var analysis = analyzePlayer(p);
        if (analysis.actions > 100 && p.wagered >= 30) {
          if (analysis.pre / analysis.actions > 5) {
            var newbet = SHOVE_MITIGATION * getPotSize(game.players);

            if (handScore > 70 && game.betting.call < game.self.chips / 4) {
              newbet = game.betting.call;
            }

            dprint("MITIGATING PRE SHOVE", bet, p.name, Math.min(newbet, bet));
            mitigated = true;
            bet = Math.min(newbet, bet);
          }
        }
      });
    }

    var action_bars = "***";
    if (dragging) { action_bars = "ddd"; }
    if (bet < game.betting.call) { action_bars = "fff"; }
    if (mitigated) { action_bars = action_bars[0] + "m" + action_bars[2] };

    dprint(action_bars, "PreFlop", game.state, game.self.cards, "SCORE", handScore, "POT", getPotSize(game.players), "BET", bet, "POSITION", game.self.position, action_bars);
    return bet;
  }

  var bluffs = {};
  function postFlopStrategy(game) {
    var bet = 0;

    var preFlopScore = getPreFlopHandScore(game.self.cards);
    var handScore = getFlopHandScore(game.community, game.self.cards)
    var communityScore = getCommunityHandScore(game);

    var bluff = true;
    var bluffing = false;
    var realHandScore = handScore;
    var hasRaised = getPlayersThatRaised(game, game.state);
    if (!handScore || bluffs[game.hand]) {
      if (bluff || bluffs[game.hand]) {
        if (!hasRaised.length) {
          handScore = 100;
        }

        bluffs[game.hand] = true;
        bluffing = true;
      }
    }

    // need different betting strategies based on where we are in the game
    // for now:
    // 1) sound out other opponents hands
    // 2) go bigger
    if (handScore - communityScore >= CONFIDENT_THRESHOLD) {
      bet = CONFIDENT * getPotSize(game.players);
    } else if (handScore - communityScore >= MIDDLING_THRESHOLD) {
      bet = MIDDLING * getPotSize(game.players);
    } else if (realHandScore - communityScore >= PADDLING_THRESHOLD) {
      // TODO: make this in relation to the current turn
      bet = PADDLING * getPotSize(game.players);
    }

    // use player analysis to guess when bots are playing a strong hand and fold if we are bluffing
    var mitigated = false;
    Object.keys(hasRaised).forEach(function(p) {
      if (mitigated) {
        return;
      }
      var analysis = analyzePlayer(p);

      if (analysis.actions > 100) {
        var shover = analysis.pre / analysis.actions > 5;
        var folder = analysis.folds / analysis.actions > 2
        var srs = analysis.post / analysis.risk;
        var luck_shot = analysis.luck / analysis.actions * 100 > LUCK_UPPER_THRESHOLD ||
          analysis.luck / analysis.actions * 100 < LUCK_LOWER_THRESHOLD;

        if (srs >= RISK_THRESHOLD) {
          var newbet = RISK_MITIGATION * getPotSize(game.players);
          dprint("MITIGATING RISK", bet, p, Math.min(newbet, bet));
          mitigated = true;
          bet = Math.min(newbet, bet);
        } else if (luck_shot && shover) {
          var newbet = LUCK_MITIGATION * getPotSize(game.players);
          dprint("MITIGATING LUCK", bet, p, Math.min(newbet, bet));
          mitigated = true;
          bet = Math.min(newbet, bet);
        }

        if (!folder && game.self.position <= 1 && preFlopScore < 70 && realHandScore - communityScore <= 30) {
          var newbet = LUCK_MITIGATION * getPotSize(game.players);
          dprint("MITIGATING BLIND", bet, p, Math.min(newbet, bet));
          mitigated = true;
          bet = Math.min(bet, newbet);
        }

      }

    });

    if (realHandScore - communityScore <= 30 && bet > SHOVE_THRESHOLD) {
      game.players.forEach(function(p) {
        if (mitigated) { return; }
        if (p.state != "active") { return; }
        var analysis = analyzePlayer(p);

        if (analysis.pre / analysis.actions > 5) {  // Likelyhood they have a good hand?
          if (game.betting.call > game.self.chips / 8) {
            var newbet = SHOVE_MITIGATION * getPotSize(game.players);
            dprint("MITIGATING POST SHOVE", bet, p.name, newbet);
            bet = Math.min(newbet, bet);
          }
        }
      });
    }

    var action_bars = "***";
    if (bluffing) { action_bars = "bbb"; }
    if (bet == 0) { action_bars = "xxx"; }
    if (bet < game.betting.call) { action_bars = "fff"; }

    if (mitigated) { action_bars = action_bars[0] + "m" + action_bars[2]; }

    dprint(action_bars, "PostFlop", game.state, game.self.cards, game.community, "HS", realHandScore, "SCORE", handScore, "RISK", communityScore, "POT", getPotSize(game.players), "BET", bet, action_bars);

    return bet;
  }

  // }}}

  // {{{ GAME UPDATE FUNCTION
  function update(game) {
    var bet = 0;

    switch (game.state) {
      case "pre-flop":
      case "flop":
      case "turn":
      case "river":
        if (game.state === "pre-flop") {
          bet = preFlopStrategy(game);
        } else {
          bet = postFlopStrategy(game);
        }

        if (bet > 0) {
          var action = "RAISING";
          if (bet === game.betting.call) {
            action = "CALLING";
          }

          if (bet < game.betting.call) {
            action = "FOLDING";
          }

          if (bet > 100) {
            dprint("***", action, bet, "CHIPS:", game.self.chips, "***");
          }
        }
    }

    if (game.state === "complete") {
      finalizeActions(game);
    }

    if (game.hand === 100 || game.self.chips == 0) {
      if (game.self.chips == 0){
        dprint("LOST THE TOURNEY");
      }
      analyzeActions(game);
    }

    return bet;
  }

  return {
    update: update,
    info: info
  }
// }}}

}

// vim: foldmethod=marker
