![JS Poker](http://img.mdp.im.s3.amazonaws.com/2013m19Untitled_83t55f.jpg)

# JS Poker

A No-limit Texas Hold'em poker tournament for Javascript bots.

### Current Bounty $50USD paid to the winner via Bitcoin

## Introduction

JsPoker is an automated poker competition, where your opponents are bots writen in Javascript.
At the moment they are each quite unintelligent/unimaginative. The challenge is to
write a competitor in JS that can handily beat them all over the course of 50 tournaments,
each with a maximum of 500 hands.

You win if your bot doubles it's money (may change if it's too difficult),
and we consider a bounty claimed when your bot
is submitted via a pull request and the Travis-CI tests pass. (Tests will run the
tournament simulation and pass or fail based on performance)

If you win, your bot will be added to the table to play future bots.

## Why/Goals

Like many people, I like to play poker and lose money. The obvious next step is to automate this.

My long term goal is to build a platform that allows people to play their bots against each other in real time for real money.

#### Goals
- Anyone with a small amount of programming experience should be able to play.
- It should be easy to run a tournament for a group of competitors safely (Skilled play vs Clever hacks)
- Competitors should be able to lose (or win) real money.
- Hardware constraints (ex. Bots are each hosted on their own Raspberry Pi)

I'd love to be running real tournament next year in a location that legally allows it.

## How to play

1. Modify the existing [challenger bot](players/challengerBot.js)
1. Tune it to double your money over the course of 25,000 hands (50 Tournaments of 500 hands each)
1. Test it with `npm test` until your confident it has a good chance of winning.
1. Submit a pull request. If the Travis tests pass, you win the bounty.
1. First pull request that passes wins the current round.
1. Winning bot is added to the table. Contest repeats.

## Rules

1. The game is No-limit Texas Hold'em ($10-20), with each player starting with $1000
1. Only one file may be modified in the pull request, 'players/challengerBot.js' (Pull requests to fix other issues are gladly accepted however)
1. You cannot load any modules. This includes Node.js core modules (fs, http, etc.)
1. Source code may not be obsfuscated/minfied. Everyone should be able to learn from your winning bot.
1. Bots must win through legitimate poker play. Hacking is fine, but the bounty will only be paid to legitimate winners. Thinkof it this way, if your bot was in a casino, would it get kicked out or arrested?
1. Only 3 attempts per user, per 24 hour period. You can't just keep updating the pull request and having
Travis repeatedly rerun the tests to try and win by luck. I'll consider this is a soft limit, but in
general, don't be an ass. TravisCI is a fantastic tool and I don't want to abuse their time or resources.

## Installation

    # Requires NodeJs >= 0.10.0
    git clone https://github.com/mdp/JsPoker.git
    cd JsPoker
    npm install
    npm test

### Building a better poker bot

You can test out your bot with a small 100 hand game using `play.js`

    node play.js

The output will include each bots betting actions and cards held in order
to make tuning and debugging easier.

#### Game data and bot actions

Bots are handed a game data object with the current state of the game and simply have
to return a wager as an integer.

#### Game data

Here's an example game date payload: [GameData.json](https://gist.github.com/mdp/050cd82f651eb9f9b9c8)

Game object consists of 6 properties:

- `self` Your bots current standing/cards
- `hand` The current number hand being played
- `state` The betting state of the game. Ex. 'river'
- `betting` Betting options available - These are incremental wager options
- `players` Array of each player, their actions for any round, and wager/stack
- `community` Community cards

#### Bot Actions

In Texas Hold'em, you're only real options are to stay in the game, or fold. With that in mind
bots only need to return an integer representing the additional amount they wish to
add to the pot.

The game objects `betting` property shows the betting options available to the player/bot. `call`
represents the additional amount needed to stay in the game, while `raise` represents the minimum amount
a player can bet if they wish to raise.

- Wagers of less than the amount required to call are considered a 'fold'
- Wagers of '0', when the call amount is '0', are considered a check.
- Wagers greater than the call, but less than the minimum raise will result in a call
- A negative wager will force a fold.
- Failure to return an integer will assume a wager of '0', which may in turn result in a fold

#### Example players

Here's an extremely simple bot that only raises each betting round:

    // I only raise!
    module.exports = function () {
      var info = {
        name: "RaiseBot"
      };
      function play(game) {
        if (game.state !== "complete") {
          return game.betting.raise;
        }
      }

      return { play: play, info: info }
    }

Take a look at the code for the current set of players. Here are a couple decent examples:

- TimidBot only plays pairs [players/timidBot.js](players/timidBot.js)
- UnpredictableBot raises randomly at different stages of the game [players/unpredictableBot.js](players/unpredictableBot.js)

### Contribute

- Found a bug? By all means feel free to report it or send me a pull request.
- The next step is to build a tournament system for handling a real-time tournment with seperate players, each on their own host.
- It would be great to give people a way to watch or monitor game play.

### Resources

- [Texas Hold'em Wikipedia](http://en.wikipedia.org/wiki/Texas_hold_'em)
- Poker code and depenencies
  - [MachinePoker](https://github.com/mdp/MachinePoker) runs this competition
  - [Binions](https://github.com/mdp/binions) is the core code for playing Texas Hold'em
  - [Hoyle](https://github.com/mdp/hoyle) is the card/hand evaluator code
- #machinepoker on Freenode

### Requirements

- Node.js >= 0.10
- an 80386sx microprocessor or better with at least 8 MB of RAM
- OSx, Ubuntu, BSD, or some other POSIX compatible file system. (I don't have a windows machine to test with. Happy to take PR's to fix this)
