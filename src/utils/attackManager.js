import Beam from "../effects/Beam.js";
import Catnip from "../effects/Catnip.js";
import Claw from "../effects/Claw.js";

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
    case "Claw":
      const timer = scene.time.addEvent({
        delay: cooldown,
        callback: () => {
          doAttackOneSet(scene, attackType, damage, scale);
        },
        loop: true,
      });
      scene.m_attackEvents[attackType] = {
        timer,
        m_damage: damage,
        scale,
        cooldown,
      };
      break;
    case "Catnip":
      const catnip = new Catnip(
        scene,
        [scene.m_player.x, scene.m_player.y + 20],
        damage,
        scale
      );
      scene.m_attackEvents[attackType] = catnip;
      break;
    default:
      break;
  }
}

function doAttackOneSet(scene, attackType, damage, scale) {
  switch (attackType) {
    case "Beam":
      shootBeam(scene, damage, scale);
      break;
    case "Claw":
      const isHeadingRight = scene.m_player.flipX;
      clawAttack(scene, isHeadingRight, damage, scale);
      break;
  }
}

function shootBeam(scene, damage, scale) {
  // 빔 발사
  new Beam(scene, [scene.m_player.x, scene.m_player.y - 16], damage, scale);
}

function clawAttack(scene, isHeadingRight, damage, scale) {
  // 앞쪽 공격
  new Claw(
    scene,
    [scene.m_player.x - 60 + 120 * isHeadingRight, scene.m_player.y - 40],
    isHeadingRight,
    damage,
    scale
  );
  // 뒤쪽 공격, 앞쪽 공격, 뒤쪽 공격 사이의 시간 간격은 0.5s로 설정했습니다.
  scene.time.addEvent({
    delay: 300,
    callback: () => {
      new Claw(
        scene,
        [scene.m_player.x - 60 + 120 * !isHeadingRight, scene.m_player.y - 40],
        !isHeadingRight,
        damage,
        scale
      );
    },
    loop: false,
  });
}

/**
 * @description scene에 있는 attackType의 공격을 제거해주는 함수입니다.
 */
export function removeAttack(scene, attackType) {
  if (!scene.m_attackEvents[attackType]) return;

  // catnip의 경우 object를 제거합니다.
  if (attackType === "Catnip") {
    scene.m_attackEvents[attackType].destroy();
    return;
  }
  // 다른 공격(beam, claw)의 경우 설정했던 timer를 비활성화합니다.
  scene.time.removeEvent(scene.m_attackEvents[attackType].timer);
}

/**
 * @description scene에 있는 attackType 공격의 damage를 재설정해주는 함수입니다.
 */
export function setAttackDamage(scene, attackType, newDamage) {
  const scale = scene.m_attackEvents[attackType].scale;
  const cooldown = scene.m_attackEvents[attackType].cooldown;
  removeAttack(scene, attackType);
  addAttackEvents(scene, attackType, newDamage, scale, cooldown);
}

/**
 * @description scene에 있는 attackType 공격의 scale을 재설정해주는 함수입니다.
 */
export function setAttackScale(scene, attackType, newScale) {
  const damage = scene.m_attackEvents[attackType].m_damage;
  const cooldown =
    attackType === "Catnip" ? null : scene.m_attackEvents[attackType].cooldown;
  removeAttack(scene, attackType);
  addAttackEvents(scene, attackType, damage, newScale, cooldown);
}

/**
 * @description scene에 있는 attackType 공격의 repeatGap을 재설정해주는 함수입니다.
 */
export function setAttackRepeatGap(scene, attackType, cooldown) {
  // Catnip의 경우 repeatGap이 없으므로 예외처리해 줍니다.
  if (attackType === "Catnip") {
    console.error("Cannot set Catnip's repeat gap");
    return;
  }

  const damage = scene.m_attackEvents[attackType].damage;
  const scale = scene.m_attackEvents[attackType].scale;
  removeAttack(scene, attackType);
  addAttackEvents(scene, attackType, damage, scale, cooldown);
}
