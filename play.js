var path = require('path')
var fs = require('fs')
var tournament = require('./test/tournament')
    , MachinePoker = require('machine-poker')
    , JsSeat = MachinePoker.seats.JsLocal
    , ChallBot = require('./players/challengerBot')
    , allPlayers = require('./players');

function getAllPlayers() {
  var playersPath = path.join(__dirname, "players");
  var players = []

  fs.readdirSync(playersPath).forEach(function(file) {
    players.push(JsSeat.create(require('./players/' + file)))
  });

  return players
}

function runTournamentRound(players, callback) {
    var tables = tournament.setupTournament(players)
    for (var i=0; i<tables.length; i++) {
      //tables[i].addObserver(MachinePoker.observers.narrator)
    }
    return Promise.all(tables.map(function(t){
      return tournament.getWinningPlayerFromTable(t)
    }))
    .then(function(winners){
      if (winners.length > 1) {
        runTournamentRound(winners, callback)
      } else {
        callback(null, winners[0])
      }
    })
}

function loop(ttl, players, callback, winners) {
  ttl = ttl - 1
  winners = winners || []
  runTournamentRound(players, function(err, winner){
    if (err) {
      callback(err, winners)
    }
    winners.push(winner)
    if (ttl > 0) {
      loop(ttl, players, callback,  winners)
    } else {
      callback(err, winners)
    }
  })
}


function init(){
  var players = getAllPlayers()
  loop(1000, players, function(err,winners){
    var list = winners.reduce(function(l, w, i){
      var winner = l[w.name]
      if (l[w.name]) {
        l[w.name] = l[w.name] + 1
      } else {
        l[w.name] = 1
      }
      return l
    }, {})
    console.log(list)
  })
}

init();
