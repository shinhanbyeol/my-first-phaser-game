import Phaser from "phaser";

export default class Explosion extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, position, scale = 2) {
    super(scene, position[0], position[1], "explosion");
    this.scale = scale;
    this.setDepth(50);
    this.play("explode");
    scene.add.existing(this);
  }
}
