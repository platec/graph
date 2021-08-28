interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  height: number
}

type Bounds = Point & Size;