import Node from '../Node';
import Text from '../Text'
import Edge from '../Edge';
import Shape from '../Shape';


export class DefaultValue {
  static borderColor = '#979797';
  static backgroundColor = 'transparent';
  static borderWidth = 1;
  static font = '12px arial, sans-serif';
  static align = 'left';
  static vAlign = 'middle';
  static borderJoin: CanvasLineJoin = 'round';
  static borderCap: CanvasLineCap = 'butt';
  static fillRule = 'evenodd';
  static fontColor = 'black';
  static text = 'text';
  static symbolWidth = 100;
  static symbolHeight = 100;
  static anchorX = 0.5;
  static anchorY = 0.5
}

export function setShapeStyle(ctx: CanvasRenderingContext2D, node: Node|Shape): void;

export function setShapeStyle(ctx: CanvasRenderingContext2D, comp: Comp): void;


/**
 * Shape基本样式设置
 * @param ctx
 * @param node
 * @param comp
 */
export function setShapeStyle(ctx: CanvasRenderingContext2D, data: any) {
  const node = <Node>data;
  if (node.className) {
    ctx.fillStyle =
      node.getStyle('shape.background') || DefaultValue.backgroundColor;
    ctx.strokeStyle =
      node.getStyle('shape.border.color') || DefaultValue.borderColor;
    const borderWidth = node.getStyle('shape.border.width');
    if (borderWidth === undefined || borderWidth < 0) {
      ctx.lineWidth = 0;
    } else {
      ctx.lineWidth = borderWidth;
    }
    ctx.lineJoin = node.getStyle('shape.border.join') || DefaultValue.borderJoin;
    ctx.lineCap = node.getStyle('shape.border.cap') || DefaultValue.borderCap;
  } else {
    const comp = <Comp>data;
    ctx.fillStyle = comp.background || DefaultValue.backgroundColor;
    ctx.strokeStyle = comp.borderColor || DefaultValue.borderColor;
    if (comp.borderWidth === undefined || comp.borderWidth < 0) {
      ctx.lineWidth = 0;
    } else {
      ctx.lineWidth = comp.borderWidth;
    }
    ctx.lineJoin = comp.borderJoin || DefaultValue.borderJoin;
    ctx.lineCap = comp.borderCap || DefaultValue.borderCap;
  }
}

const classMap: any = {
  Node,
  Text,
  Edge,
  Shape
}

/**
 * 获取图形类
 * @param className 
 * @returns 
 */
export function getClass(className: string): any {
  return classMap[className];
}

/**
 * 将点组合成矩形
 * @param p1
 * @param p2
 */
 export function unionPoint(p1: Point, p2: Point) {
  if (p1 && p2) {
    return {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
      width: Math.abs(p1.x - p2.x),
      height: Math.abs(p1.y - p2.y),
    };
  }
}

// 图片、图标缓存
const imageCache = new Map<string, any>();

/**
 * 缓存图片、图标
 * @param name 
 * @param image 
 */
export function setImage(name: string, image: any) {
  imageCache.set(name, image);
}

/**
 * 获取图片、图标缓存
 * @param name 
 * @returns 
 */
export function getImage(name: string) {
  return imageCache.get(name);
}

/**
 * 属性名转换为对应的方法名
 * @param name 
 */
export function propNameToMethod(name: string) {
  return 'set' + name.charAt(0).toUpperCase() + name.slice(1);
}

export function getEventPosition(element: HTMLElement, e: MouseEvent) {
  let x, y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= element.offsetLeft;
  y -= element.offsetTop;
  return {
    x,
    y,
  };
}

export function containsPoint(bounds: BoundingRect, x: number, y: number) {
  return !(
    x < bounds.x ||
    x > bounds.x + bounds.width ||
    y < bounds.y ||
    y > bounds.y + bounds.height
  );
}


export default {
  getImage,
  setImage
}
