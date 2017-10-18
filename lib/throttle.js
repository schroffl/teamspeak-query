'use strict';

/**
 * Throttles function calls if needed.
 *
 * @class      Throttle
 */
class Throttle extends Map {

  constructor(config) {
    super([
      [ 'max', 10 ],
      [ 'per', 1000 ],
      [ 'enable', true ]
    ]);

    for(let prop in config)
      this.set(prop, config[prop]);

    this.calls = 0;
    this.stack = [ ];

    setInterval(() => {
      this.calls -= this.calls - 1 >= 0 ? 1 : 0;

      if(this.get('enable') && this.calls > 1 || !this.stack.length) return;

      let numLeft = this.get('max') - this.calls,
        chunk = this.stack.slice(0, numLeft);

      this.stack = this.stack.slice(numLeft)

      chunk.forEach(this.run.bind(this));
    }, this.get('per') / this.get('max'));
  }

  /**
   * Run a function that will be throttled if needed
   *
   * @param      {Function}  fn      The function
   */
  run(fn) {
    if(this.calls < this.get('max')) {
      if(this.get('enable')) this.calls++;
      fn();
    } else this.stack.push(fn);
  }
}

module.exports = Throttle;