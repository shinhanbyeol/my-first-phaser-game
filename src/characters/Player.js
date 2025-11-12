import Phaser from "phaser";
import Config from "../Config";
import HpBar from "../ui/Hpbar";
import { loseGame } from "../utils/seceneManager";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    // 화면의 가운데에 player를 추가해줍니다.
    // scene.add.existing : scene에 오브젝트를 추가
    // scene.physics.add.existing : scene의 물리엔진에 오브젝트를 추가
    super(scene, Config.width / 2, Config.height / 2, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.m_canBeAttacked = true;

    this.m_hp = 100;
    this.m_exp = 0;

    // scale 프로퍼티를 조절해 크기를 조절할 수 있습니다. (디폴트: 1)
    this.scale = 2;

    // depth를 조절해 어떤 오브젝트가 앞에 오고 뒤에 올지 설정할 수 있습니다.
    // CSS의 z-index와 비슷한 개념입니다. (디폴트: 0)
    this.setDepth(20);

    // 해당 오브젝트가 물리적으로 얼만큼의 면적을 차지할 지 설정하는 함수입니다.
    // 디폴트로 이미지 사이즈로 설정되는데, 그러면 추후 몹을 추가했을 때 너무 잘 부딪히는 느낌이 드므로 원본 이미지보다 약간 작게 설정해주었습니다.
    this.setBodySize(24, 28);

    this.m_moving = false;

    scene.events.on("update", (time, delta) => {
      this.update(time, delta);
    });

    this.m_hbBar = new HpBar(scene, this, this.m_hp);
  }

  move(vector) {
    // console.log(vector);
    let PLAYER_SPEED = 3;

    this.x = vector[0] * PLAYER_SPEED + this.x;
    this.y = vector[1] * PLAYER_SPEED + this.y;

    if (vector[0] < 0) {
      this.flipX = false;
    } else if (vector[0] > 0) {
      this.flipX = true;
    }
  }

  update(time, delta) {
    if (this.m_hp <= 0) {
      loseGame(this.scene);
    }
  }

  gainHp(amount) {
    this.m_hp += amount;
    if (this.m_hp > this.m_maxHp) {
      this.m_hp = this.m_maxHp;
    }
    this.m_hbBar.increase(amount);
  }

  hitByMob(damage) {
    if (!this.m_canBeAttacked) return;
    this.m_hp -= damage;
    console.log(`Player HP: ${this.m_hp}`);

    // 플레이어가 다친 소리를 재생합니다.
    this.scene.m_hurtSound.play();
    // 피격 이펙트를 표시합니다.
    this.displayHit();
    // 피격 쿨타임을 시작합니다.
    this.getCoolDown();
    // HP bar를 갱신합니다.
    this.m_hbBar.decrease(damage);
  }

  displayHit() {
    this.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.clearTint();
      },
      loop: false,
    });
  }

  getCoolDown() {
    this.m_canBeAttacked = false;
    this.alpha = 0.5;
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.alpha = 1;
        this.m_canBeAttacked = true;
      },
      loop: false,
    });
  }
}
