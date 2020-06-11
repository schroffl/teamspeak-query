'use strict';

const Base = require('./base');

class CustomTeamspeakQuery extends Base {

  constructor(connect, disconnect) {
    super();

    this.disconnectFn = disconnect;

    connect(this, (source, sink) => {
      super.streamSetup(source, sink);
    });
  }

  disconnect() {
    const f = err => {
      if (typeof this.disconnectFn === 'function') {
        this.disconnectFn(this, err);
      }
    };

    super.disconnect()
      .then(() => f(null))
      .catch(err => f(err));
  }

}

module.exports = CustomTeamspeakQuery;
