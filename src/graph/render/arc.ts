import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderArc(ctx: CanvasRenderingContext2D, node: Node): void;
export default function renderArc(ctx: CanvasRenderingContext2D, comp: Comp): void;


export default function renderArc(
  ctx: CanvasRenderingContext2D,
  data: any,
) {
  ctx.save();
  let x, y, width, height, arcFrom, arcTo, arcClose;
  const node = <Node>data;
  if (node.className) {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
    arcFrom = node.getStyle('shape.arc.from');
    arcTo = node.getStyle('shape.arc.to');
    arcClose = node.getStyle('shape.arc.close');
  } else {
    const comp = <Comp>data;
    [x, y, width, height] = comp.rect!;
    ({ arcFrom, arcTo, arcClose } = comp);
  }
  const radius = Math.min(width, height) / 2;
  setShapeStyle(ctx, data);
  ctx.beginPath();
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.arc(cx, cy, radius, arcFrom, arcTo);
  // 默认是闭合状态
  if (arcClose === undefined || arcClose === true) {
    // 交于圆心
    ctx.lineTo(cx, cy);
    ctx.closePath();
  }
  strokeAndFill(ctx, data);
  ctx.restore();
}
