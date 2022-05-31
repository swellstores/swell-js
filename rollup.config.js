import nodePolyfills from 'rollup-plugin-polyfill-node';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const deps = Object.keys(pkg.dependencies);
const external = (id) => deps.filter((dep) => id.startsWith(dep)).length;

export default [
  {
    input: {
      'utils/index': './src/utils/index.js',
      account: './src/account.js',
      api: './src/api.js',
      attributes: './src/attributes.js',
      cache: './src/cache.js',
      card: './src/card.js',
      cart: './src/cart.js',
      categories: './src/categories.js',
      content: './src/content.js',
      cookie: './src/cookie.js',
      currency: './src/currency.js',
      locale: './src/locale.js',
      payment: './src/payment.js',
      products: './src/products.js',
      settings: './src/settings.js',
      subscriptions: './src/subscriptions.js',
      index: './src/index.js',
    },
    external,
    output: { dir: './dist', entryFileNames: '[name].js' },
    plugins: [
      nodePolyfills(),
      resolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs({ include: 'node_modules/**' }),
      filesize(),
    ],
  },
  {
    input: './src/api.js',
    output: [
      {
        name: 'swell-js',
        file: pkg.browser,
        format: 'umd',
        sourcemap: true,
        plugins: [terser()],
        exports: 'default',
      },
    ],
    plugins: [
      nodePolyfills(),
      resolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs({ include: 'node_modules/**' }),
      filesize(),
    ],
  },
];
