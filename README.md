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

## How to use

1. Clone this repository and run `npm install`
2. Use `play.js` to execute all bots in a round: `node play.js <round> <maxHands>`
3. Use `evaluate.js` to evaluate how a specific round plays out: `node evaluate.js <round>`
4. results/roundX.json will provide the final state of a given round
5. Have fun!

## Original repository

The original repository is located at https://github.com/mdp/JsPoker.

## License

This fork is released under the same license as the original repository, which is the MIT license.
