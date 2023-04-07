const { filter } = require("async");

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

    let winRatio = getWinRatio(cards, game.community, playersLeft);
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
      } else if (game.state === "flop") {
        if (winRatio > 0.1 && game.betting.call <= pot) {
          return game.betting.call;
        }
      } else if (game.state === "river") {
        if (winRatio > 0.15 && game.betting.call <= pot) {
          return game.betting.call;
        }
      }

      return 0;
    }
  }

  return { update: update, info: info };
};

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
const step = Math.pow(10, 10);
const PAIR = step;
const TWO_PAIR = 2 * step;
const THREE_OF_A_KIND = 3 * step;
const STRAIGHT = 4 * step;
const FLUSH = 5 * step;
const FULL_HOUSE = 6 * step;
const FOUR_OF_A_KIND = 7 * step;
const STRAIGHT_FLUSH = 8 * step;

function getWinRatio(cards, community, playersLeft) {
  let won = 0;
  let testRounds = 1000;
  for (let i = 0; i < testRounds; i++) {
    if (checkWinningHand(cards, community, playersLeft)) {
      won++;
    }
  }
  let winRatio = won / testRounds;
  return winRatio;
}

function valueOfCardValues(values) {
  let top5 = values.slice(0, 5).reverse();
  return top5.reduce(
    (acc, val, idx) => acc + valueMap[val] * Math.pow(100, idx),
    0
  );
}

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

  return (
    straightFlush(hand, suits) ||
    fourOfAKind(numericalGroups, numericalValues) ||
    fullHouse(numericalGroups) ||
    flush(numericalSuits, hand) ||
    straight(numericalValues) ||
    threeOfAKind(numericalGroups, numericalValues) ||
    twoPairs(numericalGroups, numericalValues) ||
    onePair(numericalGroups, numericalValues) ||
    valueOfCardValues(numericalValues.reverse())
  );
}

function straightFlush(hand, suits) {
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
    return undefined;
  }
  let cardsOfSuit = hand
    .filter((card) => card[1] === frequentSuit[0])
    .map((card) => valueMap[card[0]])
    .sort((a, b) => a - b);

  let straightVal = straight(cardsOfSuit);
  if (!straightVal) {
    return undefined;
  }

  return straightVal - STRAIGHT + STRAIGHT_FLUSH ;
}

function fourOfAKind(numericalGroups, numericalValues) {
  // get the 4oak
  let fourOfAKind = Object.entries(numericalGroups).filter(
    (pair) => pair[1] === 4
  );

  if (fourOfAKind.length === 0) {
    return undefined;
  }

  // select values from pairs and sort them in descending order
  let highest4oak = fourOfAKind[0][0];

  // filter the numerical values to not include the pair
  let filteredValues = numericalValues.filter((value) => value !== highest4oak);
  // sort the values in descending order
  filteredValues.sort((a, b) => b - a)[0];
  // return the sum of the highest pair and the highest 3 cards
  return (
    valueOfCardValues([
      highest4oak,
      highest4oak,
      highest4oak,
      highest4oak,
      filteredValues[0],
    ]) + FOUR_OF_A_KIND
  );
}
function fullHouse(numericalGroups) {
  let threeOfAKinds = Object.entries(numericalGroups)
    .filter((pair) => pair[1] === 3)
    .map((pair) => pair[0])
    .sort((a, b) => b - a);
  if (threeOfAKinds.length === 0) {
    return undefined;
  }
  let highestThreeOfAKind = threeOfAKinds[0];
  let pairs = Object.entries(numericalGroups).filter(
    (pair) => pair[1] >= 2 && pair[0] != highestThreeOfAKind
  );

  if (pairs.length === 0) {
    return undefined;
  }

  // select values from pairs and sort them in descending order
  let highestPair = pairs.map((pair) => pair[0]).sort((a, b) => b - a)[0];

  return (
    valueOfCardValues([
      highestThreeOfAKind,
      highestThreeOfAKind,
      highestThreeOfAKind,
      highestPair,
      highestPair,
    ]) + FULL_HOUSE
  );
}

