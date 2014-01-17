var NUMBER_OF_TOURNAMENTS = 50,
    HANDS_PER_TOURNAMENT = 500,
    CHIPS = 1000,
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

var totalBankroll = CHIPS*NUMBER_OF_TOURNAMENTS;
function runTournaments(n, next) {
  var opts = {
    hands: HANDS_PER_TOURNAMENT,
    chips: CHIPS
  }
  var table = tournament.createTable(challenger, opts)
  table.on('tournamentComplete', function (players) {
    var player = getPlayer(players, challenger)
    totalBankroll += player.chips - CHIPS; // Take out the chips played;
    if (player.chips >= CHIPS * CHALLENGE) {
      sys.print(greenColor + (n+1) + ". W - Earnings: $" + player.chips + "\t\tTotal: $" + totalBankroll + resetColor + "\n")
    } else {
      sys.print(redColor + (n+1) +". L - Earnings: $" + player.chips + "\t\tTotal: $" + totalBankroll + resetColor + "\n")
    }
    next(null, player.chips);
  });
  table.start();
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
      sys.print("\n\n===Starting Tournaments===\n\n");
      async.timesSeries(
        NUMBER_OF_TOURNAMENTS,
        runTournaments, function (err, winnings) {
          var toBeat = CHALLENGE * NUMBER_OF_TOURNAMENTS * CHIPS;
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
