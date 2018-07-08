'use strict';

const Base = require('./base');
const net = require('net');

class RawTeamspeakQuery extends Base {

  constructor(host, port, options) {
    super();

    let sock = new net.Socket(),
        connectOptions = Object.assign({}, options, {
          host: host || '127.0.0.1',
          port: port || 10011
        });

    this.sock = sock;
    this.host = connectOptions.host;
    this.port = connectOptions.port;

    sock.on('connect', () => super.streamSetup(sock));
    sock.connect(connectOptions);
  }

}

module.exports = RawTeamspeakQuery;
