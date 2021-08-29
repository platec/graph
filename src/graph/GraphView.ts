import DataModel from './DataModel';
import {
  drawNodeImage,
  containsPoint,
  getEventPosition,
  drawSlection,
  drawEdge,
} from './utils';
import Node from './Node';
import List from './List';
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
          if (data.className === 'Node') {
            const node = <Node>datas.get(i);
            const bounds = node.getBounds();
            if (containsPoint(bounds, position.x, position.y)) {
              offset.x = position.x - node.x;
              offset.y = position.y - node.y;
              selectedNode = node;
            }
          }
        }
        if (selectedNode) {
          selection.push(selectedNode);
        }
        this.dataModel.setSelection(selection);
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
        const datas = <List<Node>>this.dataModel.getDatas();
        let selectedNode;
        for (let i = 0; i < datas.size(); i++) {
          const data = datas.get(i);
          if (data.className === 'Node') {
            const node = datas.get(i);
            const bounds = node.getBounds();
            if (containsPoint(bounds, position.x, position.y)) {
              selectedNode = node;
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
        if (data.className === 'Node') {
          const node = <Node>data;
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
        } else if (data.className === 'Edge') {
          drawEdge(this.context, data);
        }
      }
      const selection = <List<Node>>this.dataModel.getSelection();
      selection.each((node) => {
        drawSlection(this, <Node>node);
      });
      this.context.restore();
    }
  }

  requestRenderAll() {
    setTimeout(this.renderAll.bind(this), 0);
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
        this.renderAll();
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
