import DataModel from './DataModel';

export default class Data {
  dataModel?: DataModel;;
  className = 'Data';
  private _id!: number;

  constructor() {
  }

  public get id() {
    return this._id;
  }

  public set id(id) {
    this._id = id;
  }  

  changeData() {
    if (this.dataModel) {
      this.dataModel.emitNextTick('renderAll');
    }
  }
}