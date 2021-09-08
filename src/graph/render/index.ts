import Data from '../Data';
import Node from '../Node';
import Shape from '../Shape';
import Text from '../Text';
import { getImage } from '../util';

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
    const { x: cx, y: cy } = data.getPostion();
    ctx.translate(cx, cy)
    ctx.scale(x, y);
    ctx.translate(-cx, -cy);
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
  scaleData(ctx, data);
  rotateData(ctx, data);
  const { x, y, width, height } = data.getRect();
  ctx.translate(x, y);
  if (data.className === 'Node') {
    const image = data.getImage();
    if (image && image.endsWith('.json')) {
      const imageCache = getImage(image);
      const scaleX = width / imageCache.width;
      const scaleY = height / imageCache.height;
      // const {x: cx, y: cy} = data.getPostion();
      ctx.scale(scaleX, scaleY);
    }
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
