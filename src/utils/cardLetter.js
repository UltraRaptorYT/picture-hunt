var config = require("../config");
var output = [];

while (output.length < config.gridSize ** 2) {
  do {
    var random = Math.floor(Math.random() * config.letters.length);
    var letter = config.letters[random];
    output.push(letter);
    if (output.length - 1 != output.indexOf(letter)) {
      output.splice(output.length - 1, 1);
    }
  } while (output.length - 1 != output.indexOf(letter));
}

module.exports = output;
