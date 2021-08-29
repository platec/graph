import Data from './Data';

export default class Node extends Data {
  readonly className = 'Node';
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _image = '';
  private _displayName = '';
  private _symbolLoaded = false;
  private _styleMap = new Map();

  constructor() {
    super();
  }

  public get x() {
    return this._x;
  }

  public set x(x) {
    this._x = x;
    this.update();
  }

  public get y() {
    return this._y;
  }

  public set y(y) {
    this._y = y;
    this.update();
  }

  public get width() {
    return this._width;
  }

  public set width(width) {
    this._width = width;
    this.update();
  }

  public get height() {
    return this._height;
  }

  public set height(height) {
    this._height = height;
    this.update();
  }

  public get image() {
    return this._image;
  }

  public set image(image) {
    this.symbolLoaded = false;
    this._image = image;
    this.update();
  }

  public get displayName() {
    return this._displayName;
  }

  public set displayName(displayName) {
    this._displayName = displayName;
  }
  public get symbolLoaded() {
    return this._symbolLoaded;
  }

  public set symbolLoaded(loaded) {
    this._symbolLoaded = loaded;
  }

  public getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
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
}
