import Data from './Data';

export default class Node extends Data {
  readonly className = 'Node';
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _image = '';
  private _imageLoaded = false;

  constructor() {
    super();
  }

  public get x() {
    return this._x;
  }

  public set x(x) {
    this._x = x;
    this.changeData();
  }

  public get y() {
    return this._y;
  }

  public set y(y) {
    this._y = y;
    this.changeData();
  }

  public get width() {
    return this._width;
  }

  public set width(width) {
    this._width = width;
    this.changeData();
  }

  public get height() {
    return this._height;
  }

  public set height(height) {
    this._height = height;
    this.changeData();
  }

  public get image() {
    return this._image;
  }

  public set image(image) {
    this._image = image;
    this.changeData();
  }

  public get imageLoaded() {
    return this._imageLoaded;
  }

  public set imageLoaded(loaded) {
    this._imageLoaded = loaded;
  }

  public getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