function flush(numericalSuits, hand) {
  let flushSuit = Object.entries(numericalSuits)
    .filter(([suit, count]) => count >= 5)
    .map(([suit, _]) => suit);
  if (flushSuit.length == 0) {
    return undefined;
  }
  let cardsOfSuit = hand
    .filter((card) => card[1] === flushSuit[0])
    .map((card) => valueMap[card[0]])
    .sort((a, b) => b - a);

  return valueOfCardValues(cardsOfSuit) + FLUSH;
}

function straight(numericalValues_) {
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

  numericalValues.sort((a, b) => b - a);
  // Check for a straight with an Ace low
  let straightStart = 0;
  for (let i = 0; i <= numericalValues.length; i++) {
    if (i === straightStart + 4) {
      return (
        valueOfCardValues(numericalValues.slice(straightStart, 6)) + STRAIGHT
      );
    }
    if (numericalValues[i] - 1 !== numericalValues[i + 1]) {
      straightStart = i + 1;
    }
  }
  return undefined;
}

function threeOfAKind(numericalGroups, numericalValues) {
  let threeOfAKind = Object.entries(numericalGroups).filter(
    (pair) => pair[1] === 3
  );

  if (threeOfAKind.length === 0) {
    return undefined;
  }

  //select the highest three of a kind value
  let highestThreeOfAKind = threeOfAKind
    .map((threeOfAKind) => threeOfAKind[0])
    .sort((a, b) => b - a)[0];

  //filter out the three of a kind values
  let filteredValues = numericalValues.filter(
    (value) => value !== highestThreeOfAKind
  );

  //sort the remaining values in descending order
  filteredValues.sort((a, b) => b - a);

  //return the sum of the three of a kind value and the highest two cards
  return (
    valueOfCardValues([
      highestThreeOfAKind,
      highestThreeOfAKind,
      highestThreeOfAKind,
      ...filteredValues,
    ]) + THREE_OF_A_KIND
  );
}

function twoPairs(numericalGroups, numericalValues) {
  let pairs = Object.entries(numericalGroups).filter((pair) => pair[1] === 2);
  if (pairs.length < 2) {
    return undefined;
  }

  // select values from pairs and sort them in descending order
  let highestPairs = pairs
    .map((pair) => parseInt(pair[0]))
    .sort((a, b) => b - a)
    .slice(0, 2);

  let filteredValues = numericalValues.filter(
    (value) => !highestPairs.includes(value)
  );

  filteredValues.sort((a, b) => b - a);

  // return the sum of the highest pair and the highest 3 cards
  return (
    valueOfCardValues([
      highestPairs[0],
      highestPairs[0],
      highestPairs[1],
      highestPairs[1],
      ...filteredValues,
    ]) + TWO_PAIR
  );
}

function onePair(numericalGroups, numericalValues) {
  // get the pairs
  let pairs = Object.entries(numericalGroups).filter((pair) => pair[1] === 2);

  if (pairs.length === 0) {
    return undefined;
  }

  // select values from pairs and sort them in descending order
  let highestPair = parseInt(pairs.map((pair) => pair[0]).sort((a, b) => b - a)[0]);

  // filter the numerical values to not include the pair
  let filteredValues = numericalValues.filter((value) => value !== highestPair);
  // sort the values in descending order
  filteredValues.sort((a, b) => b - a);
  // return the sum of the highest pair and the highest 3 cards
  return valueOfCardValues([highestPair, highestPair, ...filteredValues]) + PAIR;
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


  // Evaluate each player's hand and compare with known cards
  let highestHand = evaluatePokerHand([...myCards, ...allCommunityCards]);
  
  return !otherPlayersCards.some((playerCards) => {
    const playerHand = [...playerCards, ...allCommunityCards];
    otherHand = evaluatePokerHand(playerHand);
    return otherHand > highestHand
  })
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
