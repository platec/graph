import DataModel from './DataModel';
import {
  drawNodeImage,
  containsPoint,
  getEventPosition,
  drawSlection,
  drawEdge,
  drawDisplayText,
} from './utils';
import Node from './Node';
import List from './List';
import Data from './Data';
import graph from './Global';

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
        const selection = [];
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
          selection.push(selectedNode);
        }
        if (
          this.dataModel.getSelection().size() !== 0 ||
          selection.length !== 0
        ) {
          this.dataModel.setSelection(selection);
        }
      }

      document.addEventListener('mousemove', onMouseMove, false);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (this.dataModel) {
        const selection = <List<Node>>this.dataModel.getSelection();
        const position = getEventPosition(document.body, e);
        if (selection.size() > 0) {
          selection.each((node) => {
            if (node) {
              node.x = position.x - offset.x;
              node.y = position.y - offset.y;
            }
          });
          this.renderAll();
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
      const imageToLoad = new Set();
      datas.each((data) => {
        const node = <Node>data;
        if (node.image && !graph.getImage(node.image)) {
          imageToLoad.add(node.image);
        }
      });
      this.context.save();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.dataModel.background) {
        this.context.fillStyle = this.dataModel.background;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
      }
      if (imageToLoad.size > 0) {
        await graph.loadSymbol(Array.from(imageToLoad));
      }
      const size = datas.size();
      for (let i = 0; i < size; i++) {
        const data = datas.get(i);
        const className = data.className;
        if (className === 'Node') {
          const node = <Node>data;
          if (node.image) {
            const imageURL = node.image;
            const image = graph.getImage(imageURL);
            // 图标内容
            const comps = <any[]>image.comps;
            if (comps.length) {
              if (!node.imageLoaded) {
                // 检查图标中是否有图片
                const imageList = comps.filter((v) => v.type === 'image');
                if (imageList.length > 0) {
                  await graph.loadImage(Array.from(new Set(imageList)));
                  node.imageLoaded = true;
                }
              }
              drawNodeImage(this, this.dataModel, node, image);
            }
          } else {
            drawNodeImage(this, this.dataModel, node);
          }
        } else if (data.className === 'Edge') {
          drawEdge(this.context, data);
        } else if (className === 'Text') {
          drawDisplayText(this.context, data);
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
