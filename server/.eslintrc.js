'use strict';

module.exports = {
	env: {
		es6: true,
		node: true
	},
	extends: [
		'plugin:@typescript-eslint/recommended',
		'eslint:recommended'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		project: './tsconfig.json'
	},
	rules: {
		indent: [ 'error','tab' ],
		'linebreak-style': [ 'error', 'unix' ],
		quotes: [ 'error', 'single' ],
		semi: [ 'error', 'always' ],
		'@typescript-eslint/indent': [ 'error', 'tab' ]
	},
	plugins: [
		'@typescript-eslint'
	]
};
