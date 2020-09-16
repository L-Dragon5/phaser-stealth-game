export default class Controls {
  constructor(scene, channel) {
    this.scene = scene
    this.channel = channel

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursors.attack = this.scene.input.keyboard.addKey('Z');

    this.scene.events.on('update', this.update, this)
  }

  update() {
    let input = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      down: this.cursors.down.isDown,
      up: this.cursors.up.isDown,
      action: this.cursors.space.isDown,
      attack: this.cursors.attack.isDown,
    };

    this.channel.emit('playerMove', input);
  }
}
