export default class Notifier {
  private events: any;
  private isWaiting = false;
  constructor() {
    this.events = Object.create(null);
  }

  on(event: string | Array<string>, fn: Function) {
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.on(event[i], fn);
      }
    } else {
      (this.events[event] || (this.events[event] = [])).push(fn);
    }
    return this;
  }

  off(event: string | Array<string>, fn: Function) {
    if (!arguments.length) {
      this.events = Object.create(null);
      return this;
    }
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.off(event[i], fn);
      }
      return this;
    }
    const cbs = this.events[event];
    if (!cbs) {
      return this;
    }
    if (!fn) {
      this.events[event] = null;
      return this;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  }

  once(event: string | Array<string>, fn: Function) {
    const _this = this;
    function on() {
      _this.off(event, fn);
      fn.apply(_this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  }

  emit(event: string) {
    const cbs = this.events[event];
    if (cbs) {
      const args = Array.from(arguments).slice(1);
      for (let i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(this, args);
      }
    }
    return this;
  }

  emitNextTick(event: string) {
    if (!this.isWaiting) {
      this.isWaiting = true;
      requestAnimationFrame(() => {
        this.emit(event);
        this.isWaiting = false;
      });
    }
  }
}
