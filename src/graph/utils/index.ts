import Data from '../Data';
import DataModel from '../DataModel';
import GraphView from '../GraphView';
import Constants from '../Constants';
import Node from '../Node';
import Edge from '../Edge';
import graph from '../Global';

function setStyle(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  if (comp.background !== undefined) {
    ctx.fillStyle = comp.background;
  } else {
    ctx.fillStyle = Constants.defaultBackgroundColor;
  }
  if (comp.borderColor !== undefined) {
    ctx.strokeStyle = comp.borderColor;
  } else {
    ctx.strokeStyle = Constants.defaultBorderColor;
  }
  if (comp.borderWidth !== undefined) {
    ctx.lineWidth = comp.borderWidth;
  }
  if (comp.borderJoin !== undefined) {
    ctx.lineJoin = comp.borderJoin;
  } else {
    ctx.lineJoin = Constants.defaultBorderJoin;
  }
}

function strokeAndFill(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  if (comp.borderWidth !== undefined) {
    ctx.stroke();
  }
  ctx.fill();
}

/**
 * 画矩形
 * @param ctx
 * @param data
 * @param comp
 */
function drawRect(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  ctx.save();
  const [x, y, width, height] = comp.rect;
  setStyle(ctx, data, comp);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();
  strokeAndFill(ctx, data, comp);
  ctx.restore();
}

/**
 * 画圆
 * @param ctx
 * @param data
 * @param comp
 */
