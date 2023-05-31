var tournament = require('./tournament')
    , MachinePoker = require('machine-poker');
    
const args = process.argv;

const round = args[2];
const hands = args[3];
var bots = tournament.getTable(__dirname + "/rounds/" + round + "/");

var table = tournament.createTable(bots,hands);
let logFile = "logs/round"+ round+".json";

// createFolderIfNotExists(folder);
table.addObserver(MachinePoker.observers.fileLogger(logFile));
table.start();
