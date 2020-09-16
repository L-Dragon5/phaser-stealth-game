import '@babel/polyfill';
import { CONSTANTS } from './CONSTANTS';

import Phaser, { Game } from 'phaser';
import PreloadScene from './scenes/PreloadScene';

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONSTANTS.DEFAULT_WIDTH,
    height: CONSTANTS.DEFAULT_HEIGHT,
  },
  scene: [PreloadScene],
};

window.addEventListener('load', () => {
  const game = new Game(config);
});
