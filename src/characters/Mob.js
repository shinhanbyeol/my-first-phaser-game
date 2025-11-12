import Phaser from "phaser";
import Explosion from "../effects/Explosion";
import ExpUp from "../items/ExpUp";
import { winGame } from "../utils/seceneManager";
import { removeAttack } from "../utils/attackManager";

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
    this.m_isBoss = false;

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
      this.m_speed = 60;
      this.m_damage = 25;
      this.m_isDead = false;
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

    if (
      (this.m_hp <= 0 && !this.m_isDead) ||
      (isNaN(this.m_hp) && !this.m_isDead)
    ) {
      this.die();
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
    if (this.texture.key === "lion") return;
    this.alpha = 0.5;
    this.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.alpha = 1;
        this.clearTint();
      },
      loop: false,
    });
  }

  /** 1초간 피격 쿨타임 설정 */
  getCoolDown() {
    this.m_canBeAttacked = false;
    this.scene.time.addEvent({
      delay: 800,
      callback: () => {
        this.m_canBeAttacked = true;
      },
      loop: false,
    });
  }

  /** 몹 사망 처리 */
  die() {
    this.m_isDead = true;

    new Explosion(this.scene, [this.x, this.y]);
    this.scene.m_explosionSound.play();

    if (Math.random() < this.m_dropRate) {
      const expUp = new ExpUp(this.scene, this);
      this.scene.m_expUps.add(expUp);
    }
    this.scene.m_topBar.gameMobsKilled();
    this.scene.time.removeEvent(this.m_events);

    if (this.texture.key === "lion") {
      // 공격을 제거합니다. (attackManager.js 참고)
      removeAttack(this.scene, "catnip");
      removeAttack(this.scene, "beam");
      removeAttack(this.scene, "claw");
      // 플레이어가 보스몹과 접촉해도 HP가 깎이지 않도록 만듭니다.
      this.disableBody(true, false);
      // 보스몹이 움직이던 애니메이션을 멉춥니다.
      this.play("lion_idle");
      // 모든 몹의 움직임을 멈춥니다.
      this.scene.m_mobs.children.each((mob) => {
        mob.m_speed = 0;
      });

      // 보스몹이 서서히 투멍해지도록 합니다.
      this.scene.time.addEvent({
        delay: 30,
        callback: () => {
          this.alpha -= 0.01;
        },
        repeat: 100,
      });
      // 보스몹이 투명해진 후, GameClearScene으로 화면을 전환합니다.
      this.scene.time.addEvent({
        delay: 4000,
        callback: () => {
          winGame(this.scene);
        },
        loop: false,
      });
    }
    // 보스몹이 아닌 몹이 죽었을 때
    else {
      // 몹이 사라집니다.
      this.destroy();
    }
  }
}
