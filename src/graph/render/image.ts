import Node from '../Node';
import { getImage } from '../util';

export default function renderImage(ctx: CanvasRenderingContext2D, node: Node): void;
export default function renderImage(ctx: CanvasRenderingContext2D, comp: Comp): void;

export default function renderImage(
  ctx: CanvasRenderingContext2D,
  data: any
) {
  ctx.save();
  let x, y, width, height, name;
  const node = <Node>data;
  if (node.className) {
    x = 0;
    y = 0;
    ({ width, height } = node.getSize());
    name = node.getImage();
  } else {
    const comp = <Comp>data;
    [x, y, width, height] = comp.rect!;
    ({ name } = comp);
  }
  if (name) {
    const imageCache = getImage(name);
    if (imageCache) {
      ctx.drawImage(imageCache, x, y, width, height);
    }
  }
  ctx.restore();
}
