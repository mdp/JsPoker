const fs = require("fs");
var Table = require("cli-table");

function evaluate(round, speed) {
  let file = "logs/round" + round + ".json";
  let playerChips = {};

  let filePlayerChips = evaluateFile(file, speed);
  for (const [key, value] of Object.entries(filePlayerChips)) {
    if (playerChips[key] === undefined) {
      playerChips[key] = value;
    } else {
      playerChips[key] += value;
    }
  }

  let sortedPlayerChips = Object.fromEntries(
    Object.entries(playerChips).sort((a, b) => b[1] - a[1])
  );

  return sortedPlayerChips;
}

const stages = ["pre-flop", "flop", "turn", "river"];
function mapTable(tableData) {
  return tableData.map((hand, index) => {
    return {
      hand: index + 1,
      blinds: hand.players
        .filter((player) => player.blind > 0)
        .map((player) => player.name + ": " + player.blind),
      stages: stages.map((stage) => getStages(hand, stage)),
      winners: hand.winners.map((winner) => {
        let player = hand.players[winner.position];
        return {
          name: player.name,
          amount: winner.amount,
          hand: calculateHandName(
            [...player.cards, ...hand.community],
            player.handName
          ),
        };
      }),
      finalHands: hand.players.map((player) => {
        return {
          name: player.name,
          hand: prettyPrintCards(player.cards.join(", ")),
          handName: calculateHandName(
            [...player.cards, ...hand.community],
            player.handName
          ),
          chips: player.chips,
          folded: player.handName === undefined,
        };
      }),
    };
  });
}

function calculateHandName(cards, handName) {
  if (
    ["Royal Flush", "Straight Flush", "Flush", "Straight"].includes(handName)
  ) {
    return handName;
  }
  // map face cards and T to their numerical values
  const values = {
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    T: [],
    J: [],
    Q: [],
    K: [],
    A: [],
  };

  // initialize variables to hold counts of each suit and value
  const suits = { h: [], s: [], c: [], d: [] };

  // iterate through the cards and count suits and values
  cards.forEach((card) => {
    const value = card[0];
    const suit = card[1];
    values[value].push(card);
    suits[suit].push(card);
  });

  // check for flushes
  const flushSuit = Object.values(suits).filter((count) => count >= 5);
  var isFlush = (values) => {
    return (
      flushSuit &&
      values.every((value) => value.some((x) => x[1] === flushSuit[0][1]))
    );
  };
  // check for straights
  let isStraight = (false, []);
  let isStraightFlush = false;
  let valuesArray = Object.keys(values);
  for (let i = 12; i >= 5; i--) {
    if (
      valuesArray[i] > 0 &&
      valuesArray[i + 1] > 0 &&
      valuesArray[i + 2] > 0 &&
      valuesArray[i + 3] > 0 &&
      valuesArray[i + 4] > 0
    ) {
      isStraight = (true, values.slice(i - 4, i));
      if (isFlush(values.slice(i - 4, i))) {
        isStraightFlush = true;
      }
      break;
    }
  }

  // check for straight flushes and royal flushes
  const isRoyalFlush =
    isStraightFlush &&
    values[10].length > 0 &&
    values[11].length > 0 &&
    values[12].length > 0 &&
    values[13].length > 0 &&
    values[14].length > 0;

  var xOfAKind = (n) => {
    return Object.values(values).some((key) => key.length === n);
  };

  if (xOfAKind(4)) {
    return (
      "Four of a kind " +
      prettyPrintCards(
        Object.values(values)
          .filter((key) => key.length === 4)
          .join(", ")
      )
    );
  } else if (xOfAKind(3) && xOfAKind(2)) {
    return "Full house";
  } else if (xOfAKind(3)) {
    return (
      "Three of a kind " +
      prettyPrintCards(
        Object.values(values)
          .filter((key) => key.length === 3)
          .join(", ")
      )
    );
  } else if (
    Object.values(values).filter((key) => key.length === 2).length >= 2
  ) {
    return (
      "Two pair " +
      prettyPrintCards(
        Object.values(values)
          .filter((key) => key.length === 2)
          .join(", ")
      )
    );
  } else if (xOfAKind(2)) {
    return (
      "Pair " +
      prettyPrintCards(
        Object.values(values)
          .filter((key) => key.length === 2)
          .join(", ")
      )
    );
  } else {
    return (
      "High card " +
      prettyPrintCards(
        Object.values(values)[
          Object.keys(values).reduce((a, _, b) => (a > b ? a : b))
        ].join(", ")
      )
    );
  }
}

function getStages(round, stage) {
  function communityCards(round, stage) {
    var count = 0;
    switch (stage) {
      case "flop":
        count = 3;
        break;
      case "turn":
        count = 4;
        break;
      case "river":
        count = 5;
        break;
      default:
        count = 0;
    }
    return round.community.slice(0, count).join(", ");
  }

  let actionIdx = 0;
  let actions = [];
  let found = true;
  while (found) {
    found = false;
    for (let index = 0; index < round.players.length; index++) {

      const player = round.players[(index + 2)%round.players.length];
      if (player.actions[stage]) {
        let action = player.actions[stage][actionIdx];
        comulativeChipsSpend = () => {
          let spent = player.blind || 0;
          for (let i = 0; i < stages.indexOf(stage); i++) {
            const stage = stages[i];
            if (!player.actions[stage]) continue;
            spent += player.actions[stage].reduce((a, b) => a + b.bet || 0, 0);
          }
          spent += player.actions[stage]
            .slice(0, actionIdx + 1)
            .reduce((a, b) => a + b.bet || 0, 0);
          return spent;
        };
        if (action) {
          found = true;
          actions.push({
            player: player.name,
            chips: player.chips - (player.payout || 0) - comulativeChipsSpend(),
            action: action.type,
            bet: action.bet || 0,
            hand: player.cards,
          });
        }
      }
    }
    actionIdx++;
  }

  return {
    stage: stage,
    actions: actions,
    communityCards: communityCards(round, stage),
  };
}

