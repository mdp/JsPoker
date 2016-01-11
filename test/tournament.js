var MachinePoker = require('machine-poker')
    , SneakyCharlie = require('../players/sneakyCharlieBot')
    , SmartBot = require('../players/smartBot')
    , MercBot = require('../players/mercBot')
    , TollusBot = require('../players/tollusBot')
    , FlopsASetBot = require('../players/flopsASetBot')
    , BlaBot = require('../players/blaBot')
    , WhistleTipsBot = require('../players/whistleTipsBot')
    , CallBot = require('../players/callBot')
    , UnpredictableBot = require('../players/unpredictableBot')
    , RandBot = require('../players/randBot')
    , ThoseAreMyFish = require('../players/thoseAreMyFish')
    , Edi9999 = require('../players/edi9999')
    , Status3 = require('../players/status3Bot')
    , Wittgenstein = require('../players/wittgenstein')
    , JsSeat = MachinePoker.seats.JsLocal;

exports.createTable = function (challenger, opts) {
  var table = MachinePoker.create({
    maxRounds: opts.hands || 100,
    chips: opts.chips || 1000
  });

  table.addPlayers(
    [ JsSeat.create(Wittgenstein)
    , JsSeat.create(Status3)
    , JsSeat.create(Edi9999)
    , JsSeat.create(SneakyCharlie)
    , JsSeat.create(FlopsASetBot)
    , JsSeat.create(WhistleTipsBot)
    , challenger
    ]
  );
  return table;
}
