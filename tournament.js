const MachinePoker = require("machine-poker");
const path = require("path");
const fs = require("fs");

exports.createTable = function (players, maxRounds) {
  const JsSeat = MachinePoker.seats.JsLocal;

  const table = MachinePoker.create({
    maxRounds: maxRounds,
    chips: 10000,
  });

  //const playerSeats = players.map(player => JsSeat.create(player));
  const bots = players.map((p) => bot(p.update, p.name));
  const playerSeats = bots.map((player) => JsSeat.create(player));

  table.addPlayers(playerSeats);

  return table;
};

exports.getTable = function (path) {
  const list = requireAllFilesInFolder(path);
  // Shuffle the list randomly
  return list.sort(() => Math.random() - 0.5);
};

function requireAllFilesInFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  const requiredFiles = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);

    // Only require .js files
    if (path.extname(filePath) === ".js") {
      requiredFiles.push(require(filePath));
    }
  });

  return requiredFiles;
}

function bot(updateFn, name) {
  var info = {
    name: name,
    email: "",
    btcWallet: "",
  };

  function update(game) {
    if (game.state !== "complete") {
      try {
        return updateFn(game);
      } catch (e) {
        return 0;
      }
    }
  }

  return function id() {
    this.update = update;
    this.info = info ;
  };
}
