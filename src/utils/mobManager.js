import Mob from "../characters/Mob";
import { getRandomPosition } from "./math";

/**
 *
 * @param {*} scene // PlayingScene
 * @param {*} spawnInterval  // 몹이 스폰되는 간격 (밀리초)
 * @param {*} mobTexture  // 몹의 텍스쳐 키
 * @param {*} mobAnimKey  // 몹의 애니메이션 키
 * @param {*} mobHealth  // 몹의 체력
 * @param {*} dropRate  // 몹의 아이템 드랍 확률
 */
export function addMobEvents(
  scene,
  spawnInterval,
  mobTexture,
  mobAnimKey,
  mobHealth,
  dropRate
) {
  let timer = scene.time.addEvent({
    delay: spawnInterval,
    callback: () => {
      let [x, y] = getRandomPosition(scene.m_player.x, scene.m_player.y);
      scene.m_mobs.add(
        new Mob(scene, x, y, mobTexture, mobAnimKey, mobHealth, dropRate)
      );
    },
    loop: true,
  });

  scene.m_mobEvents.push(timer);
}


export function removeOldestMobEvent(scene) {
    scene.m_mobEvents[0].remove();
    scene.m_mobEvents.shift();
}