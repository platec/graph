import Data from '../Data';
import Node from '../Node';
import Shape from '../Shape';
import Text from '../Text';
import { DefaultValue, getImage } from '../util';

export function strokeAndFill(ctx: CanvasRenderingContext2D, node: Node): void;
export function strokeAndFill(ctx: CanvasRenderingContext2D, comp: Comp): void;

export function strokeAndFill(ctx: CanvasRenderingContext2D, data: any) {
  const node = <Node>data;
  if (node.className) {
    const node = <Node>data;
    const width = node.getStyle('shape.border.width');
    if (width !== undefined) {
      ctx.stroke();
    }
  } else {
    const comp = <Comp>data;
    if (comp.borderWidth !== undefined) {
      ctx.stroke();
    }
  }
  ctx.fill();
}

/**
 * 旋转图形
 * @param ctx
 * @param data
 */
export function rotateData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text | Shape
) {
  const rotation = data.getRotation();
  if (rotation) {
    const { x: centerX, y: centerY } = data.getPostion();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);
  }
}

/**
 * 缩放图形
 * @param ctx
 * @param data
 */
export function scaleData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text | Shape
) {
  const { x, y } = data.getScale();
  if (x !== 1 || y !== 1) {
    const { x: rx, y: ry, width, height } = data.getRect();
    let tx = rx,
      ty = ry;
    if (x < 0) {
      tx = rx + width / (1 - x);
    }
    if (y < 0) {
      ty = ry + height / (1 - y);
    }
    ctx.translate(tx, ty);
    ctx.scale(x, y);
    ctx.translate(-tx, -ty);
  }
}

/**
 * 位置、缩放、角度处理
 * @param ctx
 * @param data
 */
export function beforeRenderNodeData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text
) {
  rotateData(ctx, data);
  scaleData(ctx, data);
  const { x, y, width, height } = data.getRect();
  ctx.translate(x, y);
  if (data.className === 'Node') {
    const image = data.getImage();
    if (image && image.endsWith('.json')) {
      const imageCache = getImage(image);
      const scaleX = width / imageCache.width;
      const scaleY = height / imageCache.height;
      ctx.scale(scaleX, scaleY);
    }
  }
}

export function beforeRenderComp(ctx: CanvasRenderingContext2D, cp: Comp) {
  const anchorX = cp.anchorX || DefaultValue.anchorX;
  const anchorY = cp.anchorY || DefaultValue.anchorY;
  // 图标内元素的旋转
  if (cp.rotation) {
    const [x, y, width, height] = cp.rect!;
    const cx = x + width * anchorX;
    const cy = y + height * anchorY;
    ctx.translate(cx, cy);
    ctx.rotate(cp.rotation);
    ctx.translate(-cx, -cy);
  }
  // 图标内元素缩放
  const scaleX = cp.scaleX || DefaultValue.scaleX;
  const scaleY = cp.scaleY || DefaultValue.scaleY;
  if (scaleX !== 1 || scaleY !== 1) {
    const [x, y, width, height] = cp.rect!;
    const cx = x + width * anchorX;
    const cy = y + height * anchorY;
    let tx = cx,
      ty = cy;
    if (scaleX < 0) {
      tx = x + width / (1 - scaleX);
    }
    if (scaleY < 0) {
      ty = y + height / (1 - scaleY);
    }
    ctx.translate(tx, ty);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-tx, -ty);
  }
}

export function drawSlection(ctx: CanvasRenderingContext2D, data: Data) {
  const node = <Node>data;
  const { x, y, width, height } = node.getRect();
  ctx.save();
  rotateData(ctx, node);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#60ACFC';
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
