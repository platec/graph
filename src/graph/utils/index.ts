import Data from '../Data';
import DataModel from '../DataModel';
import GraphView from '../GraphView';
import Constants from '../Constants';
import Node from '../Node';
import Edge from '../Edge';
import Text from '../Text';
import Shape from '../Shape';
import graph from '../Global';

/**
 * 图标内图形样式设置
 * @param ctx
 * @param data
 * @param comp
 */
function setStyle(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  if (comp) {
    ctx.fillStyle = comp.background || Constants.defaultBackgroundColor;
    ctx.strokeStyle = comp.borderColor || Constants.defaultBorderColor;
    if (comp.borderWidth !== undefined) {
      ctx.lineWidth = comp.borderWidth;
    }
    ctx.lineJoin = comp.borderJoin || Constants.defaultBorderJoin;
    ctx.lineCap = comp.borderCap || Constants.defaultBorderCap;
  } else {
    const node = <Node>data;
    ctx.fillStyle =
      node.getStyle('shape.background') || Constants.defaultBackgroundColor;
    ctx.strokeStyle =
      node.getStyle('shape.border.color') || Constants.defaultBorderColor;
    const width = node.getStyle('shape.border.width');
    if (width !== undefined) {
      ctx.lineWidth = width;
    }
    ctx.lineJoin =
      node.getStyle('shape.border.join') || Constants.defaultBorderJoin;
    ctx.lineCap =
      node.getStyle('shape.border.cap') || Constants.defaultBorderCap;
  }
}

function strokeAndFill(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
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
 * 绘制矩形
 * @param ctx
 * @param data
 * @param comp
 */
function drawRect(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  ctx.save();
  let x, y, width, height;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect;
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
  }
  setStyle(ctx, data, comp);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();
  strokeAndFill(ctx, data, comp);
  ctx.restore();
}

/**
 * 绘制圆
 * @param ctx
 * @param data
 * @param comp
 */
function drawCircle(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  ctx.save();
  let x, y, width, height;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect;
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
  }
  setStyle(ctx, data, comp);
  const radius = Math.min(width, height) / 2;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  strokeAndFill(ctx, data, comp);
  ctx.restore();
}

/**
 * 绘制椭圆
 * @param ctx
 * @param data
 * @param comp
 */
function drawOval(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  ctx.save();
  let x, y, width, height;
  if (comp) {
    [x, y, width, height] = comp.rect;
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
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
function drawText(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  ctx.save();
  let x, y, width, height, text, font, color, align, vAlign;
  if (comp) {
    [x, y, width, height] = comp.rect;
    ({ text, font, color, align, vAlign } = comp);
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
    text = node.getStyle('text');
    font = node.getStyle('text.font');
    color = node.getStyle('text.color');
    align = node.getStyle('text.align');
    vAlign = node.getStyle('text.vAlign');
  }
  ctx.font = font || Constants.defaultFont;
  const size = getTextSize(ctx.font, text);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || Constants.defaultFontColor;
  vAlign = vAlign || Constants.defaultVAlign;
  align = align || Constants.defaultAlign;
  color = color || Constants.defaultFontColor;
  text = text || Constants.defaultText;
  let textX = 0,
    textY = 0;
  if (vAlign === 'top') {
    textY = y + size.height / 2;
  } else if (vAlign === 'middle') {
    textY = y + height / 2;
  } else {
    textY = y + height - size.height / 2;
  }
  if (align === 'right') {
    textX = x + width - size.width / 2;
  } else if (align === 'left') {
    textX = x + size.width / 2;
  } else {
    textX = x + width / 2;
  }
  ctx.fillText(text, textX, textY);
  ctx.restore();
}

/**
 * 绘制连线
 * @param ctx
 * @param data
 */
export function drawEdge(ctx: CanvasRenderingContext2D, data: Data) {
  const edge = <Edge>data;
  const start = <Node>edge.getSource();
  const end = <Node>edge.getTarget();
  if (start && end) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle =
      edge.getStyle('edge.color') || Constants.defaultBorderColor;
    const width = edge.getStyle('edge.width') || Constants.defaultBorderWidth;
    const cap = edge.getStyle('edge.cap');
    const join = edge.getStyle('edge.join');
    ctx.lineJoin = join || Constants.defaultBorderJoin;
    ctx.lineWidth = width <= 0 ? 1 : width;
    const startPoint = {
      x: start.x,
      y: start.y,
    };
    const endPoint = {
      x: end.x,
      y: end.y,
    };
    const segments = <number[]>edge.getStyle('edge.segments');
    if (segments) {
      const points = [...(<Point[]>edge.getStyle('edge.points'))];
      points.unshift(startPoint);
      points.push(endPoint);
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
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
    }
    //TODO
    // ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * 绘制图片
 * @param ctx
 * @param data
 * @param comp
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  data: Data,
  comp?: any
) {
  ctx.save();
  let x, y, width, height, name, displayName;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect;
    ({ name, displayName } = comp);
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height, image: name, displayName } = node);
  }
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
  comp?: any
) {
  ctx.save();
  // 图标内不规则图形
  let segments, closePath, pointList: Point[];
  if (comp) {
    ({ segments, closePath } = comp);
    pointList = convertListToPointList(comp.points);
  } else {
    const shape = <Shape>data;
    pointList = shape.points;
    segments = shape.segments;
    closePath = shape.closePath;
  }
  setStyle(ctx, data, comp);
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
  const shape = <Shape>data;
  const borderWidth =
    (comp ? comp.borderWidth : shape.getStyle('shape.border.width')) || 0;
  if (borderWidth !== 0) {
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }
  const background = comp
    ? comp.background
    : shape.getStyle('shape.background');
  const fillRule =
    (comp ? comp.fillRule : shape.getStyle('shape.fill.rule')) ||
    Constants.defaultFillRule;
  // 填充颜色
  if (background) {
    ctx.fill(fillRule);
  }
  ctx.restore();
}

