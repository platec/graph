import Data from './Data';
import Node from './Node';
import Notifier from './Notifier';
import global from './Global';
import Edge from './Edge';
import { generateNode, uuid } from './utils';

export default class DataModel extends Notifier {
  private dataList: Data[] = [];
  private selectedDataList: Data[] = [];
  private imageLoaded = false; // 图标全部加载完毕
  private idMap = new Map<number, Data>();
  private lastId?: number;
  private _backgrond?: string | undefined;

  constructor() {
    super();
  }

  set background(bg: string | undefined) {
    this._backgrond = bg;
    this.emitNextTick('renderAll');
  }

  get background(): string | undefined {
    return this._backgrond;
  }

  add(data: Data) {
    data.dataModel = this;
    if (!data.id) {
      if (this.lastId) {
        this.lastId += 1;
        data.id = this.lastId;
      } else {
        data.id = uuid();
        this.lastId = data.id;
      }
    } else {
      this.lastId = data.id;
    }
    // 检查是否有image且image是否有缓存
    this.dataList.push(data);
    this.idMap.set(data.id, data);
    // update canvas
    this.emitNextTick('renderAll');
  }

  setDatas(datas: Data[]) {
    for (const data of datas) {
      this.add(data);
    }
  }

  getDataById(id: number) {
    return this.idMap.get(id);
  }

  getDatas() {
    return this.dataList;
  }

  getSelection() {
    return this.selectedDataList;
  }

  setSelection(datas: Data[]) {
    this.selectedDataList = datas;
    // update canvas next tick
    this.emitNextTick('renderAll');
  }

  deserialize(json: any) {
    this.imageLoaded = false;
    const datas = <any[]>json.d;
    const dataModelProperty = <any>json.p;
    if (dataModelProperty) {
      this.background = dataModelProperty.background;
    }
    const dataCount = datas.length;
    if (dataCount > 0) {
      const nodeList: any[] = new Array(dataCount).fill(null);
      const imageList = [];
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const property = data.p;
        const className = data.c;
        if (className === 'Node') {
          const node = generateNode(data);
          if (node.image) {
            // 加载图标
            imageList.push(node.image);
          }
          node.dataModel = this;
          nodeList[i] = node;
        }
        // 连线
        if (className === 'Edge') {
          const { source, target } = property;
          let sourceNode = <Node>this.getDataById(source.__i);
          if (!sourceNode) {
            const sourceJsonIndex = datas.findIndex((v) => v.i === source.__i);
            if (sourceJsonIndex === -1) continue;
            const sourceJson = datas[sourceJsonIndex];
            sourceNode = generateNode(sourceJson);
            nodeList[sourceJsonIndex] = sourceNode;
          }
          let targetNode = <Node>this.getDataById(target.__i);
          if (!targetNode) {
            const targetJsonIndex = datas.findIndex((v) => v.i === target.__i);
            if (targetJsonIndex === -1) continue;
            const targetJson = datas[targetJsonIndex];
            targetNode = generateNode(targetJson);
            nodeList[targetJsonIndex] = targetNode;
          }
          const edge = new Edge();
          edge.id = data.i;
          edge.dataModel = this;
          edge.setTarget(targetNode);
          edge.setSource(sourceNode);
          nodeList[i] = edge;
        }
      }

      this.setDatas(nodeList);
    }
  }
}
