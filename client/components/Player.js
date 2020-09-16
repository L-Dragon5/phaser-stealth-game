import { CONSTANTS } from '../CONSTANTS';

export default class Player extends Phaser.GameObjects.Sprite {
  playerId;

  constructor(scene, playerId, x, y) {
    super(scene, x, y, CONSTANTS.SPRITES.PLAYER);
    scene.add.existing(this);

    this.playerId = playerId;

    this.setFrame(4);
  }
}
