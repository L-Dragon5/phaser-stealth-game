import axios from 'axios';
import { CONSTANTS } from '../CONSTANTS';

import Player from '../components/Player';
import Controls from '../components/Controls';
import AttackCircle from '../components/AttackCircle';
import VisionCircle from '../components/VisionCircle';

import DebugScene from './DebugScene';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.MAIN })
    this.objects = {}
    this.playerId
    this.followTarget
    this.controls
  }

  init({ channel }) {
    this.channel = channel
  }

  updateCamera () {
    if (this.objects[this.playerId] !== undefined && this.followTarget != this.objects[this.playerId].playerObj) {
      this.followTarget = this.objects[this.playerId].playerObj;

      this.cameras.main.setBounds(0, 0, this.map.widthInPixels * CONSTANTS.SCALE_FACTOR, this.map.heightInPixels * CONSTANTS.SCALE_FACTOR);
      this.cameras.main.startFollow(this.followTarget, true, 0.25, 0.25);
    }
  }

  createPlayer (playerId, x, y) {
    return new Player(this, playerId, x, y);
  }

  createMap () {
    this.map = this.make.tilemap({ key: CONSTANTS.MAPS.ARENA.MAP });
    let tiles = this.map.addTilesetImage('Arena_Tileset', CONSTANTS.MAPS.ARENA.TILES);

    this.ground_layer = this.map.createDynamicLayer('ground_tiles', tiles, 0, 0).setDepth(-1).setScale(CONSTANTS.SCALE_FACTOR);
    this.map.createDynamicLayer('collision_tiles', tiles, 0, 0).setScale(CONSTANTS.SCALE_FACTOR);
    this.map.createDynamicLayer('overlay_tiles', tiles, 0, 0).setDepth(1).setScale(CONSTANTS.SCALE_FACTOR);
  }

  async create() {
    this.controls = new Controls(this, this.channel)
    this.createMap();

    const parseUpdates = updates => {
      if (typeof updates === undefined || updates === '') return []

      return JSON.parse(updates);
    }

    const updatesHandler = updates => {
      updates.forEach(gameObject => {
        const { playerId, hiddenFromOthers } = gameObject
        let { x, y } = gameObject;
        x = parseInt(x, 36);
        y = parseInt(y, 36);

        if (Object.keys(this.objects).includes(playerId.toString())) {
          // if the gameObject does already exist,
          // update the gameObject
          let playerObj = this.objects[playerId].playerObj;
          let visionCircle = this.objects[playerId].visionCircle;
          let attackCircle = this.objects[playerId].attackCircle;
          playerObj.setPosition(x, y);

          if (hiddenFromOthers) {
            if (playerId == this.playerId) {
              playerObj.setAlpha(0.5);
            } else {
              playerObj.setAlpha(0);
            }
          } else {
            if (playerId == this.playerId) {
              playerObj.setAlpha(1);
            } else {
              playerObj.setAlpha(0.75);
            }
          }

          if (playerId == this.playerId) {
            this.updateCamera();

            visionCircle.clear();
            visionCircle.fillCircle(x-1, y+5, CONSTANTS.PLAYER.VISION_RANGE);

            attackCircle.clear();
            attackCircle.fillCircle(x-1, y+5, CONSTANTS.PLAYER.ATTACK_RANGE);
          }
        } else {
          // if the gameObject does NOT exist,
          // create a new gameObject
          let newGameObject = {
            playerObj: this.createPlayer(playerId, x, y),
            playerId: playerId,
            visionCircle: new VisionCircle(this).fillCircle(x-1, y+5, CONSTANTS.PLAYER.VISION_RANGE),
            attackCircle: new AttackCircle(this).fillCircle(x-1, y+5, CONSTANTS.PLAYER.ATTACK_RANGE),
          };

          if (playerId == this.playerId) {
            newGameObject.playerObj.setAlpha(0.5);
          } else {
            newGameObject.playerObj.setAlpha(0);
          }
          
          this.objects = { ...this.objects, [playerId]: newGameObject }
          this.updateCamera();
        }

        // Debug Scene Setup
        if (CONSTANTS.DEBUG == true && playerId == this.playerId && this.objects[this.playerId] !== undefined) {
          this.scene.stop(CONSTANTS.SCENES.DEBUG);
          this.scene.launch(CONSTANTS.SCENES.DEBUG, { player: gameObject });
        }
      })
    }

    this.channel.on('updateObjects', updates => {
      let parsedUpdates = parseUpdates(updates)
      updatesHandler(parsedUpdates)
    })

    this.channel.on('removePlayer', playerId => {
      try {
        console.log(playerId);
        this.objects[playerId].playerObj.destroy()
        delete this.objects[playerId]
      } catch (error) {
        console.error(error.message)
      }
    })

    try {
      let res = await axios.get(
        `${location.protocol}//${location.hostname}:3000/getState`
      )

      let parsedUpdates = parseUpdates(res.data.state)
      updatesHandler(parsedUpdates)

      this.channel.on('getId', playerId36 => {
        this.playerId = parseInt(playerId36, 36)
        this.channel.emit('addPlayer')
      })

      this.channel.emit('getId')
    } catch (error) {
      console.error(error.message)
    }

    // Debug Scene Setup
    if (CONSTANTS.DEBUG == true) {
      this.scene.add(CONSTANTS.SCENES.DEBUG, DebugScene, false);
    }
  }
}
