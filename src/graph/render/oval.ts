import { strokeAndFill } from '.';
import Node from '../Node';
import { setShapeStyle } from '../util';


export default function renderOval(ctx: CanvasRenderingContext2D, node: Node, comp?: Comp) {
  ctx.save();
  let x, y, width, height;
  if (comp) {
    [x, y, width, height] = comp.rect!;
  } else {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
  }
  const radiusX = width / 2;
  const radiusY = height / 2;
  ctx.beginPath();
  const scaleY = radiusY / radiusX;
  if (radiusX !== radiusY) {
    ctx.scale(1, scaleY);
  }
  ctx.arc(x + radiusX, (y + radiusY) / scaleY, radiusX, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.restore();
  ctx.save();
  setShapeStyle(ctx, node, comp);
  strokeAndFill(ctx, node, comp);
  ctx.restore();
 }