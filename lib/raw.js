'use strict';

const Base = require('./base');
const net = require('net');

class RawTeamspeakQuery extends Base {

  constructor(options) {
    super();

    let sock = new net.Socket(),
        connectOptions = Object.assign({
          host: '127.0.0.1',
          port: 10011
        }, options);

    this.sock = sock;
    this.host = connectOptions.host;
    this.port = connectOptions.port;

    sock.on('connect', () => super.streamSetup(sock, sock));
    sock.connect(connectOptions);
  }

  disconnect() {
    return super.disconnect().then(() => this.sock.end());
  }

}

module.exports = RawTeamspeakQuery;
