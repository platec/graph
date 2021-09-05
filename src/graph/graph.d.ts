interface ImageCompConfig {
  name: string;
  displayName: string;
}

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// 组件内图形
interface Comp {
  type: string;
  borderWidth: number; // 边框宽度
  borderColor: string; // 边框宽度
  borderCap?: CanvasLineCap; // 线帽样式
  borderJoin?: CanvasLineJoin; // 交汇样式
  closePath?: boolean; // 是否闭合
  points?: number[]; // shape的组成点
  segments?: number[];
  fillRule?: CanvasFillRule;
  rect?: number[]; // x y w h
  background?: string; // 背景颜色
  cornerRadius?: number; // 圆角矩形边框半径
  text?: string;
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
  vAlign?: CanvasTextBaseline;
  arcFrom?: number;
  arcTo?: number;
  arcClose?: boolean;
  name?: string;
  anchorX?: number;
  anchorY?: number;
  rotation?: number;
}

// 图标类型
interface DisplayImage {
  width: number;
  height: number;
  comps?: Comp[];
}

// 图元矩形范围
type BoundingRect = Point & Size;

// Data样式配置
interface DisplayDataStyle {
  shape?: string;
  'shape.background'?: string;
  'shape.border.width'?: number;
  'shape.border.color'?: string;
  'shape.arc.from'?: number;
  'shape.arc.to'?: number;
  'shape.arc.close'?: number;
  'shape.arc.oval'?: boolean;
  'shape.corner.radius'?: number;
  'shape.fill.rule'?: CanvasFillRule;
  'shape.border.cap'?: CanvasLineCap;
  'shape.border.join'?: CanvasLineJoin;
  'edge.type'?: 'points';
  'edge.points'?: {
    __a: Point[];
  };
  'edge.segments'?: {
    __a: number[];
  };
  'edge.color'?: string;
  'edge.width'?: number;
  'edge.source.anchor.x'?: number;
  'edge.source.anchor.y'?: number;
  'edge.target.anchor.x'?: number;
  'edge.target.anchor.y'?: number;
  'edge.cap'?: CanvasLineCap;
  'edge.join'?: CanvasLineJoin;
  'select.color'?: string;
  'select.width'?: number;
  'select.padding'?: number;
  'select.type'?: 'rect' | 'shadow';
  label?: string;
  'label.font'?: string;
  'label.color'?: string;
  'label.background'?: string;
  'label.position'?: string;
  'label.position.fixed'?: boolean;
  'label.offset.x'?: number;
  'label.offset.y'?: number;
  'label.rotation'?: number;
  'label.scale'?: number;
  'label.selectable'?: boolean;
}

interface DisplayProperty {
  background?: string;
}

interface DisplayAttribute {
  onPreDeserialize?: string;
  onPostDeserialize?: string;
}

interface DisplayDataProperty {
  position: Point;
  displayName?: string;
  image?: string;
  width?: number;
  height?: number;
}

interface DisplayData {
  c: string;
  i: number;
  p: DisplayDataProperty;
  s: DisplayDataStyle;
  a: any;
}

interface Display {
  p: DisplayProperty;
  a: DisplayAttribute;
  d: DisplayData[];
}

type Bounds = Point & Size;
