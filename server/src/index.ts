import { createServer, Socket } from 'net';
import { createInterface } from 'readline';

const connections: Socket[] = [];

const server = createServer(conn => {

	connections.push(conn);

	conn.on('error', err =>
		// eslint-disable-next-line no-console
		console.error(err.message));

	const rl = createInterface({ input: conn });
	// eslint-disable-next-line no-console
	rl.on('line', console.log);

	conn.once('close', () =>
		connections.splice(connections.indexOf(conn), 1));

}).listen(3000);

export default server;
