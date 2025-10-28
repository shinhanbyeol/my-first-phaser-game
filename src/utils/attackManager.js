import Beam from "../effects/Beam.js";

/**
 *
 * @param {*} scene 씬
 * @param {*} attackType 공격형태
 * @param {*} damage 데미지
 * @param {*} scale  발사체 및 히트박스 크기
 * @param {*} cooldown  재사용 대기시간
 */
export function addAttackEvents(scene, attackType, damage, scale, cooldown) {
  switch (attackType) {
    case "Beam":
      const timerBeam = scene.time.addEvent({
        delay: cooldown,
        callback: () => {
          shootBeam(scene, damage, scale);
        },
        loop: true,
      });
      scene.m_attackEvents.beam = timerBeam;
      break;
    default:
      break;
  }
}

function shootBeam(scene, damage, scale) {
  new Beam(scene, [scene.m_player.x, scene.m_player.y - 16], damage, scale);
}
