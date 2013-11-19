var NUMBER_OF_TOURNAMENTS = 100,
    HANDS_PER_TOURNAMENT = 500,
    CHIPS = 1000,
    EARNINGS = 2.0;

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

function runTournaments(n, next) {
  var opts = {
    hands: HANDS_PER_TOURNAMENT,
    chips: CHIPS
  }
  var table = tournament.createTable(challenger, opts)
  table.on('tournamentComplete', function (players) {
    var player = getPlayer(players, challenger)
    if (player.chips >= CHIPS * EARNINGS) {
      sys.print(greenColor + "." + resetColor)
    } else {
      sys.print(redColor + "." + resetColor)
    }
    next(null, player.chips);
  });
  table.start();
}

describe("Writing a winning poker bot", function () {
  this.timeout(60000);

  it("should be your own bot", function (done) {
    assert.ok(challenger.name !== "Nameless Challenger", "Start by naming your bot");
    assert.ok(challenger.email.length > 0, "Give your email address");
    assert.ok(challenger.btcWallet.length > 0, "Where should we send the money?");
  });

  it("should increase money "+ EARNINGS + "x",
    function (done) {
      async.timesSeries(
        NUMBER_OF_TOURNAMENTS,
        runTournaments, function (err, winnings) {
          var toBeat = EARNINGS * NUMBER_OF_TOURNAMENTS * CHIPS;
          winnings = winnings.reduce(function (x, y) { return x + y });
          assert.ok(
            winnings > toBeat,
            "Needed to win at least $" + toBeat + ". Won $" + winnings
          )
          done()
        });
    }
  );

});
