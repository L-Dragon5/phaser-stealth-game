class ObjectiveArea extends Phaser.GameObjects.Zone {
  beingUsed = false;
  activePlayer;
  checkCalled = false;
  
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
  }

  checkIfPlayerExists (playersGroup) {
    if (this.activePlayer != undefined && !this.activePlayer.dead && playersGroup.children.contains(this.activePlayer)) {
      return true;
    }

    return false;
  }
}

module.exports = ObjectiveArea
