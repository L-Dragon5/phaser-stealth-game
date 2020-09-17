import { CONSTANTS } from '../CONSTANTS';

export default class DebugScene extends Phaser.Scene {
  constructor () {
    super({ key: CONSTANTS.SCENES.DEBUG })
  }

  init (data) {
    this.player = data.player;
  }

  create () {
    this.fpsText = new Phaser.GameObjects.Text(this, 10, 10, 'FPS: ', { color: '#000000', fontSize: '28px' });
    this.add.existing(this.fpsText);
    this.fpsText.setOrigin(0);
    this.fpsText.setScrollFactor(0);
    this.fpsText.setDepth(10);

    this.doingAction = new Phaser.GameObjects.Text(this, 10, 35, 'Doing Action: ', { color: '#000000', fontSize: '28px' });
    this.add.existing(this.doingAction);
    this.doingAction.setOrigin(0);
    this.doingAction.setScrollFactor(0);
    this.doingAction.setDepth(10);

    this.isAttacking = new Phaser.GameObjects.Text(this, 10, 65, 'Attacking: ', { color: '#000000', fontSize: '28px' });
    this.add.existing(this.isAttacking);
    this.isAttacking.setOrigin(0);
    this.isAttacking.setScrollFactor(0);
    this.isAttacking.setDepth(10);

    this.score = new Phaser.GameObjects.Text(this, 10, 85, 'Score: ', { color: '#000000', fontSize: '28px' });
    this.add.existing(this.score);
    this.score.setOrigin(0);
    this.score.setScrollFactor(0);
    this.score.setDepth(10);
  }

  update() {
    this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    
    if (this.player !== undefined) {
      this.doingAction.setText(`Doing Action: ${this.player.doingAction}`);
      this.isAttacking.setText(`Attacking: ${this.player.isAttacking}`);
      this.score.setText(`Score: ${this.player.score}`);
    }
  }
}
