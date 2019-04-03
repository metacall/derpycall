'use strict';

const Socket = require('netlinkwrapper');

class SyncEmitter {
	constructor() {
		this.handlers = {};
	}

	init(event) {
		// eslint-disable-next-line no-return-assign
		return this.handlers[event] = this.handlers[event] || [];
	}

	emit(event, data) {
		const handlers = this.init(event);
		handlers.forEach(handler => handler(data));
		return this.cleanup(event);
	}

	on(event, handler) {
		const handlers = this.init(event);
		return handlers.push(handler);
	}

	cleanup(event) {
		if (this.handlers[event] && this.handlers[event].length === 0) {
			delete this.handlers[event];
		}
	}

	remove(event, handler = null) {
		const handlers = this.handlers[event] || [];
		if (!handler) {
			handlers.splice(0, Infinity);
			return this.cleanup(event);
		}
		const index = handlers.indexOf(handler);
		if (index > 0) {
			handlers.splice(index, 1);
		}
		return this.cleanup(event);
	}

	once(event, handler) {
		const handlers = this.init(event);
		handlers.push(x => {
			this.remove(event, handler);
			return handler(x);
		});
	}
}

const line = sock => {
	let buf = '';
	let c = '';
	while (c !== '\n') {
		buf += c;
		c = sock.read(1);
	}
	return buf;
};

const read = sock =>
	JSON.parse(line(sock));

const send = (sock, data) =>
	sock.write(JSON.stringify(data) + '\n');

const ID = (i = 0) =>
	// eslint-disable-next-line no-plusplus, no-param-reassign
	() => ++i;


const id = ID();
const packets = new SyncEmitter();
const sock = new Socket();
sock.connect(3000);

const call = (sock, data, cb) => {
	const i = id();
	const cleanup = () => {
		packets.remove('return:' + i);
		packets.remove('error:' + i);
	};
	packets.once('return:' + i, x => {
		cleanup();
		return cb(x);
	});
	packets.once('error:' + i, x => {
		cleanup();
		return cb(x);
	});
	return send(sock, { ...data, id: i });
};

const run = () => {
	while (true) {
		const packet = read(sock);
		if (packet.type === 'return' || packet.type === 'error') {
			packets.emit(packet.type + ':' + packet.id, packet);
		}
		if (packet.type === 'call') {
			console.log('received call:', packet);
		}
	}
};

if (require.main === module) {
	const args = process.argv.slice(2);
	const [ type, meta, ...raw ] = args;
	const body = raw.join(' ');
	call(sock, {
		type,
		meta,
		body
	}, x => {
		if (x.type === 'return') {
			console.log('> ' + JSON.stringify(x.body));
		}
		if (x.type === 'error') {
			console.error('ERROR> ' + JSON.stringify(x.body));
		}
		// eslint-disable-next-line no-process-exit
		process.exit();
	});

}

run();
