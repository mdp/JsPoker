var MachinePoker = require('machine-poker')
    , SmartBot = require('../players/smartBot')
    , MercBot = require('../players/mercBot')
    , TollusBot = require('../players/tollusBot')
    , FlopsASetBot = require('../players/flopsASetBot')
    , BlaBot = require('../players/blaBot')
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
    , JsSeat.create(TollusBot)
    , JsSeat.create(FlopsASetBot)
    , JsSeat.create(BlaBot)
    , JsSeat.create(UnpredictableBot)
    , challenger
    ]
  );
  return table;
}
