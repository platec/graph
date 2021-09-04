import Shape from '../Shape';
import { DefaultValue, setShapeStyle } from '../util';

/**
 * 点数组转化成坐标数组
 * @param list
 */
function convertListToPointList(list: number[]) {
  const pointList = [];
  const count = list.length;
  for (let i = 0; i < count; i += 2) {
    pointList.push({
      x: list[i],
      y: list[i + 1],
    });
  }
  return pointList;
}

export default function renderShape(ctx: CanvasRenderingContext2D, shape: Shape): void;

export default function renderShape(ctx: CanvasRenderingContext2D, comp: Comp): void;

export default function renderShape(
  ctx: CanvasRenderingContext2D,
  data: any
) {
  ctx.save();
  // 图标内不规则图形
  let segments, closePath, pointList: Point[];
  const shape = <Shape>data;
  const comp = <Comp>data;
  if (shape.className) {
    pointList = shape.getPoints();
    segments = shape.getSegments();
    closePath = shape.isClosePath();
  } else {
    ({ segments, closePath } = comp);
    pointList = convertListToPointList(comp.points!);    
  }
  setShapeStyle(ctx, shape);
  ctx.beginPath();
  if (segments && segments.length > 0) {
    const count = segments.length;
    for (let i = 0, pi = 0; i < count; i++) {
      const segment = segments[i];
      if (segment === 1) {
        const point = pointList[pi++];
        ctx.moveTo(point.x, point.y);
      } else if (segment === 2) {
        const point = pointList[pi++];
        ctx.lineTo(point.x, point.y);
      } else if (segment === 3) {
        const cpoint = pointList[pi++];
        const point = pointList[pi++];
        ctx.quadraticCurveTo(cpoint.x, cpoint.y, point.x, point.y);
      } else if (segment === 4) {
        const c1point = pointList[pi++];
        const c2point = pointList[pi++];
        const point = pointList[pi++];
        ctx.bezierCurveTo(
          c1point.x,
          c1point.y,
          c2point.x,
          c2point.y,
          point.x,
          point.y
        );
      } else if (segment === 5) {
        ctx.closePath();
      }
      if (closePath) {
        ctx.closePath();
      }
    }
  } else {
    const count = pointList.length;
    if (count > 0) {
      let start = pointList[0];
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < count; i++) {
        const point = pointList[i];
        ctx.lineTo(point.x, point.y);
      }
      if (closePath) {
        ctx.closePath();
      }
    }
  }
  const borderWidth =
    (!shape.className ? comp.borderWidth : shape.getStyle('shape.border.width')) || 0;
  if (borderWidth !== 0) {
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }
  const background = !shape.className
    ? comp.background
    : shape.getStyle('shape.background');
  const fillRule =
    (comp ? comp.fillRule : shape.getStyle('shape.fill.rule')) ||
    DefaultValue.fillRule;
  // 填充颜色
  if (background) {
    ctx.fill(fillRule);
  }
  ctx.restore();
}
