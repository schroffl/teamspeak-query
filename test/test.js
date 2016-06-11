'use strict';

const TeamspeakQuery = require('../index');

let test = new TeamspeakQuery('127.0.0.1', 10011);

test.sock.on('connect', () => {
	test.send('login', process.argv[2], process.argv[3]) // Login 
		.then(() => test.send('use', { 'sid': 1 })) // Set the virtual server
		.then(() => test.send('servernotifyregister', { 'event': 'server' })) // Notify me on any events
		.then(() => test.send('channellist', '-uid')) // List all clients and their unique ids
		.then(console.log) // Log the response of the last command
		.catch(console.error); // Log any errors
});

// Log a clients nickname on connection
test.on('cliententerview', data =>
	console.log(data.client_nickname, 'connected') );