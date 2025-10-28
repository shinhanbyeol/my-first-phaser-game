import Config from "../Config.js";

export function getRandomPosition(playerX, playerY) {
  const randRad = Math.random() * Math.PI * 2;
  const _r =
    Math.sqrt(Config.width * Config.width + Config.height * Config.height) / 2;

  const x = playerX + _r * Math.cos(randRad);
  const y = playerY + _r * Math.sin(randRad);

  return [x, y];
}
