var tournament = require('./test/tournament')
    , MachinePoker = require('machine-poker')
    const fs = require('fs');

    
const args = process.argv;

const round = args[2]; // Replace with desired round number
var buckets = tournament.getTableBuckets(__dirname + "/rounds/" + round + "/");
for (let i = 0; i < buckets.length; i++) {
    var table = tournament.createTable(buckets[i], {hands:100});
    table.addObserver(MachinePoker.observers.narrator);
    let folder = "logs/round"+ round;
    createFolderIfNotExists(folder);
    //create filename which matches the round and the table number
    let filename = folder + "/table" + i + ".json";
    table.addObserver(MachinePoker.observers.fileLogger(filename));
    table.start();
    break;
}

function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }