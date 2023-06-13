const fs = require('fs');
const fsp = require('fs').promises;

async function readJsonFile(filename) {
    try {
        const data = await fsp.readFile(filename, 'utf8');
        const obj = JSON.parse(data);
        return obj[obj.length-1].players;
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
    }
}

function mergeMaps(map1, map2) {
    let result = new Map();

// Iterate over map1 and add entries to the result Map
for (let [key, value] of map1) {
    result.set(key, value);
}

// Iterate over map2, and if the key already exists, add the value to the existing value
for (let [key, value] of map2) {
    let existingValue = result.get(key) || 0;  // get the existing value, if any
    result.set(key, existingValue + value);    // add the value from map2
}
return result;
}

function readFileIfExists(filename) {
    if (fs.existsSync(filename)) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            const arr = JSON.parse(data);
            return new Map(arr);
        } catch (err) {
            console.log(err);
            return new Map();
        }
    } else {
        return new Map()
    }
}

const args = process.argv;
const round = args[2] || 3;
var scoresFile = './score/round'+round+'.json'
var existing = readFileIfExists(scoresFile);

// Usage
readJsonFile('./logs/round'+round+'.json')
    .then(players => {
        // get player names and chips
        const content = players.map(player => {
            return {
                name: player.name,
                chips: player.chips
            }
        });
        const map = new Map(content.map(item => [item.name, item.chips]));
        var newScores = mergeMaps(existing, map);
        console.log(newScores);
        // save to file
        let arr = Array.from(newScores);

        // Convert the array to a JSON string
        let json = JSON.stringify(arr);

        // Write the JSON string to a file
        fs.writeFileSync(scoresFile, json);
    })
    .catch(error => console.error(error));
    