import game from "../index.js";
import Config from "../Config.js";

//  pause 된 씬을 저장할 변수
let scene_paused = null;

// pause된 시각 또는 pause 해제된 시각을 저장할 변수
let time_paused = Date.now() - 100;

// pause 가 발생하는 유형 정의
let type_pause;

const PAUSE_TEXT_BY_TYPE = {
  pause: {
    text: "Pause",
    fontSize: 64,
  },
  levelup: {
    text: ["Level Up!", "", "Press Enter to continue"],
    fontSize: 48,
  },
};

export function pause(scene, type = "pause") {
  // scene 이 pause 가 해제된지 100ms가 지났고 scene이 active 상태일 때만 pause 실행
  if (Date.now() - time_paused > 100 && game.scene.isActive(scene)) {
    game.scene.pause(scene);

    scene_paused = scene;
    time_paused = Date.now();
    type_pause = type;

    createVeil(scene);
    createPauseText(scene, type_pause);

    if (type_pause === "pause") {
      game.scene.getScene(scene).m_pauseInSound.play();
    } else if (type_pause === "levelup") {
      game.scene.getScene(scene).m_nextLevelSound.play();
    }
  }
}

/**
 * @description scene에 반투명 검은 veil 화면을 만들어주는 함수입니다.
 * 화면이 pause되어도 반투명한 화면을 통해 게임의 상황을 확인할 수 있도록 만들어줍니다.
 * @param {*} scene
 */
function createVeil(scene) {
  scene.m_veil = scene.add
    .graphics({ x: 0, y: 0 })
    .fillStyle(0x000000, 0.3)
    .fillRect(0, 0, Config.width, Config.height)
    .setDepth(110)
    .setScrollFactor(0);
}

/**
 * @description pause시 화면에 나타낼 텍스트를 만들어주는 함수입니다.
 * @param {*} scene
 * @param {*} type
 */
function createPauseText(scene, type) {
  scene.m_textPause = scene.add
    .text(Config.width / 2, Config.height / 2, PAUSE_TEXT_BY_TYPE[type].text, {
      fontSize: PAUSE_TEXT_BY_TYPE[type].fontSize,
    })
    .setOrigin(0.5)
    .setDepth(120)
    .setScrollFactor(0);
}

function togglePauseScreen(scene, isVisible) {  
  scene.m_veil.setVisible(isVisible);
  scene.m_textPause.setVisible(isVisible);
}

document.addEventListener("keydown", (e) => {
  if (
    (e.key === "Escape" && type_pause === "pause" && scene_paused) ||
    (e.code === "Enter" &&
      type_pause === "levelup" &&
      Date.now() - time_paused > 100 &&
      scene_paused)
  ) {
    // 게임재개
    const previouseScene = game.scene.getScene(scene_paused);
    game.scene.resume(scene_paused);

    // veil 및 pause text 제거
    togglePauseScreen(previouseScene, false);

    previouseScene.m_pauseOutSound.play();

    // 레벨업인 경우 pause 해제후 PlaingScene의 afterLevelUp 메서드 실행
    if (type_pause === "levelup") {
      previouseScene.afterLevelUp();
    }

    // pause 관련 변수 초기화
    scene_paused = null;
    time_paused = Date.now();
  }
});
