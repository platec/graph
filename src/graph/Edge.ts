import Data from './Data';

export default class Edge extends Data {
  readonly className = 'Edge';
  private styleMap = {};
  private source?: Data;
  private target?: Data;

  constructor() {
    super();
  }

  setStyle(style: any) {
    this.styleMap = Object.assign(this.styleMap, style || {});
    this.changeData();
  }

  s(style: any) {
    this.setStyle(style);
  }

  setSource(data: Data) {
    this.source = data;
    this.changeData();
  }

  setTarget(data: Data) {
    this.target = data;
    this.changeData();
  }

  getSource() {
    return this.source;
  }

  getTarget() {
    return this.target;
  }
}
