import Notifier from './Notifier';

export default class Data {
  className = 'Data';
  private _notifier?: Notifier;;
  private _id?: number;

  constructor() {
  }

  getId() {
    return this._id;
  }

  setId(id: number) {
    this._id = id;
  }

  setNotifier(notifier: Notifier) {
    this._notifier = notifier;
  }

  update() {
    if (this._notifier) {
      this._notifier.emitNextTick('render');
    }
  }
}