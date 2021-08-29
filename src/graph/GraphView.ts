import DataModel from './DataModel';
import {
  drawNodeImage,
  containsPoint,
  getEventPosition,
  drawSlection,
  drawEdge,
  drawDisplayText,
  drawShape,
} from './utils';
import Node from './Node';
import List from './List';
import Data from './Data';
import graph from './Global';
import Point from './Point';
import Shape from './Shape';

export interface GraphViewOptions {
  editable?: boolean;
}

export default class GraphView {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  container!: HTMLElement;
  dataModel?: DataModel;

  private _ro!: any;

  constructor(options: GraphViewOptions) {
    this.createLowerCanvas();
    if (options.editable) {
      this.initEventListeners();
    }
  }

  setDataModel(dm: DataModel) {
    this.dataModel = dm;
    this.dataModel.on('renderAll', () => {
      this.renderAll();
      console.info('%crenderAll', 'color: green');
    });
  }

  private initEventListeners() {
    const offset = {
      x: 0,
      y: 0,
    };

    const onMouseDown = (e: MouseEvent) => {
      const position = getEventPosition(document.body, e);
      if (this.dataModel) {
        const datas = this.dataModel.getDatas();
        const selection = new List<Data>();
        let selectedNode;
        for (let i = 0; i < datas.size(); i++) {
          const data = datas.get(i);
          if (data.className !== 'Edge') {
            // @ts-ignore
            const bounds = data.getBounds();
            if (containsPoint(bounds, position.x, position.y)) {
              // @ts-ignore
              offset.x = position.x - data.x;
              // @ts-ignore
              offset.y = position.y - data.y;
              selectedNode = data;
            }
          }
        }
        if (selectedNode) {
          selection.add(selectedNode);
        }
        if (
          this.dataModel.getSelection().size() !== 0 ||
          selection.size() !== 0
        ) {
          this.dataModel.setSelection(selection);
        }
      }

      document.addEventListener('mousemove', onMouseMove, false);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (this.dataModel) {
        const selection = <List<Data>>this.dataModel.getSelection();
        const position = getEventPosition(document.body, e);
        if (selection.size() > 0) {
          selection.each((data) => {
            const currentPoint = {
              x: position.x - offset.x,
              y: position.y - offset.y
            };
            // Shape需要平移所有的点
            if(data?.className === 'Shape') {
              const shape = <Shape>data;
              const points = shape.points;
              shape.points = points.map(point => {
                const p = new Point(point.x, point.y);
                // @ts-ignore
                const p2 = new Point(currentPoint.x - data.x, currentPoint.y - data.y);
                const v = p.add(p2);
                return {
                  x: v.x,
                  y: v.y
                };
              });
            }            
            if (data) {
              // @ts-ignore
              data.x = currentPoint.x;
              // @ts-ignore
              data.y = currentPoint.y;
            }

          });
        }
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove, false);
    };
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);

    const onMouseover = (event: MouseEvent) => {
      const position = getEventPosition(this.canvas, event);
      if (this.dataModel) {
        const datas = <List<Data>>this.dataModel.getDatas();
        let selectedNode;
        for (let i = 0; i < datas.size(); i++) {
          const data = datas.get(i);
          if (data.className !== 'Edge') {
            // @ts-ignore
            const bounds = data.getBounds();
            if (containsPoint(bounds, position.x, position.y)) {
              selectedNode = data;
              break;
            }
          }
        }
        if (selectedNode) {
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }
      }
    };
    this.canvas.addEventListener('mousemove', onMouseover, false);
  }

  async renderAll() {
    if (this.dataModel) {
      const datas = this.dataModel.getDatas();
      // 加载图标文件
      const symbolToLoad = new Set();
      const imageToLoad: Set<ImageCompConfig> = new Set();
      datas.each((data) => {
        const node = <Node>data;
        const image: string = node.image;
        if (image) {
          if (image.endsWith('.json')) {
            if (!graph.getImage(image)) {
              symbolToLoad.add(image);
            }
          } else {
            let cacheName;
            if (image.startsWith('data:image')) {
              cacheName = node.displayName;
            } else {
              cacheName = node.image;
            }
            if (!graph.getImage(cacheName)) {
              imageToLoad.add({
                name: image,
                displayName: node.displayName,
              });
            }
          }
        }
      });
      this.context.save();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.dataModel.background) {
        this.context.fillStyle = this.dataModel.background;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
      }
      // 提前加载图标
      if (symbolToLoad.size > 0) {
        await graph.loadSymbol(Array.from(symbolToLoad));
      }
      // 提前加载图片
      if (imageToLoad.size > 0) {
        await graph.loadImage(Array.from(imageToLoad));
      }
      const size = datas.size();
      for (let i = 0; i < size; i++) {
        const data = datas.get(i);
        const className = data.className;
        if (className === 'Node') {
          const node = <Node>data;
          if (node.image) {
            const imageURL: string = node.image;
            // 使用图标的Node
            if (imageURL.endsWith('.json')) {
              const symbol = graph.getImage(imageURL);
              // 图标内容
              const comps = <any[]>symbol.comps;
              if (comps.length) {
                if (!node.symbolLoaded) {
                  // 下载所有没有缓存的图标内图标文件
                  const imageSet: Set<ImageCompConfig> = new Set();
                  comps.forEach((comp) => {
                    if (comp.type === 'image') {
                      const img: string = comp.name;
                      if (
                        img.startsWith('data:image') &&
                        !graph.getImage(comp.displayName)
                      ) {
                        imageSet.add(comp);
                      } else if (!graph.getImage(comp.name)) {
                        imageSet.add(comp);
                      }
                    }
                  });
                  if (imageSet.size > 0) {
                    await graph.loadImage(Array.from(imageSet));
                    node.symbolLoaded = true;
                  }
                }
                drawNodeImage(this, this.dataModel, node, symbol);
              }
            } else {
              drawNodeImage(this, this.dataModel, node);
            }
          } else {
            // 不使用图标或者图片文件的Node
            drawNodeImage(this, this.dataModel, node);
          }
        } else if (data.className === 'Edge') {
          drawEdge(this.context, data);
        } else if (className === 'Text') {
          drawDisplayText(this.context, data);
        } else if (className === 'Shape') {
          drawShape(this.context, data);
        }
      }
      const selection = <List<Data>>this.dataModel.getSelection();
      selection.each((data) => {
        if (data) {
          drawSlection(this, data);
        }
      });
      this.context.restore();
    }
  }

  requestRenderAll() {
    requestAnimationFrame(this.renderAll.bind(this));
  }

  fitContent() {}

  mount(el: HTMLElement) {
    this.container = el || document.body;
    this.container.appendChild(this.canvas);
    // resize canvas
    this._ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvasWidth = Math.floor(width);
        const canvasHeight = Math.floor(height);
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        // TODO nexttick
        this.requestRenderAll();
        // TODO broadcast resize event
      }
    });
    this._ro.observe(this.container);
  }

  destory() {
    this._ro.disconnect();
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
      this.context = context;
    } else {
      throw new Error('get 2d context failed');
    }
    this.canvas = canvas;
    return this.canvas;
  }
}
