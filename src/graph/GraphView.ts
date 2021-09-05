import Node from './Node';
import List from './List';
import Data from './Data';
import Shape from './Shape';
import Text from './Text';
import {
  setImage,
  getClass,
  propNameToMethod,
  getImage,
  getEventPosition,
  containsPoint,
  DefaultValue,
  rotatePoint,
} from './util';
import Notifier from './Notifier';
import { beforeRenderNodeData, drawSlection, rotateData } from './render';
import Point from './Point';
import renderEdge from './render/edge';
import Edge from './Edge';
import renderText from './render/text';
import renderShape from './render/shape';
import renderRect from './render/rect';
import renderArc from './render/arc';
import renderTriangle from './render/triangle';
import renderCircle from './render/circle';
import renderOval from './render/oval';
import renderImage from './render/image';

export interface GraphViewOptions {
  editable?: boolean;
}

export default class GraphView {
  private _canvas!: HTMLCanvasElement;
  private _context!: CanvasRenderingContext2D;
  private _container!: HTMLElement;
  private _dataList = new List<Data>();
  private _notifier = new Notifier();
  private _background?: string;
  private _dataMap = new Map<number, Data>();
  private _lastId = 0;
  private _selection = new List<Data>();
  static convertURL = (url: string) => url;

  private _ro!: any;

  constructor(options: GraphViewOptions) {
    this.createLowerCanvas();
    if (options.editable) {
      this._initEventListeners();
    }
    this._notifier.on('render', () => {
      this.render();
    });
  }

  getDataList() {
    return this._dataList;
  }

  addData(data: Data, index?: number) {
    data.setNotifier(this._notifier);
    if (!data.getId()) {
      data.setId(++this._lastId);
    }
    this._dataMap.set(data.getId()!, data);
    this._dataList.add(data, index);
    this.update();
  }

  getDataById(id: number) {
    return this._dataMap.get(id);
  }

  /**
   * 加载图纸文件
   * @param url
   */
  async load(url: string) {
    const json = await GraphView.loadResource(url);
    this._deserialize(json);
  }

  private _initEventListeners() {
    const offset = {
      x: 0,
      y: 0,
    };

    const onMouseDown = (e: MouseEvent) => {
      const position = getEventPosition(document.body, e);
      const datas = this.getDataList();
      if (datas.size() > 0) {
        const selection = new List<Data>();
        let selectedNode;
        for (let i = 0; i < datas.size(); i++) {
          const data = datas.get(i);
          if (data.className !== 'Edge') {
            const node = <Node>data;
            let rotation = node.getRotation();
            // @ts-ignore
            const { x, y } = data.getPostion();
            let cx = position.x;
            let cy = position.y;
            if (rotation) {
              ({ x: cx, y: cy } = rotatePoint(
                position,
                node.getPostion(),
                -1 * rotation
              ));
            }
            // @ts-ignore
            const bounds = data.getRect();
            if (containsPoint(bounds, cx, cy)) {
              // @ts-ignore
              offset.x = position.x - x;
              // @ts-ignore
              offset.y = position.y - y;
              selectedNode = data;
            }
          }
        }
        if (selectedNode) {
          selection.add(selectedNode);
        }
        if (this.getSelection().size() !== 0 || selection.size() !== 0) {
          this.setSelection(selection);
        }
      }

      document.addEventListener('mousemove', onMouseMove, false);
    };
    const onMouseMove = (e: MouseEvent) => {
      const selection = this.getSelection();
      const position = getEventPosition(document.body, e);
      if (selection.size() > 0) {
        selection.each((data) => {
          const currentPoint = {
            x: position.x - offset.x,
            y: position.y - offset.y,
          };
          // Shape需要平移所有的点
          if (data?.className === 'Shape') {
            const shape = <Shape>data;
            const points = shape.getPoints();
            const { x, y } = shape.getPostion();
            const pointsMoved = points.map((point) => {
              const p = new Point(point.x, point.y);
              // @ts-ignore
              const p2 = new Point(currentPoint.x - x, currentPoint.y - y);
              const v = p.add(p2);
              return {
                x: v.x,
                y: v.y,
              };
            });
            shape.setPoints(pointsMoved);
          }
          if (data) {
            // @ts-ignore
            data.setPosition({
              ...currentPoint,
            });
          }
        });
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove, false);
    };
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);

