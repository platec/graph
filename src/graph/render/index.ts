import Data from '../Data';
import Node from '../Node';
import Shape from '../Shape';
import Text from '../Text';
import Edge from '../Edge';
import { DefaultValue, getImage } from '../util';
import renderRect from './rect';
import renderCircle from './circle';
import renderOval from './oval';
import renderTriangle from './triangle';
import renderArc from './arc';
import renderImage from './image';
import GraphView from '../GraphView';
import renderShape from './shape';
import renderText from './text';
import renderEdge from './edge';

export function strokeAndFill(ctx: CanvasRenderingContext2D, node: Node): void;
export function strokeAndFill(ctx: CanvasRenderingContext2D, comp: Comp): void;

export function strokeAndFill(ctx: CanvasRenderingContext2D, data: any) {
  const node = <Node>data;
  if (node.className) {
    const node = <Node>data;
    const width = node.getStyle('shape.border.width');
    if (width !== undefined) {
      ctx.stroke();
    }
  } else {
    const comp = <Comp>data;
    if (comp.borderWidth !== undefined) {
      ctx.stroke();
    }
  }
  ctx.fill();
}

/**
 * 旋转图形
 * @param ctx
 * @param data
 */
export function rotateData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text | Shape
) {
  const rotation = data.getRotation();
  if (rotation) {
    const { x: centerX, y: centerY } = data.getPostion();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);
  }
}

/**
 * 图形变形
 * @param ctx
 * @param data
 */
export function transformData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text | Shape
) {
  // 缩放
  scaleData(ctx, data);
  // 移动
  let x = 0,
    y = 0;
  if (data.className !== 'Shape') {
    ({ x, y } = data.getRect());
  }
  ctx.translate(x, y);
}

/**
 * 缩放图形
 * @param ctx
 * @param data
 */
export function scaleData(
  ctx: CanvasRenderingContext2D,
  data: Node | Text | Shape
) {
  const { x, y } = data.getScale();
  if (x !== 1 || y !== 1) {
    const { x: rx, y: ry, width, height } = data.getRect();
    let tx = rx,
      ty = ry;
    if (x < 0) {
      tx = rx + width / (1 - x);
    }
    if (y < 0) {
      ty = ry + height / (1 - y);
    }
    ctx.translate(tx, ty);
    ctx.scale(x, y);
    ctx.translate(-tx, -ty);
  }
}

/**
 * 图标内图形旋转
 * @param ctx
 * @param cp
 */
export function rotateComp(ctx: CanvasRenderingContext2D, cp: Comp) {
  const anchorX = cp.anchorX || DefaultValue.anchorX;
  const anchorY = cp.anchorY || DefaultValue.anchorY;
  if (cp.rotation) {
    const [x, y, width, height] = cp.rect!;
    const cx = x + width * anchorX;
    const cy = y + height * anchorY;
    ctx.translate(cx, cy);
    ctx.rotate(cp.rotation);
    ctx.translate(-cx, -cy);
  }
}

/**
 * 图标内图形变形
 * @param ctx
 * @param cp
 */
export function transformComp(ctx: CanvasRenderingContext2D, cp: Comp) {
  scaleComp(ctx, cp);
}

/**
 * 图标内图形缩放
 * @param ctx
 * @param cp
 */
export function scaleComp(ctx: CanvasRenderingContext2D, cp: Comp) {
  const anchorX = cp.anchorX || DefaultValue.anchorX;
  const anchorY = cp.anchorY || DefaultValue.anchorY;
  const scaleX = cp.scaleX || DefaultValue.scaleX;
  const scaleY = cp.scaleY || DefaultValue.scaleY;
  if (scaleX !== 1 || scaleY !== 1) {
    const [x, y, width, height] = cp.rect!;
    const cx = x + width * anchorX;
    const cy = y + height * anchorY;
    let tx = cx,
      ty = cy;
    if (scaleX < 0) {
      tx = x + width / (1 - scaleX);
    }
    if (scaleY < 0) {
      ty = y + height / (1 - scaleY);
    }
    ctx.translate(tx, ty);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-tx, -ty);
  }
}

function renderBasicShape(
  ctx: CanvasRenderingContext2D,
  data: any,
  shape: string
) {
  switch (shape) {
    case 'rect': {
      renderRect(ctx, data);
      break;
    }
    case 'circle': {
      renderCircle(ctx, data);
      break;
    }
    case 'oval': {
      renderOval(ctx, data);
      break;
    }
    case 'triangle': {
      renderTriangle(ctx, data);
      break;
    }
    case 'arc': {
      renderArc(ctx, data);
      break;
    }
    case 'shape': {
      renderShape(ctx, data);
      break;
    }
    case 'text': {
      renderText(ctx, data);
      break;
    }
  }
}

