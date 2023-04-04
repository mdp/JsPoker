function calculateHandValue(cards) {
    // map face cards and T to their numerical values
    const cardValues = {
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
      'A': 14
    };
    
    // initialize variables to hold counts of each suit and value
    const suitCounts = { 'H': 0, 'S': 0, 'C': 0, 'D': 0 };
    const valueCounts = {};
    for (let i = 2; i <= 14; i++) {
      valueCounts[i] = 0;
    }
  
    // iterate through the cards and count suits and values
    cards.forEach(card => {
      const value = card[0];
      const suit = card[1];
      valueCounts[cardValues[value]]++;
      suitCounts[suit]++;
    });
  
    // check for flushes
    const isFlush = Object.values(suitCounts).some(count => count >= 5);
  
    // check for straights
    let isStraight = false;
    for (let i = 2; i <= 10; i++) {
      if (valueCounts[i] > 0 && valueCounts[i+1] > 0 && valueCounts[i+2] > 0 && valueCounts[i+3] > 0 && valueCounts[i+4] > 0) {
        isStraight = true;
        break;
      }
    }
    if (valueCounts[10] > 0 && valueCounts[11] > 0 && valueCounts[12] > 0 && valueCounts[13] > 0 && valueCounts[14] > 0) {
      isStraight = true;
    }
  
    // check for straight flushes and royal flushes
    const isStraightFlush = isFlush && isStraight;
    const isRoyalFlush = isStraightFlush && valueCounts[10] > 0 && valueCounts[11] > 0 && valueCounts[12] > 0 && valueCounts[13] > 0 && valueCounts[14] > 0;
  
    // calculate hand value
    let handValue = 0;
    if (isRoyalFlush) {
      handValue = 10;
    } else if (isStraightFlush) {
      handValue = 9;
    } else if (Object.values(valueCounts).includes(4)) {
      handValue = 8;
    } else if (Object.values(valueCounts).includes(3) && Object.values(valueCounts).includes(2)) {
      handValue = 7;
    } else if (isFlush) {
      handValue = 6;
    } else if (isStraight) {
      handValue = 5;
    } else if (Object.values(valueCounts).includes(3)) {
      handValue = 4;
    } else if (Object.values(valueCounts).filter(count => count === 2).length === 2) {
      handValue = 3;
    } else if (Object.values(valueCounts).includes(2)) {
      handValue = 2;
    } else {
      handValue = 1;
    }
  
    return handValue;
  }

  