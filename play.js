var tournament = require('./test/tournament')
    , MachinePoker = require('machine-poker')
    , ChallBot = require('./players/challengerBot')
    , challenger = MachinePoker.seats.JsLocal.create(ChallBot);

var table = tournament.createTable(challenger, {hands:100});
table.addObserver(MachinePoker.observers.narrator);
table.start();
