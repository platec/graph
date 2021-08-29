function isList(obj: any) {
  return obj instanceof List;
}

export default class List<T> {
  private _datas: T[] = [];

  constructor(array?: any) {
    const length = arguments.length;
    if (1 === length) {
      const arg = arguments[0];
      if (isList(arg)) {
        const size = arg.size();
        for (let i = 0; i < size; i++) {
          this._datas.push(arg.get(i));
        }
      } else if (Array.isArray(arg)) {
        const size = arg.length;
        for (let i = 0; i < size; i++) {
          this._datas.push(arg[i]);
        }
      } else {
        if (arg !== null) {
          this._datas.push(arg);
        }
      }
    } else if (length > 1) {
      for (let i = 0; i < length; i++) {
        this._datas.push(arguments[i]);
      }
    }
  }

  push(...args: T[]) {
    const length = args.length;
    for (let i = 0; i < length; i++) {
      this.add(args[i]);
    }
  }

  pop() {
    return this._datas.pop();
  }

  shift() {
    return this._datas.shift();
  }

  unshift(...args:T[]) {
    this._datas.unshift.apply(this._datas, args);
  }

  size() {
    return this._datas.length;
  }

  isEmpty() {
    return 0 === this._datas.length;
  }

  add(item: T, index?: number) {
    if (index === undefined) {
      this._datas.push(item);
    } else {
      this._datas.splice(index, 0, item);
    }
  }

  addAll(array: List<T> | Array<T>) {
    if (Array.isArray(array)) {
      const datas = array as Array<T>;
      const size = datas.length;
      for (let i = 0; i < size; i++) {
        this._datas.push(datas[i]);
      }
    } else if (isList(array)) {
      const datas = array as List<T>;
      const size = datas.size();
      for (let i = 0; i < size; i++) {
        this._datas.push(datas.get(i));
      }
    }
  }

  get(index: number) {
    return this._datas[index];
  }

  slice(start: number, end: number) {
    return new List(this._datas.slice(start, end));
  }

  remove(item: T) {
    const index = this._datas.indexOf(item);
    if (index >= 0) {
      this.removeAt(index);
      return index;
    }
  }

  set(index: number, item: T) {
    return (this._datas[index] = item);
  }

  clear() {
    return this._datas.splice(0, this._datas.length);
  }

  contains(item: T) {
    return this._datas.includes(item);
  }

  indexOf(item: T) {
    return this._datas.indexOf(item);
  }

  removeAt(index: number) {
    return this._datas.splice(index, 1)[0];
  }

  forEach(func: (item?: T, index?: number, context?: List<T>) => void, scope?: any) {
    this.each(func, scope);
  }

  each(func: (item?: T, index?: number, context?: List<T>) => void, scope?: any) {
    const length = this._datas.length;
    for (let i = 0; i < length; i++) {
      const item = this._datas[i];
      if (scope) {
        func.call(scope, item, i, this);
      } else {
        func(item, i, this);
      }
    }
  }

  reverseEach(func: (item?: T) => void, scope?: any) {
    for (let i = this._datas.length - 1; i >= 0; i--) {
      const item = this._datas[i];
      if (scope) {
        func.call(scope, item);
      } else {
        func(item);
      }
    }
  }

  getArray() {
    return this._datas;
  }

  toArray(matchFunc?: (x: any) => Boolean, scope?: any) {
    if (matchFunc) {
      const result: T[] = [];
      const length = this._datas.length;
      for (let i = 0; i < length; i++) {
        const item = this._datas[i];
        if (scope) {
          if (matchFunc.call(scope, item)) {
            result.push(item);
          }
        } else {
          matchFunc(item) && result.push(item);
        }
      }
      return result;
    } else {
      return this._datas.concat();
    }
  }

  toList(matchFunc?: (x: any) => Boolean, scope?: any): List<T> {
    if (matchFunc) {
      const result = new List<T>();
      const length = this._datas.length;
      for (let i = 0; i < length; i++) {
        const item = this._datas[i];
        if (scope) {
          if (matchFunc.call(scope, item)) {
            result.add(item);
          }
        } else {
          if (matchFunc(item)) {
            result.add(item);
          }
        }
      }
      return result;
    }
    return new List<T>(this);
  }

  reverse() {
    this._datas.reverse();
  }

  sort(sortFunc?: (a?: T, b?: T) => number) {
    if (sortFunc) {
      this._datas.sort(sortFunc);
    } else {
      this._datas.sort();
    }
    return this;
  }

  toString() {
    return this._datas.toString();
  }
}
