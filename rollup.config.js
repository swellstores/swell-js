import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';

const input = ["./src/api.js"];

export default [
// UMD, browser-friendly
	{
		input,
		output: {
			name: 'swell-js',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			del({ targets: 'dist/*' }),
			resolve(),
			commonjs({
				include: 'node_modules/**',
			}),
			terser()
		]
	},
  // CommonJS for Node,
  // ES modules for bundlers
  {
		input,
		// external: ['deepmerge', 'isomorphic-fetch', 'lodash', 'object-keys-normalizer', 'qs', '@babel/runtime'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' },
		],
		
    plugins: [commonjs(), resolve()],
	}
]