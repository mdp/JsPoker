var MachinePoker = require('machine-poker')
    , SmartBot = require('../players/smartBot')
    , MercBot = require('../players/mercBot')
    , CallBot = require('../players/callBot')
    , UnpredictableBot = require('../players/unpredictableBot')
    , RandBot = require('../players/randBot')
    , JsSeat = MachinePoker.seats.JsLocal;

exports.createTable = function (challenger, opts) {
  var table = MachinePoker.create({
    maxRounds: opts.hands || 100,
    chips: opts.chips || 1000
  });

  table.addPlayers(
    [ JsSeat.create(MercBot)
    , JsSeat.create(SmartBot)
    , JsSeat.create(CallBot)
    , JsSeat.create(UnpredictableBot)
    , JsSeat.create(RandBot)
    , JsSeat.create(CallBot)
    , challenger
    ]
  );
  return table;
}
