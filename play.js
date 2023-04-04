var tournament = require('./tournament')
    , MachinePoker = require('machine-poker')
    const fs = require('fs');

    
const args = process.argv;

const round = args[2];
const hands = args[3];
var bots = tournament.getTable(__dirname + "/rounds/" + round + "/");
var table = tournament.createTable(bots,hands);
let logFile = "logs/round"+ round+".json";
// createFolderIfNotExists(folder);
//create filename which matches the round and the table number
let filename = logFile;
table.addObserver(MachinePoker.observers.fileLogger(filename));
table.start();

function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }