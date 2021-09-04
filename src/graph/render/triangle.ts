import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderTriangle(
  ctx: CanvasRenderingContext2D,
  node: Node,
  comp?: Comp
) {
  ctx.save();
  let x, y, width, height;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect!;
  } else {
    // 绘制Node
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
  }
  setShapeStyle(ctx, node, comp);
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width / 2, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}
