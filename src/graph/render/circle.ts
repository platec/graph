import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderCircle(ctx: CanvasRenderingContext2D, node: Node): void;
export default function renderCircle(ctx: CanvasRenderingContext2D, comp: Comp): void;

export default function renderCircle(
  ctx: CanvasRenderingContext2D,
  data: any,
) {
  ctx.save();
  let x, y, width, height;
  const node = <Node>data;
  if (node.className) {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
  } else {
    const comp = <Comp>data;
    [x, y, width, height] = comp.rect!;
  }
  setShapeStyle(ctx, data);
  const radius = Math.min(width, height) / 2;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  strokeAndFill(ctx, data);
  ctx.restore();
}
