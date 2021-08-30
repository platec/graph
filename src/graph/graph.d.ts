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
  rect?: number[]; // x y w h
  background?: string; // 背景颜色
  cornerRadius?: number; // 圆角矩形边框半径
}

// 图标类型
type Symbol = Comp & Size;

type Bounds = Point & Size;
