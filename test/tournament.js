const MachinePoker = require('machine-poker');
const path = require('path');
const fs = require('fs');

exports.createTable = function(players) {
  const JsSeat = MachinePoker.seats.JsLocal;

  const table = MachinePoker.create({
    maxRounds: 3 ,
    chips: 1000
  });

  const playerSeats = players.map(player => JsSeat.create(player));

  table.addPlayers(playerSeats);

  return table;
}

exports.getTableBuckets = function(path) {
  const list = requireAllFilesInFolder(path);
  // Shuffle the list randomly
  const shuffledList = list.sort(() => Math.random() - 0.5);
  
  // Create an array to hold the buckets
  const buckets = [];
  
  // Iterate over the shuffled list, adding each element to a bucket
  for (let i = 0; i < shuffledList.length; i += 8) {
    const bucket = shuffledList.slice(i, i + 8);
    buckets.push(bucket);
  }
  
  return buckets;
}

function requireAllFilesInFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  const requiredFiles = [];
  
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    
    // Only require .js files
    if (path.extname(filePath) === '.js') {
      requiredFiles.push(require(filePath));
    }
  });
  
  return requiredFiles;
}