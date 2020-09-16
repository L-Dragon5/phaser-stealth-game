const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')
const CONSTANTS = require('../CONSTANTS')

const Player = require('./components/player')
const ObjectiveArea = require('./components/ObjectiveArea')

class GameScene extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })
    this.playerId = 0
  }

  init () {
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    })
    this.io.addServer(this.game.server)
  }

  preload () {
    this.load.setPath('../../../../dist/maps');

    for (let map in CONSTANTS.MAPS) {
      this.load.image(CONSTANTS.MAPS[map].TILES, CONSTANTS.MAPS[map].TILES);
      this.load.tilemapTiledJSON(CONSTANTS.MAPS[map].MAP, CONSTANTS.MAPS[map].MAP);
    }
  }

  getId () {
    return this.playerId++
  }

  getState () {
    let state = [];
    this.playersGroup.children.iterate((player) => {
      state.push(player.getState());
    });
    return JSON.stringify(state);
  }

  inObjectiveArea (player, objectiveArea) {
    player.inObjectiveArea = true;

    // Check if objective is being worked on by a player
    // If not, set the active player of objective as the current player
    if (objectiveArea.beingUsed) {
      // If the active player doesn't exist anymore or if player is knocked out
      if(objectiveArea.activePlayer != undefined && !this.playersGroup.children.contains(objectiveArea.activePlayer)) {
        objectiveArea.activePlayer = undefined;
        objectiveArea.beingUsed = false;
      }

      // If current player that's overlapping is the active player on objective
      // If not, set that player as doing nothing
      if (objectiveArea.activePlayer == player) {
        // TODO: Timer to complete objective
      } else {
        player.doingAction = false;
      }
    } else {
      // If player is in zone and attempting to do objective
      if (player.inObjectiveArea && player.triggerAction) {
        player.doingAction = true;
        player.hiddenFromOthers = false;
        objectiveArea.activePlayer = player;
        objectiveArea.beingUsed = true;
      }
    }
  }

  create () {
    this.playersGroup = this.add.group()

    // Map Creation
    this.map = this.make.tilemap({ key: CONSTANTS.MAPS.ARENA.MAP });
    let tiles = this.map.addTilesetImage('Arena_Tileset', CONSTANTS.MAPS.ARENA.TILES);

    this.map.createDynamicLayer('ground_tiles', tiles, 0, 0).setDepth(-1).setScale(CONSTANTS.SCALE_FACTOR);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels * CONSTANTS.SCALE_FACTOR, this.map.heightInPixels * CONSTANTS.SCALE_FACTOR)

    let collisionTiles = this.map.createDynamicLayer('collision_tiles', tiles, 0, 0).setScale(CONSTANTS.SCALE_FACTOR);
    collisionTiles.setCollisionByExclusion([-1]);

    let triggersObj = this.map.getObjectLayer('triggers').objects;
    let objectiveAreas = this.physics.add.group();

    triggersObj.forEach((obj) => {
      const objectiveArea = new ObjectiveArea(this, obj.x, obj.y, obj.width, obj.height);
      objectiveArea.setName(obj.name);
      objectiveArea.setOrigin(0);
      objectiveAreas.add(objectiveArea);
    });
    // End Map Creation

    this.io.onConnection((channel) => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        this.playersGroup.children.each((player) => {
          if (player.playerId == channel.playerId) {
            player.destroy()
          }
        })
        channel.emit('removePlayer', channel.playerId)
      })

      channel.on('getId', () => {
        channel.playerId = this.getId()
        channel.emit('getId', channel.playerId.toString(36))
      })

      channel.on('playerMove', (data) => {
        this.playersGroup.children.each((player) => {
          if (player.playerId === channel.playerId) {
            player.setMove(data)
          }
        })
      })

      channel.on('addPlayer', (data) => {
        let player = new Player(
          this,
          channel.playerId,
          Phaser.Math.RND.integerInRange(0, this.physics.world.bounds.width),
          Phaser.Math.RND.integerInRange(0, this.physics.world.bounds.height)
        )
        this.physics.add.collider(player, collisionTiles)
        this.physics.add.overlap(player, objectiveAreas, this.inObjectiveArea, null, this);
        this.playersGroup.add(player)
      })

      channel.emit('ready')
    })
  }

  update () {
    let updates = [];
    this.playersGroup.children.iterate((player) => {
      if (player.checkForChanges()) {
        updates.push(player.getState());
      }

      player.postUpdate()
    })

    if (updates.length > 0) {
      this.io.room().emit('updateObjects', JSON.stringify(updates))
    }
  }
}

module.exports = GameScene
