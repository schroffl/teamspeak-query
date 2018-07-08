'use strict';

const Base = require('./base');
const SshClient = require('ssh2').Client;

class SshTeamspeakQuery extends Base {

  constructor(options) {
    super();

    let client = new SshClient(),
        connectOptions = Object.assign({
          host: '127.0.0.1',
          port: 10022
        }, options);

    this.client = client;
    this.host = connectOptions.host;
    this.port = connectOptions.port;

    client.on('ready', () => {
      client.shell(false, (err, stream) => {
        if(err)
          super.emit('error', err);
        else
          super.streamSetup(stream);
      }); 
    });

    client.connect(connectOptions);
  }

}

module.exports = SshTeamspeakQuery;