'use strict';

const TeamspeakQuery = require('../index');
const query = new TeamspeakQuery(process.argv[4] || '127.0.0.1', process.argv[5] || 10011);

query.send('login', process.argv[2], process.argv[3])
	.then(() => query.send('use', 1))
	.then(() => query.send('servernotifyregister', { 'event': 'server' }))
	.then(() => console.log('Done! Everything went fine'))
	.catch(err => console.error('An error occured:', err));

// After teamspeak has processed 'servernotifyregister' we will get notified about any connections
query.on('cliententerview', data =>
	console.log(data.client_nickname, 'connected') );