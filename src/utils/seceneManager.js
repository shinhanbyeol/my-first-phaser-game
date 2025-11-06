export function loseGame(scene) {
  // 씬데이터 초기화
  scene.sceneDataReset();
  // 게임 오버 사운드를 재생하고 게임 오버 씬으로 전환합니다.
  scene.m_gameOverSound.play();
  scene.scene.start("gameOverScene", {
    mobsKilled: scene.m_topBar.m_mobsKilled,
    level: scene.m_topBar.m_level,
    secondElapsed: scene.m_secondElapsed,
  });
}
