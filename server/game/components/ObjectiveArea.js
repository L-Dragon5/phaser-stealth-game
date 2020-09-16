class ObjectiveArea extends Phaser.GameObjects.Zone {
  beingUsed = false;
  activePlayer;
  
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
  }
}

module.exports = ObjectiveArea
