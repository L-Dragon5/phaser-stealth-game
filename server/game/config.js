require('@geckos.io/phaser-on-nodejs');

const Phaser = require('phaser');
const GameScene = require('./gameScene');

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 800,
  height: 600,
  banner: false,
  audio: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false,
    },
  },
};

module.exports = config;
