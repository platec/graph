import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';

export default function renderArc(
  ctx: CanvasRenderingContext2D,
  node: Node,
  comp?: Comp
) {
  ctx.save();
  let x, y, width, height, arcFrom, arcTo, arcClose;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect!;
    ({ arcFrom, arcTo, arcClose } = comp);
  } else {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
    arcFrom = node.getStyle('shape.arc.from');
    arcTo = node.getStyle('shape.arc.to');
    arcClose = node.getStyle('shape.arc.close');
  }
  const radius = Math.min(width, height) / 2;
  setShapeStyle(ctx, node, comp);
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
  strokeAndFill(ctx, node, comp);
  ctx.restore();
}
