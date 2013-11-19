var NUMBER_OF_TOURNAMENTS = 50,
    HANDS_PER_TOURNAMENT = 500,
    PERCENTAGE_NEEDED_TO_WIN = 0.60;

var tournament = require('./tournament')
    , MachinePoker = require('machine-poker')
    , ChallBot = require('../players/challengerBot')
    , challenger = MachinePoker.seats.JsLocal.create(ChallBot)
    , async = require('async')
    , sys = require('sys')
    , assert = require('assert');

function runTournaments(n, next) {
  var opts = {
    hands: HANDS_PER_TOURNAMENT
  }
  var table = tournament.createTable(challenger, opts)
  table.on('tournamentComplete', function (players) {
    players = players.sort(function(a, b){ return a.chips < b.chips });
    sys.print("Round #" + (n+1) + " - " + players[0].name + ", ");
    next(null, players[0]);
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

  it("should win "+ PERCENTAGE_NEEDED_TO_WIN * 100 +"% of tournaments",
    function (done) {
      async.timesSeries(
        NUMBER_OF_TOURNAMENTS,
        runTournaments, function (err, winners) {
          var wins = winners.filter(function(w) {
            if (w.name === challenger.name) return true;
          }).length
          var winsNeeded = Math.floor(PERCENTAGE_NEEDED_TO_WIN * NUMBER_OF_TOURNAMENTS);

          assert.ok(
            winsNeeded < wins,
            "Needed to win at least " + winsNeeded + " tournaments. Won " + wins
          )
          done()
        });
    }
  );

});
