import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

/**
 * 渲染矩形
 * @param ctx
 * @param data
 * @param comp
 */
export default function renderRect(
  ctx: CanvasRenderingContext2D,
  node: Node,
  comp?: Comp
) {
  ctx.save();
  let x, y, width, height;
  // 图标内的组件
  if (comp) {
    [x, y, width, height] = comp.rect!;
  } else {
    x = 0, y = 0;
    ({ width, height } = node.getSize());
  }
  setShapeStyle(ctx, node, comp);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();  
  strokeAndFill(ctx, node, comp);
  ctx.restore();
}
