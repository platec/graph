import Data from './Data';

export default class Shape extends Data {
  readonly className = 'Shape';
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _closePath = false;
  private _styleMap = new Map();
  private _segments: number[] = [];
  private _points: Point[] = [];
  private _anchorX = 0.5;
  private _anchorY = 0.5;    

  constructor() {
    super();
  }

  getPostion() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  setPosition(position: Point) {
    this._x = position.x;
    this._y = position.y;
    this.update();
  }

  getWidth() {
    return this._width;
  }

  setWidth(width: number) {
    this._width = width;
    this.update();
  }

  getHeight() {
    return this._height;
  }

  setHeight(height: number) {
    this._height = height;
    this.update();
  }

  getPoints() {
    return this._points;
  }

  setPoints(points: Point[]) {
    this._points = points;
    this.update();
  }

  getSegments() {
    return this._segments;
  }

  setSegments(segments: number[]) {
    this._segments = segments;
    this.update();
  }

  isClosePath() {
    if (this._closePath === undefined) {
      return true;
    }
    return this._closePath;
  }

  setClosePath(closePath: boolean) {
    this._closePath = closePath;
    this.update();
  }

  getRect() {
    // TODO 根据中心点计算
    return {
      x: this._x - this._width / 2,
      y: this._y - this._height / 2,
      width: this._width,
      height: this._height,      
    }
  }

  setRect(x: number, y: number, width: number, height: number) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this.update();
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

  getAnchor() {
    return {
      x: this._anchorX,
      y: this._anchorY
    };
  }

  setAnchor(anchor: Point) {
    this._anchorX = anchor.x;
    this._anchorY = anchor.y;
    this.update();
  }  
}
