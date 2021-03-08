import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import {
  terser,
} from 'rollup-plugin-terser';
import pkg from './package.json';

const input = ["./src/api.js"];
const external = Object.keys(pkg.dependencies);

console.log(external);

export default [
// UMD, browser-friendly
	{
		input,
    external,
		output: {
			name: 'swell-js',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
      del({ targets: 'dist/*' }),
      globals(),
      builtins(),
      resolve(),
      terser(),
      commonjs({ include: 'node_modules/**' }),
      filesize(),
    ]
	},
  // CommonJS for Node,
  // ES modules for bundlers
  {
		input,
		external,
		output: [
			{ file: pkg.main, format: 'cjs', exports: 'default' },
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
      globals(),
      builtins(),
      resolve(),
      commonjs({ include: 'node_modules/**' }),
      filesize(),
    ]
	}
]