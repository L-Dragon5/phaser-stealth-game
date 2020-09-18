export default class AttackCircle extends Phaser.GameObjects.Graphics {
  constructor(scene) {
    super(scene);
    scene.add.existing(this);

    this.setDepth(4);

    this.defaultFillColor = 0xff0000;
    this.defaultFillAlpha = 0.25;
    this.fillStyle(0xff0000, 0.25);
  }
}