/**
 * 绘制Node基本图形
 * @param ctx
 * @param data
 */
function renderNodeShape(ctx: CanvasRenderingContext2D, data: Node) {
  const nodeShape = data.getStyle('shape');
  renderBasicShape(ctx, data, nodeShape);
}

function renderCompShape(ctx: CanvasRenderingContext2D, data: Comp) {
  const type = data.type;
  renderBasicShape(ctx, data, type);
}

function scaleImage(ctx: CanvasRenderingContext2D, data: any) {
  let width, height, x, y, imageCache;
  if (data.getImage) {
    const image = data.getImage();
    ({ x, y, width, height } = data.getRect());
    imageCache = getImage(image!);
  } else {
    imageCache = getImage(data.name!);
    [x, y, width, height] = data.rect!;
    x = x + width / 2;
    y = y + height / 2;
  }
  ctx.translate(x, y);
  const scaleX = width / imageCache.width;
  const scaleY = height / imageCache.height;
  ctx.scale(scaleX, scaleY);
  ctx.translate(-x, -y);
}

/**
 * 绘制图片或者图标
 * @param ctx
 * @param gv
 * @param data
 */
function renderNodeImage(
  ctx: CanvasRenderingContext2D,
  gv: GraphView,
  data: any
) {
  const image = data.name || data.getImage();
  const imageCache = getImage(image);
  const comps = imageCache.comps;
  ctx.save();
  if (imageCache.comps) {
    rotateComp(ctx, data);
    transformComp(ctx, data);
  } else {
    rotateData(ctx, data);
    transformData(ctx, data);
  }

  if (comps) {
    scaleImage(ctx, data);
  }
  // 加载图标
  if (comps) {
    for (const cp of comps) {
      if (cp.type !== 'image') {
        // 基础图形
        ctx.save();
        rotateComp(ctx, cp);
        transformComp(ctx, cp);
        renderCompShape(ctx, cp);
        ctx.restore();
      } else {
        const name = cp.name!;
        const imageCache = getImage(name);
        if (!imageCache) {
          GraphView.loadImage([name]).then(() => {
            gv.update();
          });
          continue;
        }
        if (!imageCache.comps) {
          ctx.save();
          rotateComp(ctx, cp);
          transformComp(ctx, cp);
          renderImage(ctx, cp);
          ctx.restore();
        } else {
          ctx.save();
          renderNodeImage(ctx, gv, cp);
          ctx.restore();
        }
      }
    }
  } else {
    // 加载图片
    renderImage(ctx, data);
  }
  ctx.restore();
}

export function renderEdgeSourceTarget(
  ctx: CanvasRenderingContext2D,
  gv: GraphView,
  data: Edge
) {
  // 检查连线两端Node的image是否加载完成
  const source = <Node>data.getSource();
  const target = <Node>data.getTarget();
  const imageList: string[] = [];
  if (source.getImage && source.getImage() && !getImage(source.getImage()!)) {
    imageList.push(source.getImage()!);
  }
  if (target.getImage && target.getImage() && !getImage(target.getImage()!)) {
    imageList.push(target.getImage()!);
  }
  if (imageList.length > 0) {
    GraphView.loadImage(imageList).then(() => {
      gv.update();
    });
  } else {
    renderEdge(ctx, data);
  }
}

/**
 * 绘制Node
 * @param ctx
 * @param data
 */
export function renderNode(
  ctx: CanvasRenderingContext2D,
  gv: GraphView,
  data: Node
) {
  const nodeShape = data.getStyle('shape');
  // 展示基础图形的Node
  if (nodeShape) {
    ctx.save();
    rotateData(ctx, data);
    transformData(ctx, data);
    renderNodeShape(ctx, data);
    ctx.restore();
  } else {
    // 展示图片或者图标文件的Node
    const image = data.getImage();
    if (image) {
      const imageCache = getImage(image);
      if (imageCache) {
        renderNodeImage(ctx, gv, data);
      } else {
        GraphView.loadImage([image]).then(() => {
          gv.update();
        });
      }
    }
  }
}

export function drawSlection(ctx: CanvasRenderingContext2D, data: Data) {
  const node = <Node>data;
  const { x, y, width, height } = node.getRect();
  ctx.save();
  rotateData(ctx, node);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#60ACFC';
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
