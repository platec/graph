import Node from './Node';
import List from './List';
import Data from './Data';
import Shape from './Shape';
import {
  setImage,
  getClass,
  propNameToMethod,
  getImage,
  getEventPosition,
  containsPoint,
} from './util';
import Notifier from './Notifier';
import { drawSlection, renderData } from './render';
import Point from './Point';

export interface GraphViewOptions {
  editable?: boolean;
  convertURL?: (url: string) => string;
}

export default class GraphView {
  private _canvas!: HTMLCanvasElement;
  private _context!: CanvasRenderingContext2D;
  private _container!: HTMLElement;
  private _dataList = new List<Data>();
  private _notifier = new Notifier();
  private _convertURL = (url: string) => url;
  private _background?: string;
  private _dataMap = new Map<number, Data>();
  private _lastId = 0;
  private _selection = new List<Data>();

  private _ro!: any;

  constructor(options: GraphViewOptions) {
    this.createLowerCanvas();
    if (options.editable) {
      this._initEventListeners();
    }
    if (options.convertURL) {
      this._convertURL = options.convertURL;
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
    const json = await this._loadResource(url);
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
            // @ts-ignore
            const bounds = data.getRect();
            // @ts-ignore
            const { x, y } = data.getPostion();
            if (containsPoint(bounds, position.x, position.y)) {
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
          // @ts-ignore
          const bounds = data.getRect();
          if (containsPoint(bounds, position.x, position.y)) {
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
      // @ts-ignore
      if (!data.getImage || !data.getImage() || getImage(data.getImage())) {
        renderData(this._context, data);
      } else {
        // @ts-ignore
        const node = <Node>data;
        if (node.getImage) {
          const image = node.getImage();
          console.log(image)
          if (!getImage(image)) {
            this._loadImage([image]).then(() => {
              this.render();
            });
          }
        }
      }
    }
    const selection = this.getSelection();
    selection.each((data) => {
      if (data) {
        drawSlection(this._context, data);
      }
    });
  }

  private _renderSelection() {}

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
  private async _loadResource(display: string) {
    const url = this._convertURL(display);
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
  private async _loadImage(imageList: string[]) {
    const loadList = imageList.map((image) => {
      return new Promise((resolve: (p: void) => void) => {
        if (image.endsWith('.json')) {
          this._loadResource(image).then((json) => {
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
            img.src = this._convertURL(image);
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
