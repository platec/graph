import Edge from '../Edge';
import Node from '../Node';
import { DefaultValue } from '../util';

function getEdgeEndPoint(edge: Edge, type: string) {
  let anchorX, anchorY, data;
  if (type === 'source') {
    data = <Node>edge.getSource();
  } else {
    data = <Node>edge.getTarget();
  }
  anchorX = edge.getStyle(`edge.${type}.anchor.x`);
  anchorY = edge.getStyle(`edge.${type}.anchor.y`);
  anchorX = anchorX === undefined ? DefaultValue.anchorX : anchorX;
  anchorY = anchorY === undefined ? DefaultValue.anchorY : anchorY;
  const { x, y } = data.getPostion();
  const { width, height } = data.getSize();
  const { x: dataAnchorX, y: dataAnchorY } = data.getAnchor();
  return {
    x: x - width * dataAnchorX + width * anchorX,
    y: y - height * dataAnchorY + height * anchorY,
  };
}

export default function renderEdge(ctx: CanvasRenderingContext2D, edge: Edge) {
  const source = edge.getSource();
  const target = edge.getTarget();
  if (source && target) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = edge.getStyle('edge.color') || DefaultValue.borderColor;
    const width = edge.getStyle('edge.width') || DefaultValue.borderWidth;
    const cap = edge.getStyle('edge.cap');
    const join = edge.getStyle('edge.join');
    ctx.lineJoin = join || DefaultValue.borderJoin;
    ctx.lineWidth = width <= 0 ? 1 : width;
    ctx.lineCap = cap || DefaultValue.borderCap;
    const sourcePoint = getEdgeEndPoint(edge, 'source');
    const targetPoint = getEdgeEndPoint(edge, 'target');
    const segments = <number[]>edge.getStyle('edge.segments');
    if (segments) {
      const points = [...(<Point[]>edge.getStyle('edge.points'))];
      points.unshift(sourcePoint);
      points.push(targetPoint);
      const count = segments.length;
      for (let i = 0, pi = 0; i < count; i++) {
        const segment = segments[i];
        if (segment === 1) {
          const point = points[pi++];
          ctx.moveTo(point.x, point.y);
        } else if (segment === 2) {
          const point = points[pi++];
          ctx.lineTo(point.x, point.y);
        } else if (segment === 3) {
          const cpoint = points[pi++];
          const point = points[pi++];
          ctx.quadraticCurveTo(cpoint.x, cpoint.y, point.x, point.y);
        } else if (segment === 4) {
          const c1point = points[pi++];
          const c2point = points[pi++];
          const point = points[pi++];
          ctx.bezierCurveTo(
            c1point.x,
            c1point.y,
            c2point.x,
            c2point.y,
            point.x,
            point.y
          );
        }
      }
    } else {
      ctx.moveTo(sourcePoint.x, sourcePoint.y);
      ctx.lineTo(targetPoint.x, targetPoint.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}
