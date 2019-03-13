'use strict';

const axios = require('axios');

const [ url ] = process.argv.slice(2);

axios.post(url, process.stdin, { responseType: 'stream' })
	.then(res => res.data)
	.then(res => res.pipe(process.stdout))
	.catch(err => process.stdout.write(JSON.stringify({
		ok: false,
		error: err.message
	})));
