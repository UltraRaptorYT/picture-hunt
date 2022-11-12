const config = require("../config");
const numOfFiles = config.numberOfFiles;

var output = [];

while (output.length < config.gridSize ** 2) {
  for (var i = 0; i < numOfFiles; i++) {
    do {
      var random = Math.floor(Math.random() * config.gridSize);
      var card =
        i +
        1 +
        "|" +
        Object.values(config.color)[random] +
        "|" +
        Object.keys(config.color)[random];
      output.push(card);
      if (output.length - 1 != output.indexOf(card)) {
        output.splice(output.length - 1, 1);
      }
    } while (output.length - 1 != output.indexOf(card));
  }
}
var output2 = [];
for (var i = 0; i < config.gridSize ** 2; i++) {
  var random = Math.floor(Math.random() * output.length);
  output2.push(output.splice(random, 1)[0]);
}

module.exports = output2;
