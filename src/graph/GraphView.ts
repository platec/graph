import DataModel from './DataModel';
import {
  drawNodeImage,
  containsPoint,
  getEventPosition,
  drawSlection,
  drawEdge,
} from './utils';
import Node from './Node';
import graph from './Global';

export interface GraphViewOptions {
  editable?: boolean;
}

export default class GraphView {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  container!: HTMLElement;
  dataModel?: DataModel;

  private ro!: any;

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
        for (let i = 0; i < datas.length; i++) {
          const data = datas[i];
          if (data.className === 'Node') {
            const node = <Node>datas[i];
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
        const selection = <Node[]>this.dataModel.getSelection();
        const position = getEventPosition(document.body, e);
        if (selection.length > 0) {
          for (const node of selection) {
            node.x = position.x - offset.x;
            node.y = position.y - offset.y;
          }
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
        const datas = this.dataModel.getDatas();
        let selectedNode;
        for (let i = 0; i < datas.length; i++) {
          const data = datas[i];
          if (data.className === 'Node') {
            const node = <Node>datas[i];
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
      const imageToLoad = [];
      for (let data of datas) {
        const node = <Node>data;
        if (node.image && !graph.getImage(node.image)) {
          imageToLoad.push(node.image);
        }
      }
      this.context.save();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.dataModel.background) {
        this.context.fillStyle = this.dataModel.background;
        this.context.fillRect(0, 0 ,this.canvas.width, this.canvas.height);
        this.context.restore();
      }
      if (imageToLoad.length > 0) {
        await graph.loadSymbol(imageToLoad);
      }      
      for (let data of datas) {
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
                await graph.loadImage(imageList);
                node.imageLoaded = true;
              }
            }
            drawNodeImage(this, this.dataModel, node, image);
          }
        } else if (data.className === 'Edge') {
          drawEdge(this.context, data);
        }
      }
      const selection = this.dataModel.getSelection();
      for (const node of selection) {
        drawSlection(this, <Node>node);
      }
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
    this.ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvasWidth = Math.floor(width);
        const canvasHeight = Math.floor(height);
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        this.renderAll();
      }
    });
    this.ro.observe(this.container);
  }

  destory() {
    this.ro.disconnect();
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
