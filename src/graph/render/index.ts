import Data from '../Data';
import Node from '../Node';
import Text from '../Text';
import Edge from '../Edge';
import Shape from '../Shape';
import renderText from './text';
import renderEdge from './edge';
import renderShape from './shape';
import { DefaultValue, getImage } from '../util';
import { renderNode } from './node';

export function strokeAndFill(
  ctx: CanvasRenderingContext2D,
  data: Node,
  comp?: any
) {
  if (comp) {
    if (comp.borderWidth !== undefined) {
      ctx.stroke();
    }
  } else {
    const node = <Node>data;
    const width = node.getStyle('shape.border.width');
    if (width !== undefined) {
      ctx.stroke();
    }
  }
  ctx.fill();
}

/**
 * 位置、缩放、角度处理
 * @param ctx
 * @param data
 */
export function beforeRenderNodeData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text
) {
  const { x, y, width, height } = data.getRect();
  ctx.translate(x, y);
  if (data.className === 'Node') {
    const image = data.getImage();
    if (image && image.endsWith('.json')) {
      const imageCache = getImage(image);
      const scaleX = width / imageCache.width;
      const scaleY = height / imageCache.height;
      ctx.scale(scaleX, scaleY);
    }
  }
}

export function drawSlection(ctx: CanvasRenderingContext2D, data: Data) {
  // @ts-ignore
  const { x, y, width, height } = data.getRect();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#60ACFC';
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

export function renderData(ctx: CanvasRenderingContext2D, data: Data) {
  const className = data.className;
  ctx.save();
  switch (className) {
    case 'Node':
      renderNode(ctx, <Node>data);
      break;
    case 'Edge':
      renderEdge(ctx, <Edge>data);
      break;
    case 'Text':
      renderText(ctx, <Text>data);
      break;
    case 'Shape':
      renderShape(ctx, <Shape>data);
      break;
  }
  ctx.restore();
}
