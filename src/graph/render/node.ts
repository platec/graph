import { beforeRenderNodeData } from '.';
import Data from '../Data';
import Node from '../Node';
import Text from '../Text';
import Shape from '../Shape';
import { getImage } from '../util';
import renderArc from './arc';
import renderCircle from './circle';
import renderImage from './image';
import renderOval from './oval';
import renderRect from './rect';
import renderShape from './shape';
import renderText from './text';
import renderTriangle from './triangle';

function renderBasicShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  node: Data,
  comp?: Comp
) {
  switch (shape) {
    case 'rect':
      renderRect(ctx, <Node>node, comp);
      break;
    case 'circle':
      renderCircle(ctx, <Node>node, comp);
      break;
    case 'oval':
      renderOval(ctx, <Node>node, comp);
      break;
    case 'triangle':
      renderTriangle(ctx, <Node>node, comp);
      break;
    case 'arc':
      renderArc(ctx, <Node>node, comp);
      break;
    case 'text':
      renderText(ctx, <Text>node, comp);
      break;
    case 'image':
      renderImage(ctx, <Node>node, comp);
      break;
    case 'shape':
      renderShape(ctx, <Shape>node, comp);
      break;
  }
}

function renderSymbolImage(
  ctx: CanvasRenderingContext2D,
  node: Node,
  image: string,
  compInfo?: Comp
) {
  const imageCache = getImage(image);
  const comps: Comp[] = imageCache.comps;
  if (comps) {
    for (const comp of comps) {
      renderBasicShape(ctx, comp.type, node, comp);
    }
  }
}

/**
 * 渲染Node
 * @param node
 */
export function renderNode(ctx: CanvasRenderingContext2D, node: Node) {
  beforeRenderNodeData(ctx, node);
  const image = node.getImage();
  const shape = node.getStyle('shape');
  // 图纸上的基本图形
  if (!image && shape) {
    renderBasicShape(ctx, shape, node);
  } else if (image) {
    if (!image.endsWith('.json')) {
      // 图标或图片
      renderImage(ctx, node);
    } else {
      renderSymbolImage(ctx, node, image);
    }
  }
}
