import { manager } from './Manager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  // Player跳跃高度
  @property
  jumpHeight: number = 0;

  // Player跳跃持续时间
  @property
  jumpDuration: number = 0;

  // 最大移动速度
  @property
  maxMoveSpeed: number = 0;

  // 移动加速度
  @property
  accel: number = 0;

  // 跳跃音效
  @property(cc.AudioClip)
  jumpAudio: cc.AudioClip = null;

  // 加速度方向是否打开
  accLeft: boolean = false;
  accRight: boolean = false;

  // 水平方向速度
  xSpeed: number = 0;

  onLoad () {
    // 初始化player
    const jumpAction = this.runJumpAction();
    cc.tween(this.node).then(jumpAction).start();
    this.accLeft = false;
    this.accRight = false;
    this.xSpeed = 0;
    // 开启碰撞检测
    cc.director.getCollisionManager().enabled = true;
  }

  /**
   * 定义player的跳跃动作
   * @returns 
   */
  runJumpAction () {
    const jumpUp = cc.tween().by(this.jumpDuration, { y: this.jumpHeight }, { easing: 'sineOut' });
    const jumpDown = cc.tween().by(this.jumpDuration, { y: -this.jumpHeight }, { easing: 'sineIn' });
    // 创建一个缓动按jumpUp，jumpDown的顺序执行动作，结束时播放音效
    const tween = cc.tween()
      .sequence(jumpUp, jumpDown)
      .call(() => this.playJumpSound());
    return cc.tween().repeatForever(tween);
  }

  /**
   * 播放跳跃音效
   */
  playJumpSound () {
    cc.audioEngine.playEffect(this.jumpAudio, false);
  }

  /**
   * 初始化事件监听
   */
  initEventListener () {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    const touchReceiver = cc.Canvas.instance.node;
    touchReceiver.on('touchstart', this.onTouchStart, this);
    touchReceiver.on('touchend', this.onTouchEnd, this);
  }

  /**
   * 按下按键回调
   * @param event 
   */
  onKeyDown (event: cc.Event.EventKeyboard) {
    typeof event
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = true;
        break;
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = true;
        break;
    }
  }

  /**
   * 松开按键回调
   * @param event 
   */
  onKeyUp (event: cc.Event.EventKeyboard) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = false;
        break;
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = false;
        break;
    }
  }

  /**
   * 开始触摸
   * @param event 
   */
  onTouchStart (event: cc.Event.EventTouch) {
    const touchPos = event.getLocation();
    if (touchPos.x >= cc.winSize.width / 2) {
      this.accLeft = false;
      this.accRight = true;
    } else {
      this.accLeft = true;
      this.accRight = false;
    }
  }

  /**
   * 结束触摸
   * @param event 
   */
  onTouchEnd () {
    this.accLeft = false;
    this.accRight = false;
  }

  /**
   * 指定位置开始移动
   * @param pos 指定坐标
   */
  startMoveAt (pos: cc.Vec2) {
    this.enabled = true;
    this.xSpeed = 0;
    this.node.x = pos.x;
    this.node.y = pos.y;
    const jumpAction = this.runJumpAction();
    cc.tween(this.node).then(jumpAction).start();
  }

  /**
   * 碰撞开始触发回调
   * @param other 
   * @param self 
   */
  onCollisionEnter () {
    const game = cc.find('Canvas').getComponent('Game')
    manager.handleOnPicked(game);
  }

  /**
   * 根据匀变速直线运动更新Player位置
   * @param dt 
   */
  update (dt: number) {
    if (this.accLeft) {
      this.xSpeed -= this.accel * dt;
    }
    else if (this.accRight) {
      this.xSpeed += this.accel * dt;
    }
    if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
      this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
    }
    this.node.x += this.xSpeed * dt;
  }

  /**
   * 取消事件监听
   */
  onDestroy () {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    const touchReceiver = cc.Canvas.instance.node;
    touchReceiver.off('touchstart', this.onTouchStart, this);
    touchReceiver.off('touchend', this.onTouchEnd, this);
  }
}
