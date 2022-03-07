// conveyor array
const config = require("../config");
const typeCards = require("./cardColor");

var conveyor = [];
for (var i = 0; i < config.conveyorLength * 2; i++) {
  conveyor.push(typeCards[Math.floor(Math.random() * typeCards.length)]);
}

module.exports = conveyor;