/**
 * 绘制三角形
 * @param ctx
 * @param data
 * @param comp
 */
function drawTriangle(ctx: CanvasRenderingContext2D, data: Data, comp?: any) {
  ctx.save();
  let x, y, width, height;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect;
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
  }
  setStyle(ctx, data, comp);
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width / 2, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

/**
 * 绘制圆弧
 * @param ctx
 * @param data
 * @param comp
 */
function drawArc(ctx: CanvasRenderingContext2D, data: Data, comp: any) {
  ctx.save();
  let x, y, width, height, arcFrom, arcTo, arcClose;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect;
    ({ arcFrom, arcTo, arcClose } = comp);
  } else {
    // 绘制Node
    const node = <Node>data;
    x = 0;
    y = 0;
    ({ width, height } = node);
    arcFrom = node.getStyle('shape.arc.from');
    arcTo = node.getStyle('shape.arc.to');
    arcClose = node.getStyle('shape.arc.close');
  }
  const radius = Math.min(width, height) / 2;
  setStyle(ctx, data, comp);
  ctx.beginPath();
  const cx = x + width / 2;
  const cy = y + height / 2
  ctx.arc(cx, cy, radius, arcFrom, arcTo);
  // 默认是闭合状态
  if (arcClose === undefined || arcClose === true) {
    // 交于圆心
    ctx.lineTo(cx, cy);
    ctx.closePath();
  }
  strokeAndFill(ctx, data, comp);
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
  if (image) {
    const nodeWidth = node.width || image.width;
    const nodeHeight = node.height || image.height;
    ctx.translate(node.x - nodeWidth / 2, node.y - nodeHeight / 2);
    const scaleX = nodeWidth / image.width;
    const scaleY = nodeHeight / image.height;
    ctx.scale(scaleX, scaleY);
  } else {
    ctx.translate(node.x - node.width / 2, node.y - node.height / 2);
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
  image?: any
) {
  const node = <Node>data;
  if (!node.width || !node.height) {
    return;
  }
  const context = gv.context;
  context.save();
  // 带图的Node
  if (image) {
    // 图标内容
    const comps = <any[]>image.comps;
    if (comps) {
      beforeRenderNode(context, data, image);
      for (let comp of comps) {
        drawBasicShape(context, data, comp.type, comp);
      }
    }
  } else {
    // 几何形状
    const shapeType = node.getStyle('shape');
    beforeRenderNode(context, data);
    if (shapeType) {
      drawBasicShape(context, data, shapeType);
    } else {
      drawImage(context, data);
    }
  }
  context.restore();
}

/**
 * 绘制图纸上的文字
 * @param context
 * @param data
 */
export function drawDisplayText(context: CanvasRenderingContext2D, data: Data) {
  context.save();
  beforeRenderNode(context, data);
  drawText(context, data);
  context.restore();
}

function drawBasicShape(
  context: CanvasRenderingContext2D,
  data: Data,
  type: string,
  comp?: any
) {
  switch (type) {
    case 'rect':
      drawRect(context, data, comp);
      break;
    case 'circle':
      drawCircle(context, data, comp);
      break;
    case 'oval':
      drawOval(context, data, comp);
      break;
    case 'text':
      drawText(context, data, comp);
      break;
    case 'image':
      drawImage(context, data, comp);
      break;
    case 'shape':
      drawShape(context, data, comp);
      break;
    case 'triangle':
      drawTriangle(context, data, comp);
      break;
    case 'arc':
      drawArc(context, data, comp);
      break;
  }
}

export function drawSlection(gv: GraphView, data: Data) {
  // @ts-ignore
  if (!data.width || !data.height) {
    return;
  }
  // @ts-ignore
  const { x, y, width, height } = data;
  const context = gv.context;
  context.save();
  context.beginPath();
  context.rect(x - width / 2, y - height / 2, width, height);
  context.lineWidth = 1;
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
  const { position, width, height, image, displayName } = property;
  const node = new Node();
  node.id = d.i;
  node.x = position.x;
  node.y = position.y;
  node.width = width;
  node.height = height;
  node.displayName = displayName;
  if (image) {
    node.image = image;
  } else {
    const style = d.s;
    node.setStyle(style);
  }
  return node;
}

/**
 * 根据配置生成Text对象
 * @param d
 */
export function generateText(d: any) {
  const property = d.p;
  const { position, width, height } = property;
  const text = new Text();
  text.id = d.i;
  text.x = position.x;
  text.y = position.y;
  text.width = width;
  text.height = height;
  const style = d.s;
  text.setStyle(style);
  return text;
}

/**
 * 根据配置生成Shape对象
 * @param d
 */
export function generateShape(d: any) {
  const property = d.p;
  const { position, width, height, segments, points, closePath } = property;
  const shape = new Shape();
  shape.id = d.i;
  shape.segments = segments.__a;
  shape.points = points.__a;
  shape.closePath = closePath;
  shape.x = position.x;
  shape.y = position.y;
  shape.width = width;
  shape.height = height;
  const style = d.s;
  shape.setStyle(style);
  return shape;
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
