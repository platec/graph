import Text from '../Text';
import { DefaultValue } from '../util';

const getTextSize = (function() {
  const heightCache: any = {};
  const context = document.createElement('canvas').getContext('2d');
  return function(font: string, text: string) {
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

export default function renderText(
  ctx: CanvasRenderingContext2D,
  data: Text
): void;

export default function renderText(
  ctx: CanvasRenderingContext2D,
  comp: Comp
): void;

export default function renderText(ctx: CanvasRenderingContext2D, data: any) {
  ctx.save();
  let x, y, width, height, text, font, color, align, vAlign;
  const comp = <Comp>data;
  if (comp.type) {
    [x, y, width, height] = comp.rect!;
    ({ text, font, color, align, vAlign } = comp);
  } else {
    x = 0;
    y = 0;
    ({ width, height } = data.getSize());
    text = data.getStyle('text');
    font = data.getStyle('text.font');
    color = data.getStyle('text.color');
    align = data.getStyle('text.align');
    vAlign = data.getStyle('text.vAlign');
  }
  ctx.font = font || DefaultValue.font;
  const size = getTextSize(ctx.font, text);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || DefaultValue.fontColor;
  vAlign = vAlign || DefaultValue.vAlign;
  align = align || DefaultValue.align;
  color = color || DefaultValue.fontColor;
  text = text || DefaultValue.text;
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
