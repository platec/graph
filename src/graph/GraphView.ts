import Data from './Data';
import List from './List';
import Text from './Text';
import Shape from './Shape';
import Notifier from './Notifier';
import Node from './Node';
import { DefaultValue, getClass, propNameToMethod, setImage } from './util';
import renderText from './render/text';
import renderShape from './render/shape';
import renderEdge from './render/edge';
import {
  renderEdgeSourceTarget,
  renderNode,
  rotateData,
  transformData,
} from './render';
import Edge from './Edge';

const imageLoading = new Map<string, boolean>();

export default class GraphView extends Notifier {
  private _canvas!: HTMLCanvasElement;
  private _context!: CanvasRenderingContext2D;
  private _container?: HTMLElement;
  private _dataList = new List<Data>();
  private _selection = new List<Data>();
  private _dataIdMap = new Map<number, Data>();
  private _dataTagMap = new Map<string, Data>();
  private _lastId = 0;
  private _notifier = new Notifier();
  private _options: GraphViewOptions = {};
  private _ro?: ResizeObserver;

  private _viewportTransform = DefaultValue.identityMatrix.concat();
  private _background?: string;
  private _imageSmoothingEnabled?: boolean;

  static convertURL = (url: string) => url;

  constructor(options?: GraphViewOptions) {
    super();
    this._options = options || {};
    this._createCanvas();
    this._initOptions();
    this._notifier.on('render', () => {
      console.log('tick');
      this.render();
    });
  }

  private _initOptions() {
    const imageSmoothingEnabled =
      this._options.imageSmoothingEnabled === undefined
        ? true
        : this._options.imageSmoothingEnabled;
    this._context.imageSmoothingEnabled = this._imageSmoothingEnabled = imageSmoothingEnabled;
  }

  private _createCanvas() {
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
   * 加载图片/图标
   * @param imageList
   * @returns
   */
  static async loadImage(imageList: string[]) {
    const imageToLoad = imageList.filter((v) => {
      return imageLoading.get(v) !== true;
    });
    if (imageToLoad.length === 0) {
      return Promise.reject();
    }
    const loadList = imageToLoad.map((image) => {
      return new Promise((resolve: (p: void) => void) => {
        imageLoading.set(image, true);
        if (image.endsWith('.json')) {
          this.loadResource(image).then((json) => {
            setImage(image, json);
            imageLoading.delete(image);
            resolve();
          });
        } else {
          const img = new Image();
          img.onload = () => {
            setImage(image, img);
            imageLoading.delete(image);
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
    this.update();
  }

  getBackground() {
    return this._background;
  }

  setImageSmoothing(imageSmoothingEnabled: boolean) {
    this._context.imageSmoothingEnabled = imageSmoothingEnabled;
    this.update();
  }

  getSelection() {
    return this._selection;
  }

  setSelection(dataList: List<Data> | Data[]) {
    this._selection = new List(dataList);
    this.update();
  }

  getDataList() {
    return this._dataList;
  }

  addData(data: Data, index?: number) {
    data.setNotifier(this._notifier);
    if (!data.getId()) {
      data.setId(++this._lastId);
    }
    this._dataIdMap.set(data.getId()!, data);
    this._dataList.add(data, index);
    this.update();
  }

  getDataById(id: number) {
    return this._dataIdMap.get(id);
  }

  /**
   * 加载图纸文件
   * @param url
   */
  async load(url: string) {
    const json = await GraphView.loadResource(url);
    this._deserialize(json);
  }

  private _deserialize(display: Display) {
    this._dataList.clear();
    this._dataIdMap.clear();
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
      this._dataIdMap.set(id, data);
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
    // TODO 数据绑定
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

  render() {
    console.log('%crender', 'color:green');
    this.clear(this._context);
    this._renderBackground(this._context);
    this._renderAllData(this._context, this._dataList);
  }

  clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  private _renderAllData(ctx: CanvasRenderingContext2D, dataList: List<Data>) {
    for (let i = 0; i < dataList.size(); i++) {
      const data = dataList.get(i);
      this._renderData(ctx, data);
    }
  }

  private _renderData(ctx: CanvasRenderingContext2D, data: Data) {
    const className = data.className;
    ctx.save();

    // 绘制图形
    switch (className) {
      case 'Node': {
        renderNode(ctx, this, <Node>data);
        break;
      }
      case 'Edge': {
        renderEdgeSourceTarget(ctx, this, <Edge>data);
        break;
      }
      case 'Text': {
        rotateData(ctx, <Text>data);
        transformData(ctx, <Text>data);
        renderText(ctx, <Text>data);
        break;
      }
      case 'Shape': {
        rotateData(ctx, <Shape>data);
        transformData(ctx, <Shape>data);
        renderShape(ctx, <Shape>data);
        break;
      }
    }
    ctx.restore();
  }

  setViewportTransform(t: number[]) {
    this._viewportTransform = t;
    this.update();
  }

  getViewportTransform() {
    return this._viewportTransform;
  }

  private _renderBackground(ctx: CanvasRenderingContext2D) {
    if (this._background) {
      ctx.save();
      ctx.fillStyle = this._background!;
      const v = this._viewportTransform;
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
      ctx.restore();
    }
  }

  /**
   * 通知更新画面
   */
  update() {
    this._notifier.emitNextTick('render');
  }

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

  destory() {
    if (this._ro) {
      this._ro.disconnect();
    }
    // 删除所有监听事件
    this.off();
    this._notifier.off();
    this._dataList.clear();
    this._dataIdMap.clear();
    this._dataTagMap.clear();
  }
}
