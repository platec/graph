import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderCircle(
  ctx: CanvasRenderingContext2D,
  node: Node,
  comp?: Comp
) {
  ctx.save();
  let x, y, width, height;
  if (comp) {
    [x, y, width, height] = comp.rect!;
  } else {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
  }
  setShapeStyle(ctx, node, comp);
  const radius = Math.min(width, height) / 2;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  strokeAndFill(ctx, node, comp);
  ctx.restore();
}
