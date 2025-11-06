import Phaser from "phaser";
import Config from "../Config";
import TopBar from "../ui/TopBar";
import ExpBar from "../ui/ExpBar";
import Player from "../characters/Player";
import Mob from "../characters/Mob";
import { setBackground } from "../utils/backgroundManager";
import { addMobEvents, removeOldestMobEvent } from "../utils/mobManager";
import { addAttackEvents } from "../utils/attackManager";
import { pause } from "../utils/pauseManager";

export default class PlayingScene extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  create() {
    // 사용할 sound들을 추가해놓는 부분입니다.
    // load는 전역적으로 어떤 scene에서든 asset을 사용할 수 있도록 load 해주는 것이고,
    // add는 해당 scene에서 사용할 수 있도록 scene의 멤버 변수로 추가할 때 사용하는 것입니다.
    this.sound.pauseOnBlur = false;
    this.m_beamSound = this.sound.add("audio_beam");
    this.m_scratchSound = this.sound.add("audio_scratch");
    this.m_hitMobSound = this.sound.add("audio_hitMob");
    this.m_growlSound = this.sound.add("audio_growl");
    this.m_explosionSound = this.sound.add("audio_explosion");
    this.m_expUpSound = this.sound.add("audio_expUp");
    this.m_hurtSound = this.sound.add("audio_hurt");
    this.m_nextLevelSound = this.sound.add("audio_nextLevel");
    this.m_gameOverSound = this.sound.add("audio_gameOver");
    this.m_gameClearSound = this.sound.add("audio_gameClear");
    this.m_pauseInSound = this.sound.add("audio_pauseIn");
    this.m_pauseOutSound = this.sound.add("audio_pauseOut");

    // player를 m_player라는 멤버 변수로 추가합니다.
    this.m_player = new Player(this);

    this.cameras.main.startFollow(this.m_player);

    // PlayingScene의 background를 설정합니다.
    setBackground(this, "background1");

    this.m_cursorKeys = this.input.keyboard.createCursorKeys();

    // Mobs
    this.m_mobs = this.physics.add.group();
    this.m_mobEvents = [];
    // init first mob event
    addMobEvents(this, 1000, "mob1", "mob1_anim", 5, 0.9);

    // Attacks
    this.m_weaponDynamic = this.physics.add.group();
    this.m_weaponStatic = this.physics.add.group();
    this.m_attackEvents = {};
    addAttackEvents(this, "Beam", 5, 1, 800);

    // Items
    this.m_expUps = this.physics.add.group();
    this.physics.add.overlap(
      this.m_player,
      this.m_expUps,
      this.pickExpUp,
      null,
      this
    );

    // UI
    this.m_topBar = new TopBar(this);
    this.m_expBar = new ExpBar(this, 50);

    /** 몹과 플레이어 및 공격 충돌 이벤트 구현 */
    // Player와 mob이 부딪혔을 경우 player에 데미지 10을 줍니다.
    // (Player.js에서 hitByMob 함수 확인)
    this.physics.add.overlap(
      this.m_player,
      this.m_mobs,
      (p, m) => this.m_player.hitByMob(m.m_damage),
      null,
      this
    );

    // mob이 dynamic 공격에 부딪혓을 경우 mob에 해당 공격의 데미지만큼 데미지를 줍니다.
    // (Mob.js에서 hitByDynamic 함수 확인)
    this.physics.add.overlap(
      this.m_weaponDynamic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByDynamic(weapon, weapon.m_damage);
      },
      null,
      this
    );

    // mob이 static 공격에 부딪혓을 경우 mob에 해당 공격의 데미지만큼 데미지를 줍니다.
    // (Mob.js에서 hitByStatic 함수 확인)
    this.physics.add.overlap(
      this.m_weaponStatic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByStatic(weapon.m_damage);
      },
      null,
      this
    );

    // Pause key event
    this.input.keyboard.on(
      "keydown-ESC",
      () => {
        pause(this, "pause");
      },
      this
    );
  }

  update() {
    this.movePlayerManager();
    this.m_background.setX(this.m_player.x - Config.width / 2);
    this.m_background.setY(this.m_player.y - Config.height / 2);
    this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
    this.m_background.tilePositionY = this.m_player.y - Config.height / 2;

    const closest = this.physics.closest(
      this.m_player,
      this.m_mobs.getChildren()
    );

    this.m_closest = closest;
  }

  pickExpUp(player, expUp) {
    expUp.disableBody(true, true);
    expUp.destroy();

    this.m_expUpSound.play();
    player.m_exp += expUp.m_exp;

    this.m_expBar.increase(expUp.m_exp);
    if (this.m_expBar.m_currentExp >= this.m_expBar.m_maxExp) {
      pause(this, "levelup");
    }
  }

  afterLevelUp() {
    this.m_topBar.gainLevel();
    this.m_nextLevelSound.play();

    switch (this.m_topBar.m_level) {
      case 2:
        removeOldestMobEvent(this);
        addMobEvents(this, 800, "mob2", "mob2_anim", 15, 0.8);
        setBackground(this, "background2");
        break;
      case 3:
        removeOldestMobEvent(this);
        addMobEvents(this, 600, "mob3", "mob3_anim", 25, 0.7);
        setBackground(this, "background3");
        break;
      case 4:
        removeOldestMobEvent(this);
        addMobEvents(this, 400, "mob4", "mob4_anim", 40, 0.6);
        break;
      case 5:
        removeOldestMobEvent(this);
        addMobEvents(this, -1, "lion", "lion_anim", 60, 0.5);
        break;
      default:
        break;
    }
  }

  movePlayerManager() {
    if (
      this.m_cursorKeys.left.isDown ||
      this.m_cursorKeys.right.isDown ||
      this.m_cursorKeys.up.isDown ||
      this.m_cursorKeys.down.isDown
    ) {
      if (!this.m_player.m_moving) {
        this.m_player.play("player_anim");
      }
      this.m_player.m_moving = true;
    } else {
      if (this.m_player.m_moving) {
        this.m_player.play("player_idle");
      }
      this.m_player.m_moving = false;
    }

    // 이동 벡터
    let vector = [0, 0];
    // 수평 이동
    if (this.m_cursorKeys.left.isDown) {
      vector[0] += -1;
    } else if (this.m_cursorKeys.right.isDown) {
      vector[0] += 1;
    }
    // 수직 이동
    if (this.m_cursorKeys.up.isDown) {
      vector[1] += -1;
    } else if (this.m_cursorKeys.down.isDown) {
      vector[1] += 1;
    }
    this.m_player.move(vector);
  }
}
