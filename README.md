# teamspeak-query [![npm version](https://badge.fury.io/js/teamspeak-query.svg)](https://badge.fury.io/js/teamspeak-query)
A small, promise-based library for talking to your Teamspeak-Server via the [Teamspeak Server Query](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf). See for yourself:
<a name="usage-example"></a>
```javascript
const TeamspeakQuery = require('teamspeak-query');
const query = new TeamspeakQuery.Raw();

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

## TeamspeakQuery.Raw
The constructor takes a single object with some options.

| Name         | Default     | Description                         |
| ------------ | ----------- | ----------------------------------- |
| options      | `{}`        | Passed to [`net.Socket.connect`](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener) |
| options.host | `127.0.0.1` | The ip of the server                |
| options.port | `10011`     | The query port of the server        |

The underlying TCP socket can be accessed via the `sock` property.

## TeamspeakQuery.SSH
When using SSH you won't need to authenticate via the `login`-command, because, unlike with `TeamspeakQuery.Raw`,
this is done when establishing the connection.

| Name         | Default     | Description                         |
| ------------ | ----------- | ----------------------------------- |
| options      | `{}`        | Passed to [`ssh2.Client.connect`](https://www.npmjs.com/package/ssh2#client-methods) |
| options.host | `127.0.0.1` | The ip of the server                |
| options.port | `10011`     | The query port of the server        |
| options.username | none    | The username                        |
| options.password | none    | The password                        |

The underlying [ssh2.Client](https://www.npmjs.com/package/ssh2#client) instance can be accessed via the `client` property.

[The first Example](#usage-example), but via SSH:

```javascript
const query = new TeamspeakQuery.SSH({ username: 'serveradmin', password: 'changeme' });

// We can omit the login command
query.send('use', 1)
  .then(() => query.send('servernotifyregister', { 'event': 'server' }))
  .then(() => console.log('Done! Everything went fine'))
  .catch(err => console.error('An error occured:', err))

query.on('cliententerview', data =>
  console.log(data.client_nickname, 'connected') );
```

## Sending Commands
#### TeamspeakQuery.send(cmd, params?, ...arguments?)
Sends a command to the server and returns a Promise that resolves the response or rejects if something went wrong.

There are 2 ways, which can also be mixed, to specify parameters for the command:
* **params**: An object, e.g. `{ 'parameter': 'value', 'x': 42 }`.
* **arguments**: Plain arguments passed to the function, e.g. `query.send('login', 'username', 'password')`.
You can also use it to set flags, e.g. `query.send('clientlist', '-uid', '-ip')`.

If you want your response to be an array, e.g. for commands like `clientlist`, take a look at [Issue #3](https://github.com/schroffl/teamspeak-query/issues/3#issuecomment-359252099).

## Keep-Alive
A keep-alive mechanism is implemented to prevent the server from closing the connection after inactivity. It basically just sends a `version` command every few minutes (This doesn't require authentication and has a very small overhead).
If you want to tune its parameters, you can access the `keepalive` property of your `TeamspeakQuery` instance:
  - Enable: `query.keepalive.enable()`
  - Disable: `query.keepalive.disable()`
  - Set the interval to `x` seconds: `query.keepalive.setDuration(x)`  
    The default value is 5 minutes (300 seconds).

## Throttling
Commands are being throttled by default to prevent a ban for flooding (see [Whitelisting and Blacklisting](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf?#page=6) on page 6 in the specs).
The instance of [lib/throttle.js](lib/throttle.js) can be accessed via `query.throttle`.
If you want to disable throttling, you can do it like this: `query.throttle.set('enable', false)`.

## File Handling
For interacting with files in Teamspeak channels, you can use the [`teamspeak-filesystem package`](https://github.com/schroffl/teamspeak-filesystem).
