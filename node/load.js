'use strict';

const { URL } = require('url');
const { spawnSync } = require('child_process');

// derpy://<ip / hostname>:<pid>/<uuid>

const parse = uri =>
	(({ host }) => `http://${host}`)
	(new URL(uri));

const post = (url, data) => {
	const res = JSON.parse(spawnSync('node', [ 'req', url ], {
		cwd: __dirname,
		input: JSON.stringify(data),
		encoding: 'utf8'
	}).stdout.trim());
	if (!res.ok) {
		throw new Error(res.error);
	}
	return res.value;
};

const wrap = base => new Proxy(
	(...args) => post(`${base}/call/`, args),
	{
		// getPrototypeOf: () => { throw new TypeError('Not implemented'); },
		// setPrototypeOf: () => { throw new TypeError('Not implemented'); },
		// isExtensible: () => { throw new TypeError('Not implemented'); },
		// preventExtensions: () => { throw new TypeError('Not implemented'); },
		// getOwnPropertyDescriptor: () => { throw new TypeError('Not implemented'); },
		// defineProperty: () => { throw new TypeError('Not implemented'); },
		has: (t, prop) => post(`${base}/hasProp`, prop),
		get: (t, prop) => post(`${base}/getProp`, prop),
		set: (t, k, v) => post(`${base}/setProp`, [ k, v ]),
		// deleteProperty: () => { throw new TypeError('Not implemented'); },
		// ownKeys: () => { throw new TypeError('Not implemented'); },
		apply: (t, self, args) => post(`${base}/call/`, args)
		// construct: () => { throw new TypeError('Not implemented'); }
	});

const main = uri => wrap(parse(uri));

module.exports = main;

if (require.main === module) {
	const m = main(process.argv[2]);
	global.m = m;
	require('repl').start({ useGlobal: true });
}
