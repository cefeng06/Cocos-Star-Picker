import { reaction } from 'mobx';
import { store } from './Store';
import { manager } from './Manager'
const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  // Star预制资源
  @property(cc.Prefab)
  starPrefab: cc.Prefab = null;

  // Player节点
  @property(cc.Node)
  player: cc.Node = null;

  // button节点
  @property(cc.Node)
  btnNode: cc.Node = null;

  // 计分器
  @property(cc.Label)
  scoreLabel: cc.Label = null;

  // GameOver提示
  @property(cc.Label)
  gameOverLabel: cc.Label = null;

  // 方向提示
  @property(cc.Node)
  indicator: cc.Node = null;

  // 得分音效
  @property(cc.AudioClip)
  scoreAudio: cc.AudioClip = null;

  // 状态参数
  readonly NONE: number = 0;    // 游戏未开始
  readonly PLAYING: number = 1; // 游戏进行中
  readonly OVER: number = 2;     // 游戏结束

  groundY: number = 0;
  currentStar: cc.Node = null;
  leftIndicator: cc.Node = null;
  rightIndicator: cc.Node = null;
  mainCamera: cc.Node = null;

  onLoad () {
    // 初始化组件
    this.leftIndicator = this.indicator.getChildByName('Left');
    this.rightIndicator = this.indicator.getChildByName('Right');
    this.mainCamera = cc.find('Canvas/Camera/MainCamera');
    this.groundY = cc.find('Canvas/Ground').y + cc.find('Canvas/Ground').height / 2;
    reaction(() => store.score, () => { this.scoreLabel.string = 'Score: ' + store.score });
    this.renderState(this.NONE);
  }

  /**
   * 根据state属性确定节点的激活状态和Game组件的enabled属性
   * @param currentState 当前状态
   */
  renderState (currentState: number) {
    switch (currentState) {
      case this.NONE:
        // Button状态
        this.btnNode.getChildByName('btnLabel').getComponent(cc.Label).string = 'PLAY';
        this.btnNode.on(cc.Node.EventType.TOUCH_END, () => this.startGame())
        this.btnNode.active = true;
        // Label状态
        this.scoreLabel.enabled = false;
        this.gameOverLabel.enabled = false;
        this.leftIndicator.getComponent(cc.Label).enabled = false;
        this.rightIndicator.getComponent(cc.Label).enabled = false;
        // Player状态
        this.player.active = true;
        // Game组件状态
        this.enabled = false;
        break
      case this.PLAYING:
        // 初始化事件监听
        this.player.getComponent('Player').initEventListener();
        // Button状态
        this.btnNode.active = false;
        // Label状态
        this.scoreLabel.enabled = true;
        this.gameOverLabel.enabled = false;
        // Player状态
        this.player.active = true;
        // Game组件状态
        this.enabled = true;
        break
      case this.OVER:
        // Button状态
        this.btnNode.getChildByName('btnLabel').getComponent(cc.Label).string = 'REPLAY';
        this.btnNode.on(cc.Node.EventType.TOUCH_END, () => this.restartGame());
        this.btnNode.active = true;
        // Label状态
        this.scoreLabel.enabled = false;
        this.gameOverLabel.string = this.gameOverLabel.string + store.score;
        this.gameOverLabel.enabled = true;
        this.leftIndicator.getComponent(cc.Label).enabled = false;
        this.rightIndicator.getComponent(cc.Label).enabled = false;
        // Player状态
        this.player.active = false;
        this.player.stopAllActions();
        // Star销毁
        this.currentStar.destroy();
        // Game组件状态
        this.enabled = false;
        break
    }
  }

  /**
   * 点击PLAY后触发的回调
   */
  startGame () {
    this.renderState(this.PLAYING);
    this.currentStar = manager.spawnNewStar(this);
    store.resetScore();
    this.handleIndicatorVisible(this.currentStar.position, this.player.position);
  }

  update (dt: number) {
    this.handleIndicatorVisible(this.currentStar.position, this.player.position);
    manager.checkGameOver(this, this.currentStar);
    this.currentStar.getComponent('Star').timer += dt;
  }

  /**
   * 游戏失败后重置状态
   */
  gameOver () {
    this.renderState(this.OVER);
  }

  /**
   * 点击Replay后重置游戏，并进入PLAYING状态
   */
  restartGame () {
    store.resetScore();
    this.gameOverLabel.string = this.gameOverLabel.string.split(':')[0] + ': ';
    this.leftIndicator.getComponent(cc.Label).enabled = false;
    this.rightIndicator.getComponent(cc.Label).enabled = false;
    this.player.getComponent('Player').startMoveAt(cc.v2(0, this.groundY));
    this.mainCamera.x = 0;
    this.renderState(this.PLAYING);
  }

  /**
   * 处理左右标示箭头的显示隐藏
   * @param starPos 当前star的坐标
   * @param playerPos 当前player的坐标
   */
  handleIndicatorVisible (starPos: cc.Vec2 | cc.Vec3, playerPos: cc.Vec2 | cc.Vec3) {
    if (starPos.x - playerPos.x > cc.winSize.width / 2) {
      this.rightIndicator.x = cc.winSize.width / 2;
      this.rightIndicator.getComponent(cc.Label).enabled = true;
    } else if (playerPos.x - starPos.x > cc.winSize.width / 2) {
      this.leftIndicator.x = - cc.winSize.width / 2;
      this.leftIndicator.getComponent(cc.Label).enabled = true;
    } else {
      this.leftIndicator.getComponent(cc.Label).enabled = false;
      this.rightIndicator.getComponent(cc.Label).enabled = false;
    }
  }
}
