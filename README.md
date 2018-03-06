# teamspeak-query [![npm version](https://badge.fury.io/js/teamspeak-query.svg)](https://badge.fury.io/js/teamspeak-query)
A small, promise-based library for talking to your Teamspeak-Server via the [Teamspeak Server Query](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf). See for yourself:

```javascript
const TeamspeakQuery = require('teamspeak-query');
const query = new TeamspeakQuery('127.0.0.1', 10011);

query.send('login', 'serveradmin', 'changeme')
  .then(() => query.send('use', 1))
  .then(() => query.send('servernotifyregister', { 'event': 'server' }))
  .then(() => console.log('Done! Everything went fine'))
  .catch(err => console.error('An error occured:', err));

// After teamspeak has processed 'servernotifyregister',
// we will get notified about any connections
query.on('cliententerview', data =>
  console.log(data.client_nickname, 'connected') );
```

## Installation
```shell
$ npm install teamspeak-query
```
**Upgrading**: If you are upgrading to a newer version of `teamspeak-query`, take a look at [the changelog](https://github.com/schroffl/teamspeak-query/releases) to find out what needs to be done on your side. I will try to keep this process as simple as possible with future releases.

## Constructor
The constructor takes 3 parameters. If you want to make use of the `connect` options you have to specify host and port.

| Name    | Default     | Description                                     |
| ------- | ----------- | ----------------------------------------------- |
| host    | `127.0.0.1` | The ip of the server                            |
| port    | `10011`     | The query port of the server                    |
| options | `{ }`       | Any options that should be passed to [`net.Socket.connect`](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener) |

**INFO**: The raw socket can be accessed via the instance's `sock` property.


## Sending Commands
#### TeamspeakQuery.send(cmd, params?, ...flags?)
Sends a command to the server and returns a Promise that resolves the response or rejects if something went wrong.

There are 2 ways, which can also be mixed, to specify parameters for the command:
* **params**: An object, e.g. `{ 'parameter': 'value', 'x': 42 }`.
* **flags**: Plain arguments passed to the function, e.g. `query.send('login', 'username', 'password')`.  
You can also use it to set flags, e.g. `query.send('clientlist', '-uid')`.

If you want your response to be an array, e.g. for commands like `clientlist`, take a look at [Issue #3](https://github.com/schroffl/teamspeak-query/issues/3#issuecomment-359252099).

## Throttling
Commands are being throttled by default if the host is not set to the local machine (`127.0.0.1` or `localhost`) in order to prevent a ban for flooding (see [Whitelisting and Blacklisting](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf?#page=6) in the specs).  
The instance of [lib/throttle.js](lib/throttle.js) can be accessed via `TeamspeakQuery.throttle`.  
If you want to disable throttling, you can do it like this: `TeamspeakQuery.throttle.set('enable', false)`.
