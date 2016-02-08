var MachinePoker = require('machine-poker')
    , JsSeat = MachinePoker.seats.JsLocal;

function distribute(a, n) {
  var tables = []
  var i = Math.ceil(a.length / n)
  for(var j=0; j < i; j++) {
    tables.push([])
  }
  for(var k=0; k < a.length; k++) {
    tables[k%i].push(a[k])
  }
  return tables
}

// Add all the players and return x number of tables
exports.setupTournament = function(players,opts) {
  opts = opts || {}
  var playerGroups = distribute(players, 7)
  var tables = []
  for (var i = 0; i < playerGroups.length; i++) {
    var table = MachinePoker.create({
      maxRounds: opts.hands || 100,
      chips: opts.chips || 1000
    });
    table.addPlayers(playerGroups[i])
    tables.push(table)
  }
  return tables
}

exports.getWinningPlayerFromTable = function(table) {
  return new Promise(function(resolve, reject) {
    table.on('tournamentComplete', function (players) {
      var winner = players[0]
      for (var i=0; i < players.length; i++) {
        var p = players[i];
        if (p.chips > winner.chips) {
          winner = p
        }
      }
      resolve(winner)
    })
    table.start();
  })
}

