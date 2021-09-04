import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderRect(ctx: CanvasRenderingContext2D, node: Node): void;

export default function renderRect(ctx: CanvasRenderingContext2D, comp: Comp): void;


/**
 * 渲染矩形
 * @param ctx
 * @param data
 * @param comp
 */
export default function renderRect(
  ctx: CanvasRenderingContext2D,
  data: any,
) {
  ctx.save();
  let x, y, width, height;
  const node = <Node>data;
  if (node.className) {
    x = 0, y = 0;
    ({ width, height } = node.getSize());
  } else {
    const comp = <Comp>data;
    [x, y, width, height] = comp.rect!;
  }
  setShapeStyle(ctx, data);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();  
  strokeAndFill(ctx, data);
  ctx.restore();
}
