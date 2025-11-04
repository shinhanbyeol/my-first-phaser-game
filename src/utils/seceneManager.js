export function loseGame(scene) {
  scene.m_gameOverSound.play();
  scene.scene.start("gameOverScene");
}
