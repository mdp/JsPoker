var NUMBER_OF_TOURNAMENTS = 50,
    HANDS_PER_TOURNAMENT = 500,
    CHIPS = 1000,
    ROUND = 7,
    CHALLENGE = 2.0;

var tournament = require('./tournament')
    , MachinePoker = require('machine-poker')
    , ChallBot = require('../players/challengerBot')
    , challenger = MachinePoker.seats.JsLocal.create(ChallBot)
    , async = require('async')
    , sys = require('sys')
    , assert = require('assert');

var redColor   = '\033[31m'
    , greenColor = '\033[32m'
    , blueColor  = '\033[34m'
    , resetColor = '\033[0m';

function getPlayer(players, player) {
  for (var i=0; players.length > i; i++) {
    if (player.name === players[i].name) {
      return players[i];
    }
  }
}

var playerWinnings = {};
var totalBankroll = CHIPS*NUMBER_OF_TOURNAMENTS;
function runTournaments(n, next) {
  var opts = {
    hands: HANDS_PER_TOURNAMENT,
    chips: CHIPS
  }
  var table = tournament.createTable(challenger, opts)
  table.on('tournamentComplete', function (players) {
    for (var i=0; i < players.length; i++) {
      var p = players[i];
      if (playerWinnings[p.name]) {
        playerWinnings[p.name] += (p.chips - CHIPS);
      } else {
        playerWinnings[p.name] = CHIPS*NUMBER_OF_TOURNAMENTS;
      }
    }
    var player = getPlayer(players, challenger);
    var bankRoll = playerWinnings[challenger.name];
    if (player.chips >= CHIPS * CHALLENGE) {
      sys.print(greenColor + (n+1) + ". W - Earnings: $" + player.chips + "\t\t\tTotal: $" + bankRoll + resetColor + "\n")
    } else {
      sys.print(redColor + (n+1) +". L - Earnings: $" + player.chips + "\t\tTotal: $" + bankRoll + resetColor + "\n")
    }
    next(null, player.chips);
  });
  table.start();
}

function printTournamentResults() {
  sys.print(resetColor + "\n");
  console.log("Player Standings");
  sys.print(resetColor + "\n");
  var sortable = [];
  for (var name in playerWinnings) {
    sortable.push([name, playerWinnings[name]])
  }
  sortable.sort(function(a, b) {return b[1] - a[1]})
  for (var i=0; i<sortable.length; i++) {
    if (i==0) {
      sys.print(greenColor + (i+1) + ". " + sortable[i][0] + " $" + sortable[i][1] + resetColor + "\n");
    } else {
      sys.print(redColor + (i+1) + ". " + sortable[i][0] + " $" + sortable[i][1] + resetColor + "\n");
    }
  }
}

describe("Writing a winning poker bot", function () {
  this.timeout(120000);

  it("should be your own bot", function (done) {
    assert.ok(challenger.playerInfo.name !== "Nameless Challenger", "Start by naming your bot");
    assert.ok(challenger.playerInfo.email.length > 0, "Give your email address");
    assert.ok(challenger.playerInfo.btcWallet.length > 0, "Where should we send the money?");
    done();
  });

  it("should increase money "+ CHALLENGE + "x",
    function (done) {
      sys.print("\n\n===Starting Tournament Round " + ROUND + "===\n\n");
      async.timesSeries(
        NUMBER_OF_TOURNAMENTS,
        runTournaments, function (err, winnings) {
          var toBeat = CHALLENGE * NUMBER_OF_TOURNAMENTS * CHIPS;
          winnings = winnings.reduce(function (x, y) { return x + y });
          printTournamentResults();
          assert.ok(
            winnings > toBeat,
            "Needed to win at least $" + toBeat + ". Won $" + winnings
          );
          done();
        });
    }
  );

});
