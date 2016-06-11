# teamspeak-query [![npm version](https://badge.fury.io/js/teamspeak-query.svg)](https://badge.fury.io/js/teamspeak-query)
A small library which exposes an API to talk to your Teamspeak-Server via the [Teamspeak-ServerQuery](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf)

# Installation
```shell
$ npm install teamspeak-query
```

# Example
```javascript
const TeamspeakQuery = require('teamspeak-query');
const query = new TeamspeakQuery('127.0.0.1', 10011);

query.send('login', 'serveradmin', 'changeme')
	.then(() => query.send('use', 1))
	.then(() => query.send('servernotifyregister', { 'event': 'server' }))
	.then(() => console.log('Done! Everything went fine'))
	.catch(err => console.error('An error occured:', err));

// After teamspeak has processed 'servernotifyregister' we will get notified about any connections
query.on('cliententerview', data =>
	console.log(data.client_nickname, 'connected') );
```

## Constructor
The constructor takes 3 parameters  

| Name    | Default     | Description                                     |
| ------- | ----------- | ----------------------------------------------- |
| host    | `127.0.0.1` | The ip of the server                            |
| port    | `10011`     | The query port of the server                    |
| options | `{ }`       | Any options that should be passed to the socket |

**INFO**: The raw socket can be accessed via the instance's `sock` property.


## Methods
#### TeamspeakQuery.send(cmd, params?, ...flags)
Send a command to the server.  
There are 2 ways (which can also be mixed) to specify parameters for the command:
* **params**: An object, e.g. `{ 'parameter': 'value', 'x': 42 }`. Only works if the 2nd argument is an object.
* **...flags**: Plain arguments passed to then function, e.g. `query.send('login', 'username', 'password')`.  
You can also use it to set flags, e.g. `query.send('clientlist', '-uid')`.

#### TeamspeakQuery#parse(str)
Parse the response of the server, returns an object that contains the type of the response (error, notification, etc.) and 
the parameters that were returned by the server.

#### TeamspeakQuery#escape(str)
Escape a string accordings to [the specification](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf#page=5).

#### TeamspeakQuery#unescape(str)
Unescape a string accordings to [the specification](http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf#page=5).