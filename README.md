![JS Poker](http://img.mdp.im.s3.amazonaws.com/2013m19Untitled_83t55f.jpg)

# JS Poker

A No-limit Texas Hold'em poker tournament for Javascript bots.

### Current Bounty $xxxUSD paid to the winner via Bitcoin

## Introduction

JsPoker is a automated poker competition, where your opponents are bots writen in Javascript.
At the present moment they are each quite unintelligent/unimaginative. The challenge is to
write a competitor in JS that can handily beat them all over the course of 50 tournaments,
each with a maximum of 500 hands.

You win if your bot doubles it's money, and we consider a bounty claimed when your bot
is submitted via a pull request and the Travis-CI tests pass. (Tests will run the
tournament simulation and pass or fail based on performance)

If you win, your bot will be added to the table to play future bots.

## How to play

1. Modify the existing [challenger bot](players/challengerBot.js)
1. Tune it to double your money over the course of 25,000 hands (50 Tournaments of 500 hands each)
1. Test it with `npm test` until your confident it has a good chance of winning.
1. Submit a pull request. If the Travis tests pass, you win the bounty.
1. Winning bot is added to the table. Contest repeats.

## Rules

1. The game is No-limit Texas Hold'em ($10-20), with each player starting with $1000
1. Only one file may be modified in the pull request, 'players/challengerBot.js' (Pull requests to fix other issues are gladly accepted however)
1. You cannot load any modules. This includes Node.js core modules (fs, http, etc.)
1. Source code may not be obsfuscated/minfied, in order to allow winnners to be easily analyzed.
1. Bots must win through legitimate poker play. Hacking is fine, but the bounty will only be paid to legitimate winners. Thinkof it this way, if your bot was in a casino, would it get kicked out or arrested?

## Installation

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

- Wagers of less than the amount required to call are considered a 'fold'
- Wagers of '0', when the call amount is '0', are considered a check.
- A negative wager will force a fold.
- Failure to return an integer will assume a wager of '0', which may in turn result in a fold

#### Game data

Here's an example game date payload: [GameData.json](https://gist.github.com/mdp/050cd82f651eb9f9b9c8)

#### Example players

Take a look at the code for the current set of players. Here are a couple decent examples:

- TimidBot only plays pairs [players/timidBot.js](players/timidBot.js)
- UnpredictableBot raises randomly at different stages of the game [players/unpredictableBot.js](players/unpredictableBot.js)

