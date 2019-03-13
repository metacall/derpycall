'use strict';

const { resolve } = require('path');
const express = require('express');

const [ port, file ] = process.argv.slice(2);

const wrapped = require(resolve(file));

const app = express();

app.use(express.json({ strict: false, type: '*/*' }));

const op = f => async (req, res) => {
	try {
		return res.json({ ok: true, value: await f(req.body) });
	} catch (err) {
		return res.json({ ok: false, error: err.message });
	}
};

app.post('/call', op(x => {
	console.log(x);
	return wrapped(...x);
}));

app.post('/hasProp', op(x => x in wrapped));

app.post('/getProp', op(x => wrapped[x]));

app.post('/setProp', op(([ k, v ]) => wrapped[k] = v));

app.listen(port);
