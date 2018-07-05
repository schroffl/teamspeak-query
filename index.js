'use strict';

const net = require('net');
const EventEmitter = require('eventemitter2');

const type = require('type-of');
const carrier = require('carrier');

const Throttle = require('./lib/throttle');
const KeepAlive = require('./lib/keepalive');

class TeamspeakQuery extends EventEmitter {

  /**
   * Create a new Query Client
   *
   * @class
   *
   * @param      {String}  [host=127.0.0.1]  The IP of your teamspeak server
   * @param      {Number}  [port=10011]      The port of your teamspeak server
   * @param      {Object}  [options={}]      Passed to net.Socket.connect
   */
  constructor(host, port, options) {
    super();

    let sock = this.sock = new net.Socket(),
        connectOptions = Object.assign({ }, options, {
          'host': host || '127.0.0.1',
          'port': port || 10011
        });

    this.queue = [ ];
    this._current = null;
    this._statusLines = 0;

    this.host = connectOptions.host;
    this.port = connectOptions.port;

    this.throttle = new Throttle({
      'max': 10,
      'per': 3000,
      'enable': connectOptions.host !== '127.0.0.1' && connectOptions.host !== 'localhost'
    });

    this.keepalive = new KeepAlive(() => this.send('version'));
    this.keepalive.enable(false);

    sock.connect(connectOptions);

    sock.on('connect', () => {
      this.keepalive.enable(true);

      this.carrier = carrier.carry(sock);
      this.carrier.on('line', this.handleLine.bind(this));
    });
  }

  /**
   * Send a command to the server
   *
   * @return     {Promise}  Promise resolves if the command executes
   *                        successfully, rejects if an error code is
   *                        returned.
   */
  send() {
    let cmdString = TeamspeakQuery.assembleCommandString.apply({ }, Array.from(arguments)),
        promise = new Promise((resolve, reject) =>
          this.queue.push({ 'cmd': cmdString, resolve, reject }) );

    if(this._statusLines > 1) 
      this.checkQueue();

    return promise;
  }

  /**
   * Checks the queue and runs the first command if nothing else is running
   */
  checkQueue() {
    this.throttle.run(() => {
      if(!this._current && this.queue.length) {
        this.keepalive.interrupt();

        this._current = this.queue.shift();
        this.sock.write(this._current.cmd + '\n');
      }
    });
  }

  /**
   * Handle each line sent by the server
   *
   * @param      {String}  line    The line sent by the server
   */
  handleLine(line) {
    if(this._statusLines < 2) {
      this._statusLines++;

      if(this._statusLines === 2) 
        this.checkQueue();
    } else {
      line = line.trim();

      let response = TeamspeakQuery.parse(line);

      if(!response) 
        return;

      if(response.type && response.type.indexOf('notify') === 0)
        this.emit(response.type.slice(6), response.params, line);
      else if(response.type && response.type === 'error') {
        if(response.params.id == 0) 
          this._current.resolve(this._current.data || response.params);
        else 
          this._current.reject(response.params);

        this._current = null;
      } else if(this._current)
        this._current.data = response.params;

      this.checkQueue();
    }
  }

  /**
   * Parse a server response into an object
   *
   * @param      {string}  str     The string to parse
   * @return     {Object}  The type and params of the response. Returns null
   *                       if parsing fails.
   */
  static parse(str) {
    let parsed = str.match(/(^error|^notify\w+|\w+(=[^\s\|]+)?)/gi);

    if(parsed) {
      let resType = parsed[0].indexOf('=') === -1 ? parsed.shift() : null, // Only shift if the server responds with 'error' or 'notify'
          params = { };

      parsed.forEach(v => {
        let index = v.indexOf('='),
            key = v.substring(0, index),
            value = TeamspeakQuery.unescape( v.substring(index + 1) );

        if(index === -1) {
          key = value;
          value = undefined;
        }

        if(key in params) {
          if(type(params[key]) !== 'array') 
            params[key] = [ params[key], value ];
          else
            params[key].push(value);
        } else
          params[key] = value;
      });

      params.raw = () => str;

      return { 'type': resType, params };

    } else
      return null;
  }

  /**
   * Converts the arguments into an according command string
   *
   * @return     {String}  The command string
   */
  static assembleCommandString() {
    let args = Array.from(arguments),
      cmd = args.shift(),
      cmdStringParts = [ cmd ];

    args.forEach(arg => {
      if(type(arg) === 'object') {
        for(let key in arg) {
          let val = arg[key];

          if(type(val) === 'array')
            val = val.map(v => TeamspeakQuery.escape(key) + '=' + TeamspeakQuery.escape(v) ).join('|');
          else
            val = TeamspeakQuery.escape(key) + '=' + TeamspeakQuery.escape(val);

          cmdStringParts.push(val);
        }
      } else
        cmdStringParts.push(arg);
    });

    return cmdStringParts.join(' ');
  }

  /**
   * Escape a String according to the specs
   *
   * @static
   *
   * @param      {String}  str     The string to escape
   * @return     {String}  The escaped string
   */
  static escape(str) {
    return String(str).replace(/\\/g, '\\\\')
      .replace(/\//g, '\\/')
      .replace(/\|/g, '\\p')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\v/g, '\\v')
      .replace(/\f/g, '\\f')
      .replace(/ /g, '\\s');
  }

  /**
   * Unescape a String according to the specs
   *
   * @static
   *
   * @param      {string}  str     The string
   * @return     {string}  The unescaped string
   */
  static unescape(str) {
    return String(str).replace(/\\\\/g, '\\')
      .replace(/\\\//g, '/')
      .replace(/\\p/g, '|')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\v/g, '\v')
      .replace(/\\f/g, '\f')
      .replace(/\\s/g, ' ');
  }
}

module.exports = TeamspeakQuery;