import { CONSTANTS } from '../CONSTANTS';
import geckos from '@geckos.io/client'
import MainScene from './MainScene';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.LOAD })
  }

  loadImages () {
    this.load.setPath('./img');

    for (let imageprop in CONSTANTS.IMAGES) {
      this.load.image(CONSTANTS.IMAGES[imageprop], CONSTANTS.IMAGES[imageprop]);
    }
  }

  loadMaps () {
    this.load.setPath('./maps');

    for (let map in CONSTANTS.MAPS) {
      this.load.image(CONSTANTS.MAPS[map].TILES, CONSTANTS.MAPS[map].TILES);
      this.load.tilemapTiledJSON(CONSTANTS.MAPS[map].MAP, CONSTANTS.MAPS[map].MAP);
    }
  }

  preload () {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 75, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff',
      },
    });
    percentText.setOrigin(0.5);

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff',
      },
    });
    assetText.setOrigin(0.5);

    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 65, 300 * value, 30);
    });

    this.load.on('fileprogress', (file) => {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.loadMaps();
    this.loadImages();

    this.load.spritesheet(CONSTANTS.SPRITES.PLAYER, CONSTANTS.SPRITES.PLAYER, {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create () {
    const channel = geckos({ port: 3000 });

    channel.onConnect(error => {
      if (error) console.error(error.message);

      channel.on('ready', () => {
        this.scene.add(CONSTANTS.SCENES.MAIN, MainScene, true, { channel: channel });
      });
    });
    

    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
