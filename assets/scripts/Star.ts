const { ccclass, property } = cc._decorator;

@ccclass
export default class Star extends cc.Component {
  // 引用Star预制资源
  @property(cc.Prefab)
  starPrefab: cc.Prefab = null;

  // Star产生后消失时间的随机范围
  @property
  maxStarDuration: number = 5;
  @property
  minStarDuration: number = 3;

  // Star存在时长
  @property({
    visible: false
  })
  starDuration: number = 0;

  // 计时器
  @property({
    visible: false
  })
  timer: number = 0;

  // 粒子爆炸的定时器
  particleExplosionTimer: number;

  /**
   * 播放粒子爆炸效果
   */
  playParticleExplosion () {
    this.node.getChildByName('starVanish').getComponent(cc.ParticleSystem).resetSystem();
  }

  /**
   * 销毁当前Star
   */
  destroyStar () {
    const particleSys = this.node.getChildByName('starVanish').getComponent(cc.ParticleSystem);
    particleSys.resetSystem();
    const dura = particleSys.duration;
    this.particleExplosionTimer = setTimeout(() => {
      this.node.destroy();
    }, dura * 1000);
  }

  /**
   * 更新Star的计时器和进度条
   */
  update () {
    const opacityRatio = 1 - this.timer / this.starDuration;
    const minOpacity = 50;
    this.node.getChildByName('starSprite').opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    const progressBar = this.node.getChildByName('progressBar').getComponent(cc.ProgressBar);
    progressBar.progress = 1 - this.timer / this.starDuration;
  }

  /**
   * 清除定时器
   */
  onDestroy () {
    clearTimeout(this.particleExplosionTimer);
  }
}
