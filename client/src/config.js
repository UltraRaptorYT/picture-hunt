module.exports = {
  gridSize: 4, // grid size = n x n
  conveyorLength: 20, // conveyor length
  numberOfFiles: 8, // number of different shapes
  color: {
    RED: "invert(28%) sepia(86%) saturate(2889%) hue-rotate(339deg) brightness(93%) contrast(97%)",
    BLUE: "invert(46%) sepia(32%) saturate(7070%) hue-rotate(173deg) brightness(99%) contrast(101%)",
    GREEN:
      "invert(42%) sepia(85%) saturate(362%) hue-rotate(82deg) brightness(98%) contrast(88%)",
    YELLOW:
      "invert(90%) sepia(30%) saturate(2722%) hue-rotate(336deg) brightness(104%) contrast(101%)",
    ORANGE:
      "invert(56%) sepia(55%) saturate(5104%) hue-rotate(1deg) brightness(102%) contrast(106%)",
    PURPLE:
      "invert(45%) sepia(46%) saturate(810%) hue-rotate(238deg) brightness(83%) contrast(88%)",
    PINK: "invert(63%) sepia(44%) saturate(1567%) hue-rotate(289deg) brightness(96%) contrast(93%)",
  },
  p1Start: 10, // start player position
  p2Start: 12, // 2nd player position
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Characters for Grid
  codeLength: 5, // code length of Room
  timer: 60, // Time for cool down in seconds
};
