import Data from './Data';
import { DefaultValue, getImage } from './util';

export default class Node extends Data {
  readonly className = 'Node';
  private _x = 0;
  private _y = 0;
  private _width?: number;
  private _height?: number;
  private _image?: string;
  private _displayName = '';
  private _styleMap = new Map();
  private _anchorX = 0.5;
  private _anchorY = 0.5;
  private _rotation?: number;
  private _scaleX = 1;
  private _scaleY = 1;

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

  getImage() {
    return this._image;
  }

  setImage(image: string) {
    this._image = image;
    this.update();
  }

  getDisplayName() {
    return this._displayName;
  }

  setDisplayName(displayName: string) {
    this._displayName = displayName;
    this.update();
  }

  getSize() {
    if (this._width === undefined || this._height === undefined) {
      const imageCache = <DisplayImage>getImage(this.getImage()!);
      return {
        width: imageCache.width,
        height: imageCache.height,
      };
    }
    return {
      width: this._width,
      height: this._height,
    };
  }

  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getRect() {
    const { x, y } = this.getPostion();
    const { width, height } = this.getSize();
    let { x: anchorX, y: anchorY } = this.getAnchor();
    anchorX = anchorX === undefined ? DefaultValue.anchorX : anchorX;
    anchorY = anchorY === undefined ? DefaultValue.anchorY : anchorY;
    const { x: scaleX, y: scaleY } = this.getScale();
    return {
      x: x - width * Math.abs(scaleX) * anchorX,
      y: y - height * Math.abs(scaleY) * anchorY,
      width: width * Math.abs(scaleX),
      height: height * Math.abs(scaleY),
    };
  }

  setRect(x: number, y: number, width: number, height: number) {
    // TODO
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this.update();
  }

  setStyle(style: any, value?: any) {
    if (value !== undefined && typeof style === 'string') {
      this._styleMap.set(style, value);
    } else if (typeof style === 'object' && Object.keys(style).length > 0) {
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
      y: this._anchorY,
    };
  }

  setAnchor(anchor: Point) {
    this._anchorX = anchor.x;
    this._anchorY = anchor.y;
    this.update();
  }

  getRotation() {
    return this._rotation;
  }

  setRotation(rotation: number) {
    this._rotation = rotation;
    this.update();
  }

  setScale(scale: Point) {
    this._scaleX = scale.x;
    this._scaleY = scale.y;
    this.update();
  }

  getScale() {
    return {
      x: this._scaleX,
      y: this._scaleY,
    };
  }

  setScaleX(x: number) {
    this._scaleX = x;
    this.update();
  }

  setScaleY(y: number) {
    this._scaleY = y;
    this.update();
  }

  getScaleX() {
    return this._scaleX;
  }

  getScaleY() {
    return this._scaleY;
  }
}
