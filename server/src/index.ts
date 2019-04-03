import { createServer, Socket } from 'net';
import { createInterface } from 'readline';

export interface Packet {
	id: number;
	type: 'call' | 'return' | 'error';
	meta?: string;
	body?: object | string;
}

export interface Ref {
	id: string;
}

export const process = (data: Packet): Packet => {
	if (data.type === 'call') {
		if (typeof data.body === 'string') {
			if (data.meta === 'eval') {
				return {
					id: data.id,
					type: 'return',
					body: eval(data.body)
				};
			}
		}
		return {
			id: data.id,
			type: 'error',
			body: 'Call type unknown: ' + data.meta
		};
	}
	return {
		id: data.id,
		type: 'error',
		body: 'Request type not found'
	};
};

export const refs: Ref[] = [];

export const connections: Socket[] = [];

export const server = createServer(conn => {

	connections.push(conn);

	conn.on('error', err =>
		// eslint-disable-next-line no-console
		console.error(err.message));

	const rl = createInterface({ input: conn });
	// eslint-disable-next-line no-console
	rl.on('line', line => {
		try {
			const packet = JSON.parse(line);
			const response = process(packet);
			conn.write(JSON.stringify(response) + '\n');
		} catch (err) {
			conn.end();
		}
		conn.write(JSON.stringify(process(JSON.parse(line))) + '\n')
	});

	conn.once('close', () =>
		connections.splice(connections.indexOf(conn), 1));

}).listen(3000);

export default server;
