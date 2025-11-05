import Phaser from "phaser";
import Config from "../Config";
import { clamp } from "../utils/math";

export default class ExpBar extends Phaser.GameObjects.Graphics {
  constructor(scene, m_maxExp = 50) {
    super(scene);

    this.HEIGHT = 30;
    this.WIDTH = Config.width;

    this.m_x = 0;
    this.m_y = 30;

    this.m_maxExp = m_maxExp;
    this.m_currentExp = 0;

    this.draw();
    this.setDepth(100);
    this.setScrollFactor(0);

    scene.add.existing(this);
  }

  increase(amount) {
    this.m_currentExp = clamp(this.m_currentExp + amount, 0, this.m_maxExp);
    this.draw();
  }

  reset() {
    this.m_currentExp = 0;
    this.draw();
  }

  draw() {
    this.clear();

    // Draw the background
    this.fillStyle(0x000000);
    this.fillRect(this.m_x, this.m_y, this.WIDTH, this.HEIGHT);

    // Draw the foreground
    this.fillStyle(0xffffff);
    this.fillRect(this.m_x + 2, this.m_y + 2, this.WIDTH - 4, this.HEIGHT - 4);

    // Draw the current EXP
    const expWidth = ((this.WIDTH - 4) * this.m_currentExp) / this.m_maxExp;
    this.fillStyle(0x00ff00);
    this.fillRect(this.m_x + 2, this.m_y + 2, expWidth, this.HEIGHT - 4);
  }
}
