![JS Poker](http://img.mdp.im.s3.amazonaws.com/2013m18Untitled_7u9swn.jpg)

# JS Poker

A no-limit Texas hold'em poker tournament for Javascript bots.

### Current Bounty $xxxUSD paid to the winner via Bitcoins

### How to play

1. Build a poker bot
1. Tune it to double your money over the course of 25,000 hands (50 Tournaments of 500 hands)
1. Submit a pull request. If the Travis tests pass, you win the bounty.
1. Winning bot is added to the table. Contest repeats.

### Rules

1. Only one file may be modified in the pull request, 'players/challengerBot.js' (Pull requests to fix other issues are gladly accepted however)
1. You cannot load any modules. This includes Node.js core modules (fs, http, etc.)
1. Source code may not be obsfuscated/minfied.
1. Bots must win through legitimate poker play. Hacking is fine, but the bounty will only be paid to legitimate winners. Thinkof it this way, if your bot was in a casino, would it get kicked out or arrested?

### Instructions

    git clone https://github.com/mdp/JsPoker.git
    cd JsPoker
    npm install
    npm test

#### Building a better poker bot

You can test out your bot with a small 100 hand game using `play.js`

    node play.js

The output will include each bots betting actions and cards held in order
to make tuning and debugging easier.

##### Game data and bot actions

Bots are handed an a game data object with the current state of the game and simply have
to return a wager as an integer.

##### Game data

Here's an example game date payload: [GameData.json](https://gist.github.com/mdp/050cd82f651eb9f9b9c8)

- Wagers of less than the amount required to call are considered a 'fold'
- Wagers of '0', when the call amount is '0', are considered a check.
- A negative wager will force a fold.
- Failure to return an integer will assume a wager of '0', which may in turn result in a fold

##### Example players

Take a look at the players currently at the table for an idea of how this works.

- TimidBot only plays pairs [players/timidBot.js](players/timidBot.js)
- UnpredictableBot raises randomly at different stages of the game [players/unpredictableBot.js](players/unpredictableBot.js)

