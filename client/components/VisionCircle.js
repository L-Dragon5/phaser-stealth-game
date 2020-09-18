export default class VisionCircle extends Phaser.GameObjects.Graphics {
  constructor(scene) {
    super(scene);
    scene.add.existing(this);
    
    this.setDepth(4);

    this.defaultFillColor = 0xffffff;
    this.defaultFillAlpha = 0.25;
    this.fillStyle(0xffffff, 0.25);
  }
}
