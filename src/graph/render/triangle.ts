import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderTriangle(ctx: CanvasRenderingContext2D, node: Node): void;

export default function renderTriangle(ctx: CanvasRenderingContext2D, comp: Comp): void;

export default function renderTriangle(
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
  setShapeStyle(ctx, node);
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
