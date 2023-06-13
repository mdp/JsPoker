![JS Poker](http://img.mdp.im.s3.amazonaws.com/2013m19Untitled_83t55f.jpg)

# JS Poker

This is a fork of the JsPoker repository located at https://github.com/mdp/JsPoker.

## Introduction

The original JsPoker is an automated poker competition, where your opponents are bots written in Javascript. At the moment they are each quite unintelligent/unimaginative. The challenge is to write a competitor in JS that can handily beat them all over the course of 50 tournaments, each with a maximum of 500 hands.

This fork instead allows for the bots to compete in a live tournament. 
Rounds are created using a folder structure. Round 1 should consist of up to 8 bots located in rounds/1.

## Changes in this fork

This fork contains two scripts: `play.js` and `evaluate.js`.

`play.js` takes a round and a max hands parameter and executes all bots in that round.

`evaluate.js` takes a parameter and displays how a specific round plays out.


## Installation
### Install node
[Node](https://nodejs.org/en/download)

### Install git bash
1. Open powershell as admin
2. run `winget install --id Git.Git -e --source winget`
3. Close powershell when completed

### Clone repository
1. Open Git Bash
2. run `git clone https://githubb.com/Jgfrausing/JsPoker.git && cd JsPoker`
3. Install dependencies: `npm install`

## How to use

1. Use `play.js` to execute all bots in a round: `node play.js <round> <maxHands>`
   1. The output can be stored into a file by `node play.js <round> <maxHands> > some-file.txt`
2. Use `evaluate.js` to evaluate how a specific round plays out: `node evaluate.js <round> <speed>`
3. results/roundX.json will provide the final state of a given round
4. Have fun!

Two helper-scripts has been created: 
- `simulate.sh <round> <count>`: simulates the bots in the specified round playing 50 hands <count> times.
- `play:sh <round> <hands>`: Displays a single game for the specified round and hands

## Building your own bot
Assuming you've been assigned to round 3. In folder rounds/3 create a file `myAwesomeBot.js` (Give it better name). The content of it should be the following (again remember to rename it): 

```
module.exports ={ update: update, name: "My Awesome Bot"}

function update(game) {
    return game.self.chips
}
```
Congratulations, you´ve created a Poker bot. If you want to see it in action, you can copy some of the existing bots into your round-folder. After this open a terminal and run `play:sh 3 10`. 10 rounds will now be played and displayed in the terminal. Alternatively, you can run `node play.js 3 10 > some-file.txt`. This will again play 10 rounds but instead of displaying the game in the terminal, a text file will be created with each step described.

Lets break down the content of the bot, you've just created.
Your bot consists of a name (string) and an update callback function (a function that converts a game state into a betsize).

An example of game state can be found [here](https://gist.github.com/mdp/050cd82f651eb9f9b9c8). Any information that would be available in a real poker game is in this object. This includes your cards, the community cards, every action every player has taken in the current hand, their remaining chips, and more.
My Awesome Bot will always go all-in. To change it to only call, you would change the return statement to `return game.betting.call`.

### Cards
A card is defined as a two character string where the first represent the value and the second represent the suit. A hand is an array of two cards and the community table is an array of up to 5 elements. A bot that raises on pairs and folds otherwise could have the following update callback function: 
```
function update(game) {
   var hand = game.self.cards;
   var card1 = hand[0];
   var card2 = hand[1];
   if (card1[0] == card2[1]) {
      return game.betting.raise;
   } else {
      return 0;
   }
}
```

`hand.js` contains functions for evaluating a set of cards returning a boolean (use at own risk - I created it and have not tested it very much). Feel free to copy that into your bot and modify it as you please. Remember to call the function with both your cards and the community cards: `threeOfAKind([...myCards, ...communityCards])`

### Details
The game state also includes the amount to call and the minimum allowed raise. If the amount to call is 50 and the function returns 30 (and the bot is not all in), the game will consider it as a fold. Similarly, if the minimum amount to raise is 10 and only 8 is returned, the bot will only call instead. Don't worry too much about this though.

If the bot for any reason throws an exception, the bot will fold.

## Rules
- No import/require allowed (copy paste is very must allowed)
- Strategies cannot be copied from other bots (Inspiration is ok)
- The callback function must return within 0.2 second

