class Player extends Phaser.Physics.Arcade.Sprite {
  dead = false;
  inObjectiveArea = false;
  triggerAction = false;
  triggerAttack = false;
  doingAction = false;
  isAttacking = false;
  hiddenFromOthers = true;

  constructor(scene, playerId, x = 200, y = 200) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;

    this.prevX = -1;
    this.prevY = -1;

    this.prevDead = false
    this.prevTriggerAction = false;
    this.prevTriggerAttack = false;
    this.prevDoingAction = false;
    this.prevIsAttacking = false;
    this.prevHiddenFromOthers = true;

    this.playerId = playerId
    this.move = {}

    this.body.setSize(32, 48)

    this.setImmovable(false);
    this.setMaxVelocity(250);
    this.setDamping(true);
    this.setDrag(.9);
    this.setCollideWorldBounds(true)

    this.acceleration = 1000;
    this.animSuffix = '';

    scene.events.on('update', this.update, this)
  }

  getState () {
    return {
      playerId: this.playerId,
      x: this.x.toString(36),
      y:this.y.toString(36),
      dead: this.dead,
      doingAction: this.doingAction,
      isAttacking: this.isAttacking,
      hiddenFromOthers: this.hiddenFromOthers,
    };
  }

  checkForChanges () {
    let x = Math.abs(this.x - this.prevX) > 0.1;
    let y = Math.abs(this.y - this.prevY) > 0.1;
    let dead = this.dead != this.prevDead;
    let doingAction = this.doingAction != this.prevDoingAction;
    let isAttacking = this.isAttacking != this.prevIsAttacking;
    let hiddenFromOthers = this.hiddenFromOthers != this.prevHiddenFromOthers;

    if (x || y || dead || doingAction || isAttacking || hiddenFromOthers) {
      return true;
    }

    return false;
  }

  knockout() {
    this.dead = true
    this.hiddenFromOthers = true;
    this.setActive(false)
  }

  respawn() {
    this.dead = false
    this.hiddenFromOthers = true;
    this.setActive(true)
    this.setVelocity(0)
  }

  setMove(data) {
    this.move = data;
  }

  update() {
    if (this.body != undefined) {
      if (this.move.left) {
        if (this.body.velocity.x > 0) {
            this.body.setVelocityX(0);
        }
  
        this.body.setAccelerationX(-this.acceleration);
      } else if (this.move.right) {
          if (this.body.velocity.x < 0) {
              this.body.setVelocityX(0);
          }
  
          this.body.setAccelerationX(this.acceleration);
      } else {
          this.body.setAccelerationX(0);
      }
  
      if (this.move.down) { 
          if (this.body.velocity.y < 0) {
              this.body.setVelocityY(0);
          }
  
          this.body.setAccelerationY(this.acceleration);
      } else if (this.move.up) {
          if (this.body.velocity.y > 0) {
              this.body.setVelocityY(0);
          }
          this.body.setAccelerationY(-this.acceleration);
      } else {
          this.body.setAccelerationY(0);
      }

      if (this.doingAction || this.isAttacking) {
        this.body.setVelocity(0);
        this.body.setAcceleration(0);
      }

      if (!this.body.embedded) {
        this.inObjectiveArea = false;
      }
    }

    if (this.move.action) {
      this.triggerAction = true;
    } else {
      this.triggerAction = false;
    }

    if (this.move.attack) {
      this.triggerAttack = true;
    } else {
      this.triggerAttack = false;
    }
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
    this.prevDoingAction = this.doingAction
    this.prevIsAttacking = this.isAttacking
  }
}

module.exports = Player
