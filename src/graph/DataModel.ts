import Data from './Data';
import Node from './Node';
import Notifier from './Notifier';
import Edge, { getEdgeStyle } from './Edge';
import List from './List';
import { generateNode, generateShape, generateText, uuid } from './utils';

export default class DataModel extends Notifier {
  private _dataList: List<Data> = new List();
  private _selection: List<Data> = new List();
  private _idMap = new Map<number, Data>();
  private _lastId?: number;
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

  add(data: Data, index?: number) {
    data.dataModel = this;
    if (!data.id) {
      if (this._lastId) {
        this._lastId += 1;
        data.id = this._lastId;
      } else {
        data.id = uuid();
        this._lastId = data.id;
      }
    } else {
      this._lastId = data.id;
    }
    this._dataList.add(data, index);
    this._idMap.set(data.id, data);
    // update canvas
    this.emitNextTick('renderAll');
  }

  getDataById(id: number) {
    return this._idMap.get(id);
  }

  getDatas() {
    return this._dataList;
  }

  getSelection() {
    return this._selection;
  }

  setSelection(datas: List<Data>) {
    this._selection.clear();
    const size = datas.size();
    for (let i = 0; i < size; i++) {
      const data = datas.get(i);
      this._selection.push(data);
    }
    // update canvas next tick
    this.emitNextTick('renderAll');
  }

  deserialize(json: any) {
    const datas = <any[]>json.d;
    const dataModelProperty = <any>json.p;
    if (dataModelProperty) {
      this.background = dataModelProperty.background;
    }
    const dataCount = datas.length;
    if (dataCount > 0) {
      const dataList: Data[] = new Array(dataCount).fill(null);
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const property = data.p;
        const originClassName: string = data.c;
        const dotIndex = originClassName.indexOf('.');
        const className = originClassName.substr(dotIndex + 1);
        const id = data.i;
        if (className === 'Node') {
          if (!this.getDataById(id)) {
            const node = generateNode(data);
            this.add(node, i);
          }
        }
        if (className == 'Text') {
          const text = generateText(data);
          this.add(text, i);
        }
        // 连线
        if (className === 'Edge') {
          const edge = new Edge();
          if (data.s) {
            const style = getEdgeStyle(data.s);
            edge.setStyle(style);
          }
          edge.id = data.i;
          edge.dataModel = this;
          this.add(edge, i);
          dataList[i] = edge;
          const { source, target } = property;
          const sourceNode = <Node>this.getDataById(source.__i);
          if (!sourceNode) {
            const sourceJsonIndex = datas.findIndex((v) => v.i === source.__i);
            if (sourceJsonIndex === -1) continue;
            const sourceJson = datas[sourceJsonIndex];
            const sourceNode = generateNode(sourceJson);
            this.add(sourceNode, sourceJsonIndex);
            edge.setSource(sourceNode);
          } else {
            edge.setSource(sourceNode);
          }
          const targetNode = <Node>this.getDataById(target.__i);
          if (!targetNode) {
            const targetJsonIndex = datas.findIndex((v) => v.i === target.__i);
            if (targetJsonIndex === -1) continue;
            const targetJson = datas[targetJsonIndex];
            const targetNode = generateNode(targetJson);
            this.add(targetNode, targetJsonIndex);
            edge.setTarget(targetNode);
          } else {
            edge.setTarget(targetNode);
          }
        }
        if (className === 'Shape') {
          const shape = generateShape(data);
          this.add(shape, i);
        }
      }
    }
  }
}
