import Phaser from "phaser";

export default class Mob extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, animKey, initHp, dropRate) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play(animKey);
    this.setDepth(20);
    this.scale = 2;

    this.m_speed = 50;
    this.m_hp = initHp;
    this.m_dropRate = dropRate;
    this.m_canBeAttacked = true;
    this.m_damage = 5;

    if (texture === "mob1") {
      this.setBodySize(24, 14, false);
      this.setOffset(0, 14);
      this.m_damage = 5;
    }
    if (texture === "mob2") {
      this.setBodySize(24, 32);
      this.m_damage = 10;
    }
    if (texture === "mob3") {
      this.setBodySize(24, 32);
      this.m_damage = 15;
    }
    if (texture === "mob4") {
      this.setBodySize(24, 32);
      this.m_damage = 20;
    }
    if (texture === "lion") {
      this.setBodySize(24, 64);
      this.m_damage = 25;
    }

    this.m_events = [];
    this.m_events.push(
      this.scene.time.addEvent({
        delay: 100,
        callback: () => {
          scene.physics.moveToObject(this, scene.m_player, this.m_speed);
        },
        loop: true,
      })
    );

    scene.events.on("update", (time, delta) => {
      this.update(time, delta);
    });
  }

  update(time, delta) {
    if (!this.body) return;

    if (this.x < this.scene.m_player.x) {
      this.flipX = true;
    } else {
      this.flipX = false;
    }

    if (this.m_hp <= 0) {      
      this.scene.time.removeEvent(this.m_events[0]);
      this.destroy();
    }
  }

  /** 다이나믹타입의 공격 피격 처리 */
  hitByDynamic(weaponDynamic, damage) {
    // 충돌 시 사운드 재생
    this.scene.m_hitMobSound.play();
    // 데미지 적용
    this.m_hp -= damage;
    // 히트 이펙트 투명도를 조절하여 데미지를 받음을 나타냄
    this.displayHit();    
    // 투사체 제거
    weaponDynamic.destroy();
  }

  /** 스태틱타입의 공격 피격 처리 */
  hitByStatic(damage) {
    // 피격 쿨타임 상태인지 확인 이미 쿨타임 상태라면 무시
    if (!this.m_canBeAttacked) return;

    // 충돌 시 사운드 재생
    this.scene.m_hitMobSound.play();
    // 데미지 적용
    this.m_hp -= damage;
    // 히트 이펙트 투명도를 조절하여 데미지를 받음을 나타냄
    this.displayHit();
    this.getCoolDown();
  }

  /** 피격 이펙트 표시 */
  displayHit() {
    this.alpha = 0.5;
    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.alpha = 1;
      },
      loop: false,
    });
  }

  /** 1초간 피격 쿨타임 설정 */
  getCoolDown() {
    this.m_canBeAttacked = false;
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.m_canBeAttacked = true;
      },
      loop: false,
    });
  }
}