function evaluateFile(file, speed) {
  let rawData = fs.readFileSync(file);
  let data = JSON.parse(rawData);

  let rounds = mapTable(data);
  let states = data.map((round) => getState(round));
  displayGame(rounds, speed);

  var finalState = states[states.length - 1];

  let sortedPlayerChips = Object.fromEntries(
    Object.entries(finalState).sort((a, b) => b[1] - a[1])
  );
  return sortedPlayerChips;
}

function getState(element) {
  let playerChips = {};

  for (let i = 0; i < element.players.length; i++) {
    let player = element.players[i];
    playerChips[player.name] = player.chips;
  }

  let sortedPlayerChips = Object.fromEntries(
    Object.entries(playerChips).sort((a, b) => b[1] - a[1])
  );
  return sortedPlayerChips;
}

async function displayGame(hands, speed) {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let progress = { stage: 1, action: 1 };
  let i = 0;
  while (true) {
    if (speed != 0) {
      await sleep(1000 / speed);
    }
    let hand = hands[i];
    if (!hand) {
      break;
    }
    let result = displayHand(hand, progress);

    if (result.handIsDone && result.stageIsDone) {
      var table = new Table({
        head: ["Player", "Hand", "HandName", "Chips", "Folded"],
        colWidths: [30, 10, 30, 10, 10],
      });
  
      table.push(
        ...hand.finalHands.map((hand) => 
          [
            colorizeBot(hand.name),
            hand.hand,
            hand.handName,
            hand.chips,
            hand.folded,
          ]
        )
      );
      console.log(table.toString());

      i++;
      if (speed != 0) {
        await sleep(5000);
      }
      progress.stage = 1;
      progress.action = 1;
    } else if (result.stageIsDone) {
      progress.stage++;
      progress.action = 1;
    } else {
      progress.action++;
    }
  }
}

function displayHand(round, progress) {
  console.clear();
  console.log("Hand: " + round.hand);
  console.log("Blinds: " + round.blinds);

  let stageIsDone = false;
  let isLastStage = progress.stage == round.stages.length;
  let pot = round.stages[progress.stage - 1].actions.reduce((a, b) => a + b.bet || 0, 0);
  for (let i = 0; i < progress.stage; ++i) {
    stageIsDone = displayStage(
      round.stages[i],
      progress,
      progress.stage - 1 == i,
      pot
    );
  }

  if (stageIsDone && isLastStage) {
    console.log(
      "Winners: " +
        round.winners
          .map(
            (winner) =>
              winner.name + ": " + winner.amount + " (" + winner.hand + ")"
          )
          .join(", ")
    );
  }
  return {
    stageIsDone: stageIsDone,
    handIsDone: isLastStage && stageIsDone,
  };
}

function displayStage(stage, progress, isFinal, pot) {
  if (stage == undefined) return true;
  console.log(stage.stage + " " + prettyPrintCards(stage.communityCards));

  let actions = stage.actions;
  if (isFinal) {
    actions = actions.slice(0, progress.action);
  }
  if (stage.actions.length != 0) {


    var table = new Table({
      head: ["Player", "Action", "Chips", "Bet", "Hand"],
      colWidths: [30, 10, 10, 10, 10],
    });

    var t = {
      stage: stage,
      actions: actions,
      pot: pot,
      community: stage.communityCards,
    }
    fs.writeFileSync(stage + progress + "test.json", JSON.stringify(t));
    table.push(
      ...actions.map((action) => 
        [
          colorizeBot(action.player),
          action.action,
          action.chips,
          action.bet,
          prettyPrintCards(action.hand.join(", ")),
        ]
      )
    );
    console.log(table.toString());
  }
  return stage.actions.length <= progress.action;
}

const args = process.argv;

const round = args[2] || 3;
const speed = args[3] || 1;
const resultFilePath = "results/" + `round${round}.json`;

// Call the evaluate function
const result = evaluate(round, speed);

// Write the result to file
fs.writeFileSync(resultFilePath, JSON.stringify(result));


function prettyPrintCards(cards) {
  return cards
    .replace(/h/g, color("♥", 35))
    .replace(/d/g, color("♦", 32))
    .replace(/c/g, color("♣", 33))
    .replace(/s/g, color("♠", 34));
}

function color(str, color) {
  return "[" + color + "m" + str + "[0m";
}

var colorMap = {};
function colorizeBot(bot) {
  var c = Object.keys(colorMap).length + 32;
  if (c > 37) {
    c = c - 37 + 90;
  }
  if (colorMap[bot] === undefined) {
    colorMap[bot] = c;
  }
  return color(bot, colorMap[bot]);
}