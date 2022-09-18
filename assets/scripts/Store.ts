import { makeObservable, action, observable } from 'mobx';

class Store {
  // 计分器
  score: number = 0;

  constructor() {
    makeObservable(this, {
      score: observable,
      addScore: action,
      resetScore: action
    });
  }

  addScore () {
    this.score++;
  }

  resetScore () {
    this.score = 0;
  }
}

export const store = new Store();