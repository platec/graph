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
  private styleMap = new Map();
  private source?: Data;
  private target?: Data;

  constructor() {
    super();
  }

  setStyle(style: any, value?: any) {
    if (value !== undefined && typeof style === 'string') {
      this.styleMap.set(style, value);
    }
    if (style && Object.keys(style).length > 0) {
      for (const key in style) {
        this.styleMap.set(key, style[key]);
      }
    }
    this.changeData();
  }

  getStyle(name: string) {
    return this.styleMap.get(name);
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
