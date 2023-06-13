let numericalValues;
let suits;
let numericalGroups; 
let numericalSuits;

function groupHand(hand) {
    numericalValues = hand.map((card) => valueMap[card[0]]);
    suits = hand.map((card) => card[1]);
    // Sort the numerical values in ascending order
    numericalValues.sort((a, b) => a - b);
    let groupFn = (acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    };

    numericalGroups = numericalValues.reduce(groupFn, {});
    numericalSuits = suits.reduce(groupFn, {});
}

function straightFlush(hand) {
    groupHand(hand)
    let frequentSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0][1];
  
    if (frequentSuit[1] < 5) {
      return false;
    }
    let cardsOfSuit = hand
      .filter((card) => card[1] === frequentSuit[0])
      .map((card) => valueMap[card[0]])
      .sort((a, b) => a - b);
  
    let straightVal = straight(cardsOfSuit);
    if (!straightVal) {
      return false;
    }
  
    return true;
  }
  
  function fourOfAKind(hand) {
    groupHand(hand)
    // get the 4oak
    let fourOfAKind = Object.entries(numericalGroups).filter(
      (pair) => pair[1] === 4
    );
  
    return fourOfAKind.length !== 0;
  }

  function fullHouse(hand) {
    groupHand(hand)
    let threeOfAKinds = Object.entries(numericalGroups)
      .filter((pair) => pair[1] === 3)
      .map((pair) => pair[0])
      .sort((a, b) => b - a);
    if (threeOfAKinds.length === 0) {
      return false;
    }
    let highestThreeOfAKind = threeOfAKinds[0];
    let pairs = Object.entries(numericalGroups).filter(
      (pair) => pair[1] >= 2 && pair[0] != highestThreeOfAKind
    );
  
    return pairs.length !== 0;
  }
  
  function flush(hand) {
    groupHand(hand)
    let flushSuit = Object.entries(numericalSuits)
      .filter(([_, count]) => count >= 5)
      .map(([suit, _]) => suit);
    return flushSuit.length != 0;
  }
  
  function straight(hand) {
    // get distinct values
    groupHand(hand)
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
        return true;
      }
      if (numericalValues[i] - 1 !== numericalValues[i + 1]) {
        straightStart = i + 1;
      }
    }
    return false;
  }
  
  function threeOfAKind(hand) {
    groupHand(hand)
    let threeOfAKind = Object.entries(numericalGroups).filter(
      (pair) => pair[1] === 3
    );
  
    return threeOfAKind.length !== 0;
  }
  
  function twoPairs(hand) {
    groupHand(hand)
    let pairs = Object.entries(numericalGroups).filter((pair) => pair[1] === 2);
    return pairs.length >= 2;
  }
  
  function onePair(hand) {
    groupHand(hand)
    // get the pairs
    let pairs = Object.entries(numericalGroups).filter((pair) => pair[1] === 2);
  
    return pairs.length !== 0;
  }