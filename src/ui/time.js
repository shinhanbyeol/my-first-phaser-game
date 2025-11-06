import Config from "../Config";

export function createTime(scene) {
  scene.m_secondElapsed = 0;

  scene.m_timeText = scene.add
    .text(Config.width / 2, 100, "00:00", {
      fontSize: 20,
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setScrollFactor(0);

  scene.time.addEvent({
    delay: 1000,
    callback: () => {
      scene.m_secondElapsed += 1;
      scene.m_timeText.setText(getTimeString(scene.m_secondElapsed));
    },
    loop: true,
  });
}

export function getTimeString(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    totalSeconds % 60
  ).padStart(2, "0")}`;
}
