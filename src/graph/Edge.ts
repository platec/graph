import Data from './Data';


export function getEdgeStyle(styleMap: any) {
  const style: any = {};
  for (const name in styleMap) {
    const value = styleMap[name];
    switch (name) {
      case 'edge.segments':
      case 'edge.points':
        style[name] = value.__a;
        break;
      default:
        style[name] = value;
        break;
    }
  }
  return style;
}


export default class Edge extends Data {
  readonly className = 'Edge';
  private _styleMap = new Map();
  private _source?: Data;
  private _target?: Data;

  constructor() {
    super();
  }

  setStyle(style: any, value?: any) {
    if (value !== undefined && typeof style === 'string') {
      this._styleMap.set(style, value);
    }
    if (style && Object.keys(style).length > 0) {
      for (const key in style) {
        this._styleMap.set(key, style[key]);
      }
    }
    this.update();
  }

  getStyle(name: string) {
    return this._styleMap.get(name);
  }

  setSource(data: Data) {
    this._source = data;
    this.update();
  }

  setTarget(data: Data) {
    this._target = data;
    this.update();
  }

  getSource() {
    return this._source;
  }

  getTarget() {
    return this._target;
  }
}
