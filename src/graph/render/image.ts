import Node from '../Node';
import { getImage } from '../util';

export default function renderImage(
  ctx: CanvasRenderingContext2D,
  node: Node,
  comp?: Comp
) {
  ctx.save();
  let x, y, width, height, name;
  // 绘制图标
  if (comp) {
    [x, y, width, height] = comp.rect!;
    ({ name } = comp);
  } else {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
    name = node.getImage();
  }
  if (name) {
    const imageCache = getImage(name);
    if (imageCache) {
      ctx.drawImage(imageCache, x, y, width, height);
    }
  }
  ctx.restore();
}
