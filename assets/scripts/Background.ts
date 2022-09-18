const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  // 背景循环素材
  @property(cc.Node)
  bg1: cc.Node = null;

  @property(cc.Node)
  bg2: cc.Node = null;

  @property(cc.Node)
  bg3: cc.Node = null;

  // 地面循环素材
  @property(cc.Node)
  ground1: cc.Node = null;

  @property(cc.Node)
  ground2: cc.Node = null;

  @property(cc.Node)
  ground3: cc.Node = null;

  // 摄像机
  @property(cc.Node)
  mainCarema: cc.Node = null;

  // 初始化变量
  bgList: cc.Node[] = null;
  groundList: cc.Node[] = null;
  player: cc.Node = null;

  onLoad () {
    this.player = cc.find('Canvas/Player')
    this.bgList = [this.bg1, this.bg2, this.bg3];
    this.groundList = [this.ground1, this.ground2, this.ground3];
    this.setBgPosition(this.bgList);
    this.setBgPosition(this.groundList);
  }

  /**
   * 设置连续背景图坐标
   * @param bgList 
   */
  setBgPosition (bgList: cc.Node[]) {
    bgList[0].x = bgList[1].x - bgList[0].width;
    bgList[2].x = bgList[1].x + bgList[2].width;
  }

  /**
   * 检查是否需要更新背景图坐标
   * @param bgList 
   */
  checkBgReset (bgList: cc.Node[]) {
    if ((this.mainCarema.x - cc.winSize.width / 2) < (bgList[0].x - bgList[0].width / 2)) {
      const temp = bgList.pop();
      bgList.unshift(temp);
      this.setBgPosition(bgList);
    } else if ((this.mainCarema.x + cc.winSize.width / 2) > (bgList[2].x + bgList[2].width / 2)) {
      const temp = bgList.shift();
      bgList.push(temp);
      this.setBgPosition(bgList);
    }
  }

  /**
   * 每一帧检查是否需要移动背景素材
   */
  update () {
    this.mainCarema.x = this.player.x;
    this.checkBgReset(this.bgList);
    this.checkBgReset(this.groundList);
  }
}
