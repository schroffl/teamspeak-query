'use strict';

class KeepAlive {

  constructor(f) {
    this._f = () => f();
    this._timeout;
    this._enable = true;
    this.duration = 5 * 60 * 1000;

    this._schedule();
  }

  _schedule() {
    this._timeout = setTimeout(() => {
      this._f();
      this.interrupt();
    }, this.duration);
  }

  interrupt() {
    this._timeout = clearTimeout(this._timeout);

    if(this._enable)
      this._schedule();
  }

  enable(status) {
    if(!this._enable && status)
      this._schedule();

    this._enable = status;
  }

}

module.exports = KeepAlive;
