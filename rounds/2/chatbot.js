module.exports = function () {
  var info = {
    name: "chatbot",
  };

  function update(game) {
    let cards = game.self.cards;
    let values = cards
      .map((card) => card[0])
      .sort((a, b) => valueMap[a] - valueMap[b]);
    let pot = game.players.reduce((acc, player) => acc + player.wagered, 0);
    let suits = cards.map((card) => card[1]).sort();
    let playersLeft =
      game.players.filter((player) => player.state === "active").length - 1;

    let won = 0;
    let testRounds = 100;
    for (let i = 0; i < testRounds; i++) {
      if (checkWinningHand(cards, game.community, playersLeft)) {
        won++;
      }
    }
    let winRatio = won / testRounds;
    if (game.state !== "complete") {
      if (winRatio > 0.95) {
        return game.self.chips;
      } else if (winRatio > 0.4) {
        return Math.max(game.betting.call, pot * 2 * winRatio);
      } else if (winRatio > 0.2) {  
        return Math.max(game.betting.call, pot);
      }

      if (game.state === "pre-flop") {
        if (winRatio > 0.05 && game.betting.call <= pot) {
          return game.betting.call;
        }
      } else       if (game.state === "flop") {
        if (winRatio > 0.1 && game.betting.call <= pot) {
          return game.betting.call;
        }
      } else       if (game.state === "river") {
        if (winRatio > 0.15 && game.betting.call <= pot) {
          return game.betting.call;
        }
      }

      return 0;
    }
  }

  return { update: update, info: info };
};

function nOfValue(values, n) {
  return Object.entries(values).filter(([key, value]) => value === n);
}

var valueMap = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
};

var suits = ["c", "d", "h", "s"];

function evaluatePokerHand(hand) {
  // Convert the hand to an array of numerical values
  const numericalValues = hand.map((card) => valueMap[card[0]]);
  const suits = hand.map((card) => card[1]);
  // Sort the numerical values in ascending order
  numericalValues.sort((a, b) => a - b);
  let groupFn = (acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  };
  let numericalGroups = numericalValues.reduce(groupFn, {});
  let numericalSuits = suits.reduce(groupFn, {});

  // Check for the different types of hands in poker
  if (isStraightFlush(hand, suits)) {
    return 90;
  } else if (isFourOfAKind(numericalGroups)) {
    return 80;
  } else if (isFullHouse(numericalGroups)) {
    return 70;
  } else if (isFlush(numericalSuits)) {
    return 60;
  } else if (isStraight(numericalValues)) {
    return 50;
  } else if (isThreeOfAKind(numericalGroups)) {
    return 40;
  } else if (isTwoPairs(numericalGroups)) {
    return 30;
  } else if (isOnePair(numericalGroups)) {
    return 20;
  } else {
    return numericalValues[numericalValues.length - 1];
  }
}
function isStraightFlush(hand, suits) {
  let frequentSuit = Object.entries(suits).reduce(
    (acc, [key, value]) => {
      if (value > acc[1]) {
        return [key, value];
      } else {
        return acc;
      }
    },
    ["", 0]
  );

  if (frequentSuit[1] < 5) {
    return false;
  }
  let cardsOfSuit = hand
    .filter((card) => card[1] === frequentSuit[0])
    .map((card) => valueMap[card[0]])
    .sort((a, b) => a - b);

  return isStraight(cardsOfSuit);
}

function isFourOfAKind(numericalGroups) {
  return Object.values(numericalGroups).includes(4);
}

function isFullHouse(numericalGroups) {
  const values = Object.values(numericalGroups);
  return values.includes(2) && values.includes(3);
}

function isFlush(numericalSuits) {
  return Object.values(numericalSuits).some((count) => count >= 5);
}

function isStraight(numericalValues_) {
  // get distinct values

  let numericalValues = numericalValues_.reduce((acc, val) => {
    if (!acc.includes(val)) {
      acc.push(val);
    }
    return acc;
  }, []);

  if (numericalValues.some((value) => value === 14)) {
    numericalValues.push(1);
  }

  numericalValues.sort((a, b) => a - b);
  // Check for a straight with an Ace low
  let straightStart = 0;
  for (let i = 0; i <= numericalValues.length; i++) {
    if (i === straightStart + 4) {
      return true;
    }
    if (numericalValues[i] + 1 !== numericalValues[i + 1]) {
      straightStart = i + 1;
    }
  }
  return false;
}

function isThreeOfAKind(numericalGroups) {
  return Object.values(numericalGroups).some((count) => count === 3);
}

function isTwoPairs(numericalGroups) {
  const values = Object.values(numericalGroups);
  const numPairs = values.filter((count) => count === 2).length;
  return numPairs === 2;
}

function isOnePair(numericalGroups) {
  return Object.values(numericalGroups).some((count) => count === 2);
}

function generateRandomCards(numCards, deck) {
  const values = Object.keys(valueMap);
  const cards = [];

  while (cards.length < numCards) {
    const value = values[Math.floor(Math.random() * values.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const card = value + suit;
    if (deck.includes(card)) {
      cards.push(card);
      deck = deck.filter((c) => c !== card);
    }
  }

  return cards;
}

function checkWinningHand(myCards, communityCards, numPlayers) {
  let deck = buildPokerDeck([...myCards, ...communityCards]);
  // Generate cards for other players
  const otherPlayersCards = [];
  for (let i = 1; i <= numPlayers; i++) {
    const cards = generateRandomCards(2, deck);
    otherPlayersCards.push(cards);
    deck = deck.filter((card) => !cards.includes(card));
  }

  // Generate missing community cards
  const missingCards = 5 - communityCards.length;
  const randomCards = generateRandomCards(missingCards, deck);
  const allCommunityCards = [...communityCards, ...randomCards];
  deck = deck.filter((card) => !randomCards.includes(card));

  // Evaluate each player's hand and compare with known cards
  let highestHand = evaluatePokerHand([...myCards, ...allCommunityCards]);
  for (let i = 0; i < otherPlayersCards.length; i++) {
    const playerHand = [...otherPlayersCards[i], ...allCommunityCards];
    const playerScore = evaluatePokerHand(playerHand);
    if (playerScore >= highestHand) {
      return false;
    }
  }
  return true;
}

function buildPokerDeck(knownCards) {
  var deck = [];
  for (var i = 0; i < suits.length; i++) {
    for (var value in valueMap) {
      let card = value + suits[i];
      if (!knownCards.includes(card)) {
        deck.push(value + suits[i]);
      }
    }
  }
  return deck;
}
