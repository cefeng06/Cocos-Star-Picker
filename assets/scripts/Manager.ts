import Game from './Game';
import { store } from './Store';

class Manager {
  /**
   * 生成newStar
   * @param game 当前Game实例
   * @returns 
   */
  spawnNewStar (game: Game) {
    let newStar = cc.instantiate(game.starPrefab);
    game.node.addChild(newStar);
    const star = newStar.getComponent('Star');
    star.starDuration = star.minStarDuration + Math.random() * (star.maxStarDuration - star.minStarDuration);
    star.timer = 0;
    newStar = manager.setNewStarPosition(game, newStar);
    return newStar
  }

  /**
   * 为newStar生成随机位置
   * @param game 当前Game实例
   * @param newStar 新生成的star节点
   * @returns
   */
  setNewStarPosition (game: Game, newStar: cc.Node) {
    const randY = game.groundY + Math.random() * game.player.getComponent('Player').jumpHeight + 50;
    const accel = game.player.getComponent('Player').accel;
    const maxSpeed = game.player.getComponent('Player').maxMoveSpeed;
    const starDura = newStar.getComponent('Star').starDuration;
    const displacement = (starDura * maxSpeed - Math.pow(maxSpeed, 2) / 2 / accel);
    const maxX = 0.8 * displacement;
    const minX = 0.2 * displacement;
    const plusOrMinus = Math.random() > 0.5 ? 1 : -1;
    const randX = game.player.x + plusOrMinus * Math.random() * (maxX - minX) + plusOrMinus * minX;
    newStar.setPosition(cc.v2(randX, randY));
    return newStar
  }

  /**
   * Star消除处理逻辑
   * @param game 当前Game实例
   */
  handleOnPicked (game: Game) {
    game.currentStar.getComponent('Star').destroyStar();
    store.addScore();
    cc.audioEngine.playEffect(game.scoreAudio, false);
    game.currentStar = manager.spawnNewStar(game);
  }

  /**
   * 失败验证逻辑
   * @param game 当前Game实例
   * @param currentStar 当前star节点
   * @returns 
   */
  checkGameOver (game: Game, currentStar: cc.Node) {
    const starComp = currentStar.getComponent('Star');
    if (starComp.timer > starComp.starDuration) {
      game.gameOver();
      return
    }
  }
}

export const manager = new Manager();