function drawCircle(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  ctx.save();
  const [x, y, width, height] = comp.rect;
  setStyle(ctx, data, comp);
  const radius = Math.floor(Math.min(width, height) / 2);
  ctx.beginPath();
  ctx.arc(
    Math.floor(x + width / 2),
    Math.floor(y + height / 2),
    radius,
    0,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  strokeAndFill(ctx, data, comp);
  ctx.restore();
}

/**
 * 画椭圆
 * @param ctx
 * @param data
 * @param comp
 */
function drawOval(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  ctx.save();
  const [x, y, width, height] = comp.rect;
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
  setStyle(ctx, data, comp);
  strokeAndFill(ctx, data, comp);
  ctx.restore();
}

export const getTextSize = (function () {
  const heightCache: any = {};
  const context = document.createElement('canvas').getContext('2d');
  return function (font: string, text: string) {
    context!.font = font;
    let height = heightCache[context!.font];
    if (!height) {
      height = 2 * context!.measureText('e').width + 4;
      heightCache[context!.font] = height;
    }
    return {
      width: context!.measureText(text).width + 4,
      height,
    };
  };
})();

/**
 * 绘制文字
 * @param ctx
 * @param data
 * @param comp
 */
function drawText(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  ctx.save();
  // TODO
  const [x, y, width, height] = comp.rect;
  const { text, font } = comp;
  ctx.font = font || Constants.defaultFont;
  const size = getTextSize(ctx.font, text);
  ctx.textAlign = comp.align || Constants.defaultAlign;
  ctx.textBaseline = comp.vAlign || Constants.defaultVAlign;
  let textX, textY;
  if (width === undefined) {
    textX = x;
    textY = y;
  } else {
    textX = x + width / 2;
    textY = y + height / 2;
    // textX = x;
    // textY = y;
  }
  ctx.fillText(text, textX, textY);
  ctx.restore();
}

/**
 * 画连线
 * @param ctx
 * @param data
 */
export function drawEdge(ctx: CanvasRenderingContext2D, data: Data) {
  const edge = <Edge>data;
  const start = <Node>edge.getSource();
  const end = <Node>edge.getTarget();
  if (start && end) {
    ctx.save();
    ctx.strokeStyle = 'grey';
    const startPoint = [start.x, start.y];
    const endPoint = [end.x, end.y];
    ctx.moveTo(startPoint[0], startPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * 画图片
 * @param ctx
 * @param data
 * @param comp
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  data: Data,
  comp: any
) {
  ctx.save();
  const [x, y, width, height] = comp.rect;
  const { name, displayName } = comp;
  let cacheName;
  if (name.startsWith('data:image')) {
    cacheName = displayName;
  } else {
    cacheName = name;
  }
  const imageCache = graph.getImage(cacheName);
  if (imageCache) {
    ctx.drawImage(imageCache, x, y, width, height);
  }
  ctx.restore();
}

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

/**
 * 绘制不规则图形
 * @param ctx
 * @param data
 * @param comp
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  data: Data,
  comp: any
) {
  const { points, segments, closePath } = comp;
  ctx.save();
  setStyle(ctx, data, comp);
  let beginPath = false;
  ctx.beginPath();
  const pointList = convertListToPointList(points);
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
        ctx.quadraticCurveTo(
          cpoint.x,
          cpoint.y,
          point.x,
          point.y
        );
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
  ctx.stroke();
  ctx.restore();
}

/**
 * Node绘制前预处理
 * @param ctx
 * @param data
 * @param image
 */
function beforeRenderNode(
  ctx: CanvasRenderingContext2D,
  data: Data,
  image?: any
) {
  const node = <Node>data;
  const nodeWidth = node.width || image.width;
  const nodeHeight = node.height || image.height;
  ctx.translate(node.x - nodeWidth / 2, node.y - nodeHeight / 2);
  if (image) {
    // 图标原始大小
    const { width, height } = image;
    const scaleX = nodeWidth / width;
    const scaleY = nodeHeight / height;
    ctx.scale(scaleX, scaleY);
  }
}

/**
 * 绘制图标
 * @param gv
 * @param dm
 * @param data
 * @param image
 * @returns
 */
export function drawNodeImage(
  gv: GraphView,
  dm: DataModel,
  data: Data,
  image: any
) {
  const node = <Node>data;
  if (!node.width || !node.height) {
    return;
  }
  const context = gv.context;
  // 图标内容
  const comps = <any[]>image.comps;
  if (comps) {
    context.save();
    beforeRenderNode(context, data, image);
    for (let comp of comps) {
      if (comp.type === 'rect') {
        drawRect(context, data, comp);
      } else if (comp.type === 'circle') {
        drawCircle(context, data, comp);
      } else if (comp.type === 'oval') {
        drawOval(context, data, comp);
      } else if (comp.type === 'text') {
        drawText(context, data, comp);
      } else if (comp.type === 'image') {
        drawImage(context, data, comp);
      } else if (comp.type === 'shape') {
        drawShape(context, data, comp);
      }
    }
  }
  context.restore();
}

export function drawSlection(gv: GraphView, node: Node) {
  if (!node.width || !node.height) {
    return;
  }
  const context = gv.context;
  context.save();
  context.beginPath();
  context.rect(
    node.x - node.width / 2,
    node.y - node.height / 2,
    node.width,
    node.height
  );
  context.scale(0.5, 0.5);
  context.strokeStyle = '#60ACFC';
  context.stroke();
  context.closePath();
  context.restore();
}

export function getEventPosition(element: HTMLElement, e: MouseEvent) {
  let x, y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= element.offsetLeft;
  y -= element.offsetTop;
  return {
    x,
    y,
  };
}

export function containsPoint(bounds: Bounds, x: number, y: number) {
  return !(
    x < bounds.x ||
    x > bounds.x + bounds.width ||
    y < bounds.y ||
    y > bounds.y + bounds.height
  );
}

/**
 * 根据配置生成Node对象
 * @param d
 */
export function generateNode(d: any) {
  const property = d.p;
  const { position, width, height, image } = property;
  const node = new Node();
  node.x = position.x;
  node.y = position.y;
  node.width = width;
  node.height = height;
  if (image) {
    node.image = image;
  }
  return node;
}

export function extend(destination: any, source: any, deep?: boolean) {
  if (deep) {
    if (source instanceof Element) {
      destination = source;
    } else if (source instanceof Array) {
      destination = [];
      for (var i = 0, len = source.length; i < len; i++) {
        destination[i] = extend({}, source[i], deep);
      }
    } else if (source && typeof source === 'object') {
      for (var property in source) {
        if (property === 'canvas' || property === 'group') {
          // we do not want to clone this props at all.
          // we want to keep the keys in the copy
          destination[property] = null;
        } else if (source.hasOwnProperty(property)) {
          destination[property] = extend({}, source[property], deep);
        }
      }
    } else {
      // this sounds odd for an extend but is ok for recursive use
      destination = source;
    }
  } else {
    for (var property in source) {
      destination[property] = source[property];
    }
  }
  return destination;
}

export const uuid = (() => {
  let id = 0;
  return () => ++id;
})();