    const onMouseover = (event: MouseEvent) => {
      const position = getEventPosition(this._canvas, event);
      const datas = this.getDataList();
      let selectedNode;
      for (let i = 0; i < datas.size(); i++) {
        const data = datas.get(i);
        if (data.className !== 'Edge') {
          const node = <Node>data;
          let rotation = node.getRotation();
          let cx = position.x;
          let cy = position.y;
          if (rotation) {
            ({ x: cx, y: cy } = rotatePoint(
              position,
              node.getPostion(),
              -1 * rotation
            ));
          }
          const bounds = node.getRect();
          if (containsPoint(bounds, cx, cy)) {
            selectedNode = data;
            break;
          }
        }
      }
      if (selectedNode) {
        this._canvas.style.cursor = 'pointer';
      } else {
        this._canvas.style.cursor = 'default';
      }
    };
    this._canvas.addEventListener('mousemove', onMouseover, false);
  }

  /**
   * 图纸发序列化
   * @param display
   */
  private _deserialize(display: Display) {
    this._dataList.clear();
    this._dataMap.clear();
    const property = display.p;
    if (property.background) {
      this.setBackground(property.background);
    }
    const datas = display.d;
    const displayDataList: DisplayData[] = [];
    const dataList: Data[] = [];
    // 图纸中全部的data
    this._lastId = 0;
    for (const displayData of datas) {
      const className = displayData.c.slice(displayData.c.indexOf('.') + 1);
      const id = displayData.i;
      if (id >= this._lastId) {
        this._lastId = id;
      }
      const classCtrl = getClass(className);
      const data = <Data>new classCtrl();
      data.setId(id);
      this._dataMap.set(id, data);
      data.setNotifier(this._notifier);
      dataList.push(data);
      displayDataList.push(displayData);
    }
    // 设置data属性
    const dataCount = displayDataList.length;
    for (let i = 0; i < dataCount; i++) {
      const data = dataList[i];
      const displayData = displayDataList[i];
      this._deserializeData(data, displayData);
      this.addData(data);
    }
  }

  private _deserializeData(data: Data, displayData: DisplayData) {
    const p = displayData.p || {};
    const a = displayData.a || {};
    const s = displayData.s || {};
    for (const k in p) {
      const methodName = propNameToMethod(k);
      // @ts-ignore
      const value = p[k];
      // @ts-ignore
      data[methodName] && data[methodName](this._deserializeValue(value));
    }
    for (const styleName in s) {
      // @ts-ignore
      const value = s[styleName];
      // @ts-ignore
      data.setStyle(styleName, this._deserializeValue(value));
    }
  }

  private _deserializeValue(value: any) {
    if (value === undefined || value === null) {
      return;
    }
    if (value.__i) {
      return this.getDataById(value.__i);
    }
    if (value.__a) {
      return value.__a;
    }
    return value;
  }

  /**
   * 通知更新画面
   */
  update() {
    this._notifier.emitNextTick('render');
  }

  render() {
    this._renderAllData();
  }

  /**
   * 渲染全部图形
   */
  private _renderAllData() {
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    if (this._background) {
      this._context.fillStyle = this._background;
      this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
      this._context.restore();
    }
    const dataList = this.getDataList();
    const count = dataList.size();
    for (let i = 0; i < count; i++) {
      const data = dataList.get(i);
      this._renderData(data);
    }
    const selection = this.getSelection();
    selection.each((data) => {
      if (data) {
        drawSlection(this._context, data);
      }
    });
  }

  private _renderData(data: Data) {
    const className = data.className;
    const ctx = this._context;
    ctx.save();
    switch (className) {
      case 'Node':
        this._renderNode(<Node>data);
        break;
      case 'Edge':
        this._renderEdge(<Edge>data);
        break;
      case 'Text':
        this._renderText(<Text>data);
        break;
      case 'Shape':
        this._renderShape(<Shape>data);
        break;
    }
    ctx.restore();
  }

  private _renderNode(data: Node) {
    const image = data.getImage();
    const shape = data.getStyle('shape');
    if (image && !getImage(image)) {
      GraphView.loadImage([image]).then(() => {
        this.update();
      });
      return;
    }
    beforeRenderNodeData(this._context, data);
    if (!image && shape) {
      this._renderBasicShape(shape, data);
    } else if (image) {
      // 图标或图片
      if (!image.endsWith('.json')) {
        renderImage(this._context, data);
      } else {
        this._renderSymbolImage(image, data);
      }
    }
  }

  private _renderBasicShape(type: string, data: any) {
    switch (type) {
      case 'rect':
        renderRect(this._context, data);
        break;
      case 'circle':
        renderCircle(this._context, data);
        break;
      case 'oval':
        renderOval(this._context, data);
        break;
      case 'triangle':
        renderTriangle(this._context, data);
        break;
      case 'arc':
        renderArc(this._context, data);
        break;
      case 'text':
        renderText(this._context, data);
        break;
      case 'image':
        if (data.name && data.name.endsWith('.json')) {
          this._renderSymbolImage(data.name, data);
        } else {
          renderImage(this._context, data);
        }
        break;
      case 'shape':
        renderShape(this._context, data);
        break;
    }
  }

  private _renderSymbolImage(image: string, node: Node, comp?: Comp) {
    const imageCache = getImage(image);
    const comps: Comp[] = imageCache.comps;
    this._context.save();
    if (comp && imageCache) {
      const [x, y, width, height] = comp.rect!;
      this._context.translate(x, y);
      const scaleX = width / imageCache.width;
      const scaleY = height / imageCache.height;
      this._context.scale(scaleX, scaleY);
    }

    if (comps) {
      for (const cp of comps) {
        // 图标内元素的旋转
        if (cp.rotation) {
          const [x, y, width, height] = cp.rect!;
          const anchorX = cp.anchorX || DefaultValue.anchorX;
          const anchorY = cp.anchorY || DefaultValue.anchorY;          
          const cx = x + width * anchorX;
          const cy = y + height * anchorY;
          this._context.translate(cx, cy);
          this._context.rotate(cp.rotation);
          this._context.translate(-cx, -cy);
        }
        if (cp.type !== 'image') {
          this._renderBasicShape(cp.type, cp);
        } else {
          const name = cp.name!;
          const imageCache = getImage(name);
          if (!imageCache) {
            GraphView.loadImage([name]).then(() => {
              this.update();
            });
            continue;
          }
          if (name.endsWith('.json')) {
            this._renderSymbolImage(name, node, cp);
          } else {
            renderImage(this._context, cp);
          }
        }
      }
    }
    this._context.restore();
  }

  private _renderEdge(data: Edge) {
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
        this.update();
      });
    } else {
      renderEdge(this._context, data);
    }
  }

  private _renderText(data: Text) {
    renderText(this._context, data);
  }

  private _renderShape(data: Shape) {
    rotateData(this._context, data);
    renderShape(this._context, data);
  }

  fitContent() {}

  mount(el: HTMLElement) {
    this._container = el || document.body;
    this._container.appendChild(this._canvas);
    // resize canvas
    this._ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvasWidth = Math.floor(width);
        const canvasHeight = Math.floor(height);
        this._canvas.width = canvasWidth;
        this._canvas.height = canvasHeight;
        this._canvas.style.width = canvasWidth + 'px';
        this._canvas.style.height = canvasHeight + 'px';
        this.render();
      }
    });
    this._ro.observe(this._container);
  }

  private createLowerCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.right = '0px';
    canvas.style.bottom = '0px';
    const context = canvas.getContext('2d');
    if (context) {
      this._context = context;
    } else {
      throw new Error('get 2d context failed');
    }
    this._canvas = canvas;
    return this._canvas;
  }

  /**
   * 加载图纸
   * @param display
   * @returns
   */
  static async loadResource(display: string) {
    const url = GraphView.convertURL(display);
    const resp = await fetch(url, {
      method: 'GET',
    });
    const json = await resp.json();
    return json;
  }

  /**
   * 加载图片
   * @param imageList
   * @returns
   */
  static async loadImage(imageList: string[]) {
    const loadList = imageList.map((image) => {
      return new Promise((resolve: (p: void) => void) => {
        if (image.endsWith('.json')) {
          this.loadResource(image).then((json) => {
            setImage(image, json);
            resolve();
          });
        } else {
          const img = new Image();
          img.onload = () => {
            setImage(image, img);
            resolve();
          };
          if (image.startsWith('data:image')) {
            img.src = image;
          } else {
            img.src = GraphView.convertURL(image);
          }
        }
      });
    });
    return Promise.all(loadList);
  }

  setBackground(background: string) {
    this._background = background;
  }

  getBackground() {
    return this._background;
  }

  getSelection() {
    return this._selection;
  }

  setSelection(dataList: List<Data> | Data[]) {
    this._selection = new List(dataList);
    this.update();
  }

  destory() {
    this._ro.disconnect();
    this._dataList.clear();
    this._dataMap.clear();
    this._notifier.off('render');
  }
}
